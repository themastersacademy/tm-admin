import { dynamoDB } from "../awsAgent";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export default async function getAllSubjects() {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    FilterExpression: "sKey = :sKey",
    ExpressionAttributeValues: {
      ":sKey": "METADATA",
    },
  };
  try {
    const response = await dynamoDB.send(new ScanCommand(params));
    return {
      success: true,
      message: "Subjects fetched successfully",
      data: {
        subjects: response.Items.map((subject) => ({
          subjectID: subject.pKey.split("#")[1],
          title: subject.title,
          createdAt: subject.createdAt,
          updatedAt: subject.updatedAt,
          totalQuestions: subject.totalQuestions,
        })),
      },
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
