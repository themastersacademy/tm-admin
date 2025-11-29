import { dynamoDB } from "../awsAgent";
import { TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

export default async function addQuestion(questionData) {
  const {
    subjectID,
    title,
    type,
    difficultyLevel,
    options,
    answerKey,
    blanks,
    solution,
  } = questionData;

  const now = Date.now();
  const questionID = randomUUID();

  // New Schema:
  // PK: SUBJECT#<subjectID>
  // SK: QUESTION#<questionID>
  // GSI1-PK: ALL_QUESTIONS
  // GSI1-SK: TIMESTAMP#<now>

  const questionItem = {
    pKey: `SUBJECT#${subjectID}`,
    sKey: `QUESTION#${questionID}`,
    "GSI1-pKey": "ALL_QUESTIONS",
    "GSI1-sKey": `TIMESTAMP#${now}`,
    title,
    titleLower: title.toLowerCase(),
    type,
    difficultyLevel,
    options,
    answerKey,
    blanks,
    solution,
    createdAt: now,
    updatedAt: now,
  };

  const params = {
    TransactItems: [
      {
        Put: {
          TableName: `${process.env.AWS_DB_NAME}content`,
          Item: questionItem,
        },
      },
      {
        Update: {
          TableName: `${process.env.AWS_DB_NAME}content`,
          Key: {
            pKey: `SUBJECT#${subjectID}`,
            sKey: "METADATA",
          },
          UpdateExpression: "ADD totalQuestions :inc",
          ExpressionAttributeValues: {
            ":inc": 1,
          },
        },
      },
    ],
  };

  try {
    await dynamoDB.send(new TransactWriteCommand(params));
    return {
      success: true,
      message: "Question added successfully",
      data: {
        questionID,
        subjectID,
      },
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
