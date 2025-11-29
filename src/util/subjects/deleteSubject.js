import { dynamoDB } from "../awsAgent";
import { QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

export default async function deleteSubject(subjectId) {
  if (!subjectId) {
    return {
      success: false,
      message: "Subject ID is required",
    };
  }

  const TABLE = `${process.env.AWS_DB_NAME}content`;
  const pKey = `SUBJECT#${subjectId}`;

  try {
    // 1. Check for questions in the Subject partition
    // We only need to know if ANY question exists, so Limit=1 is enough.
    const params = {
      TableName: TABLE,
      KeyConditionExpression: "pKey = :pk AND begins_with(sKey, :sk)",
      ExpressionAttributeValues: {
        ":pk": pKey,
        ":sk": "QUESTION#",
      },
      ProjectionExpression: "pKey",
      Limit: 1,
    };

    const result = await dynamoDB.send(new QueryCommand(params));

    if (result.Items && result.Items.length > 0) {
      return {
        success: false,
        message:
          "Cannot delete subject. It contains questions. Please delete all questions first.",
      };
    }

    // 2. If no questions, delete the Subject Metadata
    const deleteParams = {
      TableName: TABLE,
      Key: {
        pKey: pKey,
        sKey: "METADATA",
      },
      ConditionExpression: "attribute_exists(pKey)",
    };

    await dynamoDB.send(new DeleteCommand(deleteParams));

    return {
      success: true,
      message: "Subject deleted successfully",
    };
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      return {
        success: false,
        message: "Subject not found",
      };
    }
    console.error("DynamoDB Error in deleteSubject:", error);
    throw new Error("Internal server error");
  }
}
