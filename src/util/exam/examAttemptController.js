import { dynamoDB } from "../awsAgent";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

const USER_TABLE = `${process.env.AWS_DB_NAME}users`;
const USER_GSI_INDEX = "GSI1-index";

export async function getAllExamAttemptsByExamID(examID) {
  const allItems = []; // Array to store all fetched items
  let ExclusiveStartKey; // Used for pagination

  do {
    const params = {
      TableName: USER_TABLE,
      IndexName: USER_GSI_INDEX,
      KeyConditionExpression: "#gsi1pKey = :pKey",
      ExpressionAttributeNames: {
        "#gsi1pKey": "GSI1-pKey",
        "#type": "type",
        "#status": "status",
        "#duration": "duration",
      },
      ExpressionAttributeValues: {
        ":pKey": "EXAM_ATTEMPTS",
        ":examID": examID,
      },
      FilterExpression: "examID = :examID",
      ProjectionExpression: `pKey, userMeta, batchMeta,
                            title, #status, obtainedMarks,
                            totalMarks, totalAttemptedAnswers, totalCorrectAnswers,
                            totalWrongAnswers, totalSkippedAnswers, totalSections, startTimeStamp,
                            blobVersion, #duration, createdAt, #type, totalQuestions`,
      // Add ExclusiveStartKey for subsequent calls
      ExclusiveStartKey: ExclusiveStartKey,
    };

    // Use a try-catch block for better error handling
    try {
      const response = await dynamoDB.send(new QueryCommand(params));

      // Add the items from the current page to the allItems array
      allItems.push(...response.Items);

      // Get the key to start the next query from (if one exists)
      ExclusiveStartKey = response.LastEvaluatedKey;
    } catch (error) {
      console.error("Error querying DynamoDB:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  } while (ExclusiveStartKey); // Continue loop if LastEvaluatedKey is present

  console.log(allItems.length + " exam attempts (after pagination)");

  return {
    success: true,
    data: allItems,
  };
}
