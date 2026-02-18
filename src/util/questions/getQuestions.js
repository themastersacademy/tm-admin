"use server";
import { dynamoDB } from "../awsAgent";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

/**
 * Fetches questions with optional filters for type, difficulty, subjectID, and title search.
 * Supports pagination using a limit and lastKey (LastEvaluatedKey).
 *
 * @param {Object} params - The parameters for fetching questions.
 * @param {string} [params.type] - (Optional) Filter by question type (e.g., "MCQ", "MSQ", "FIB").
 * @param {string} [params.difficulty] - (Optional) Filter by difficulty ("easy", "medium", "hard").
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
  // Build the base FilterExpression.
  // Questions have sKey = QUESTION#<id> and pKey = SUBJECT#<subjectID>.
  // When filtering by subjectID, we match on pKey prefix; otherwise we match all QUESTION# sKeys.
  let filterExp = subjectID
    ? "pKey = :pKey AND begins_with(sKey, :prefix)"
    : "begins_with(sKey, :prefix)";
  const expAttrVals = {
    ":prefix": "QUESTION#",
    ...(subjectID && { ":pKey": `SUBJECT#${subjectID}` }),
  };
  const expAttrNames = {};

  // Add searchTerm filter if provided.
  if (searchTerm) {
    filterExp += " AND contains(titleLower, :searchTerm)";
    expAttrVals[":searchTerm"] = searchTerm.toLowerCase();
  }

  // Add type filter if provided.
  if (type) {
    filterExp += " AND #type = :type";
    expAttrNames["#type"] = "type"; // 'type' is a reserved word, so we alias it.
    expAttrVals[":type"] = type;
  }

  // Add difficulty filter if provided (DB field is difficultyLevel, not difficulty).
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
      data: sortedItems.map((item) => ({
        id: item.sKey.split("#")[1], // sKey = QUESTION#<id>
        subjectID: item.pKey.split("#")[1], // pKey = SUBJECT#<subjectID>
        title: item.title,
        type: item.type,
        options: item.options,
        difficulty: item.difficultyLevel, // DB field is difficultyLevel
        correctAnswers: item.correctAnswers,
        solution: item.solution,
        subjectTitle: item.subjectTitle,
        ...(item.type === "FIB" && { noOfBlanks: item.noOfBlanks }),
      })),
      lastEvaluatedKey: result.LastEvaluatedKey || null,
    };
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw new Error("Error fetching questions");
  }
}
