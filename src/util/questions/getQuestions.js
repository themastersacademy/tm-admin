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
export default async function getQuestions({
  type,
  difficulty,
  subjectID,
  searchTerm,
  limit = 10,
  lastKey = null,
}) {
  console.log(searchTerm);

  // Build the base FilterExpression for sKey.
  // If a subjectID is provided, the prefix becomes "QUESTIONS@<subjectID>"; otherwise, it defaults to "QUESTIONS@".
  let filterExp = "begins_with(sKey, :prefix)";
  const expAttrVals = {
    ":prefix": subjectID ? `QUESTIONS@${subjectID}` : "QUESTIONS@",
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

  // Add difficulty filter if provided.
  if (difficulty) {
    filterExp += " AND difficulty = :difficulty";
    expAttrVals[":difficulty"] = difficulty;
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
    console.log(result);
    // Sort the items by createdAt in descending order so that the most recent questions appear first.
    const sortedItems = result.Items.sort((a, b) => b.createdAt - a.createdAt);

    return {
      success: true,
      message: "Questions fetched successfully",
      data: sortedItems.map((item) => ({
        id: item.pKey.split("#")[1],
        subjectID: item.sKey.split("@")[1],
        title: item.title,
        type: item.type,
        options: item.options,
        difficulty: item.difficulty,
        correctAnswers: item.correctAnswers, // or correctAnswers if that's your field name
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
