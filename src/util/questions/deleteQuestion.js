"use server";
import { dynamoDB } from "../awsAgent";
import { updateSubject } from "../subjects/createSubject";

export default async function deleteQuestion({ questionID, subjectID }) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    Key: {
      pKey: `QUESTION#${questionID}`,
      sKey: `QUESTIONS@${subjectID}`,
    },
  };

  const subjectResp = await dynamoDB
    .get({
      TableName: `${process.env.AWS_DB_NAME}content`,
      Key: { pKey: `SUBJECT#${subjectID}`, sKey: "SUBJECTS" },
    })
    .promise();

  try {
    await dynamoDB.delete(params).promise();
    await updateSubject({
      subjectID,
      totalQuestions: subjectResp.Item.totalQuestions - 1,
    });
    return {
      success: true,
      message: "Question deleted successfully",
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
