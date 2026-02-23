import { dynamoDB } from "../awsAgent";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

export default async function renameBank({ bankID, title }) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    Key: {
      pKey: `BANK#${bankID}`,
      sKey: `BANKS`,
    },
    UpdateExpression: "SET title = :title, updatedAt = :updatedAt",
    ExpressionAttributeValues: {
      ":title": title,
      ":updatedAt": Date.now(),
    },
    ConditionExpression: "attribute_exists(pKey)",
    ReturnValues: "NONE",
  };

  try {
    await dynamoDB.send(new UpdateCommand(params));
    return {
      success: true,
      message: "Bank renamed successfully",
    };
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return {
        success: false,
        message: "Bank not found",
      };
    }
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
