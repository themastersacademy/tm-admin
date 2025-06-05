"use server";
import { dynamoDB } from "../awsAgent";

export default async function deleteQuestion({ questionID, subjectID }) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    Key: {
      pKey: `QUESTION#${questionID}`,
      sKey: `QUESTIONS@${subjectID}`,
    },
  };

  try {
    await dynamoDB.delete(params).promise();
    return {
      success: true,
      message: "Question deleted successfully",
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
