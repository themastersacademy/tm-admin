"use server";
import { dynamoDB } from "../awsAgent";
import { GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { updateSubject } from "../subjects/createSubject";

export default async function deleteQuestion({ questionID, subjectID }) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    Key: {
      pKey: `SUBJECT#${subjectID}`,
      sKey: `QUESTION#${questionID}`,
    },
  };

  const subjectResp = await dynamoDB.send(
    new GetCommand({
      TableName: `${process.env.AWS_DB_NAME}content`,
      Key: { pKey: `SUBJECT#${subjectID}`, sKey: "METADATA" },
    })
  );

  try {
    await dynamoDB.send(new DeleteCommand(params));
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
