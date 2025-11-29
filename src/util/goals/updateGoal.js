import { dynamoDB } from "../awsAgent";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

export default async function updateGoal(
  goalID,
  { title, icon, tagline, description }
) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: `GOAL#${goalID}`,
      sKey: "GOALS",
    },
    UpdateExpression:
      "set title = :t, icon = :i, tagline = :tag, description = :desc, updatedAt = :u",
    ExpressionAttributeValues: {
      ":t": title,
      ":i": icon,
      ":tag": tagline,
      ":desc": description,
      ":u": Date.now(),
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const result = await dynamoDB.send(new UpdateCommand(params));
    return {
      success: true,
      message: "Goal updated successfully",
      data: result.Attributes,
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
