import { dynamoDB } from "../awsAgent";
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

export default async function getSubject({ subjectID }) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    Key: {
      pKey: `SUBJECT#${subjectID}`,
      sKey: "METADATA",
    },
  };
  try {
    const response = await dynamoDB.send(new GetCommand(params));
    if (!response.Item) {
      return {
        success: false,
        message: "Subject not found",
      };
    }
    return {
      success: true,
      message: "Subject fetched successfully",
      data: {
        subjectID: response.Item.pKey.split("#")[1],
        title: response.Item.title,
        createdAt: response.Item.createdAt,
        updatedAt: response.Item.updatedAt,
        totalQuestions: response.Item.totalQuestions || 0,
      },
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
