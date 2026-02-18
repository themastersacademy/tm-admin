"use server";
import { dynamoDB } from "../awsAgent";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

/**
 * Fetches questions with optional filters for type, difficulty, subjectID, and title search.
 * Supports pagination using a limit and lastKey (LastEvaluatedKey).
 *
 * The DB has two key schemas (old and new):
 *   OLD: pKey = "QUESTIONS", sKey = "QUESTIONS@<subjectID>#QUESTION#<questionID>"
 *   NEW: pKey = "SUBJECT#<subjectID>", sKey = "QUESTION#<questionID>"
 *
 * Both are supported here so existing production data is not lost.
 *
 * @param {Object} params - The parameters for fetching questions.
 * @param {string} [params.type] - (Optional) Filter by question type (e.g., "MCQ", "MSQ", "FIB").
 * @param {string|number} [params.difficulty] - (Optional) Filter by difficulty ("easy", "medium", "hard").
 * @param {string} [params.subjectID] - (Optional) Filter by subject; used to narrow the sKey prefix.
 * @param {string} [params.searchTerm] - (Optional) A term to search within the question title.
 * @param {number} [params.limit=10] - (Optional) The number of questions per page.
 * @param {Object} [params.lastKey=null] - (Optional) The last evaluated key for pagination.
 * @returns {Promise<Object>} An object containing the fetched questions, pagination token, and a success message.
 */
// IMPORTANT: DynamoDB applies `Limit` BEFORE evaluating FilterExpression on a Scan.
// This means a page may return fewer items than `limit` even when more matching items exist.
// Always check `lastEvaluatedKey` to determine if more pages are available.
export default async function getQuestions({
  type,
  difficulty,
  subjectID,
  searchTerm,
  limit = 10,
  lastKey = null,
}) {
  // Support both key schemas:
  //   NEW: sKey begins_with "QUESTION#"  (pKey = SUBJECT#<subjectID>)
  //   OLD: sKey begins_with "QUESTIONS@" (pKey = "QUESTIONS")
  // When filtering by subjectID we narrow each schema separately.
  let filterExp;
  const expAttrVals = {};
  const expAttrNames = {};

  if (subjectID) {
    // NEW schema: pKey = SUBJECT#<subjectID>, sKey = QUESTION#...
    // OLD schema: pKey = "QUESTIONS", sKey = QUESTIONS@<subjectID>#...
    filterExp =
      "(pKey = :newPKey AND begins_with(sKey, :newPrefix))" +
      " OR (pKey = :oldPKey AND begins_with(sKey, :oldPrefix))";
    expAttrVals[":newPKey"] = `SUBJECT#${subjectID}`;
    expAttrVals[":newPrefix"] = "QUESTION#";
    expAttrVals[":oldPKey"] = "QUESTIONS";
    expAttrVals[":oldPrefix"] = `QUESTIONS@${subjectID}`;
  } else {
    // No subject filter — match all questions from both schemas
    filterExp =
      "begins_with(sKey, :newPrefix) OR begins_with(sKey, :oldPrefix)";
    expAttrVals[":newPrefix"] = "QUESTION#";
    expAttrVals[":oldPrefix"] = "QUESTIONS@";
  }

  // Add searchTerm filter if provided.
  if (searchTerm) {
    filterExp = `(${filterExp}) AND contains(titleLower, :searchTerm)`;
    expAttrVals[":searchTerm"] = searchTerm.toLowerCase();
  }

  // Add type filter if provided.
  if (type) {
    filterExp += " AND #type = :type";
    expAttrNames["#type"] = "type"; // 'type' is a reserved word in DynamoDB
    expAttrVals[":type"] = type;
  }

  // Add difficulty filter if provided.
  // Coerce to Number because some old records may have stored it as a string.
  if (difficulty) {
    filterExp += " AND difficultyLevel = :difficulty";
    expAttrVals[":difficulty"] = Number(difficulty);
  }

  // Prepare the DynamoDB scan parameters with the built filter expression.
  const params = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    // IndexName: "QuestionCreatedAtIndex",
    FilterExpression: filterExp,
    ExpressionAttributeValues: expAttrVals,
    Limit: limit,
    ReturnConsumedCapacity: "TOTAL",
  };

  if (Object.keys(expAttrNames).length > 0) {
    params.ExpressionAttributeNames = expAttrNames;
  }

  if (lastKey) {
    params.ExclusiveStartKey = lastKey;
  }

  try {
    // Execute the scan operation.
    const result = await dynamoDB.send(new ScanCommand(params));
    // Sort items by createdAt descending so the most recent questions appear first.
    const sortedItems = result.Items.sort((a, b) => b.createdAt - a.createdAt);

    return {
      success: true,
      message: "Questions fetched successfully",
      data: sortedItems.map((item) => {
        // Determine which schema this item uses and extract IDs accordingly.
        const isNewSchema = item.pKey?.startsWith("SUBJECT#");
        const questionID = isNewSchema
          ? item.sKey.split("#")[1] // QUESTION#<id>
          : item.sKey.split("#").pop(); // QUESTIONS@<subjectID>#QUESTION#<id> → take last segment
        const subjectIDFromKey = isNewSchema
          ? item.pKey.split("#")[1] // SUBJECT#<subjectID>
          : item.sKey.split("@")[1]?.split("#")[0]; // QUESTIONS@<subjectID>#...

        return {
          id: questionID,
          subjectID: subjectIDFromKey,
          title: item.title,
          type: item.type,
          options: item.options,
          // Coerce to Number — old records may have stored difficultyLevel as a string
          difficulty:
            item.difficultyLevel != null
              ? Number(item.difficultyLevel)
              : undefined,
          correctAnswers: item.correctAnswers,
          solution: item.solution,
          subjectTitle: item.subjectTitle,
          ...(item.type === "FIB" && { noOfBlanks: item.noOfBlanks }),
        };
      }),
      lastEvaluatedKey: result.LastEvaluatedKey || null,
    };
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw new Error("Error fetching questions");
  }
}
