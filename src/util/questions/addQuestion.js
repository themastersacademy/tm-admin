"use server";
import { dynamoDB } from "../awsAgent";
import { randomUUID } from "crypto";

const TABLE_NAME = `${process.env.AWS_DB_NAME}content`;

/**
 * Validates and persists a new question to DynamoDB.
 * @param {object} questionData - Flat question schema:
 *   { subjectID, title, difficultyLevel, type, options, answerKey, blanks, solution }
 * @returns {Promise<{success: boolean, message: string, id: string}>}
 */

export async function addQuestion(questionData) {
  const {
    subjectID,
    title,
    difficultyLevel,
    type,
    options = [],
    answerKey = [],
    blanks = [],
    solution,
  } = questionData;

  const subjectResp = await dynamoDB
    .get({
      TableName: TABLE_NAME,
      Key: { pKey: `SUBJECT#${subjectID}`, sKey: "SUBJECTS" },
    })
    .promise();
  if (!subjectResp.Item) {
    throw new Error("Subject not found");
  }

  // Create keys using the specified format.
  const now = Date.now();
  const pKey = `QUESTION#${randomUUID()}`;
  const sKey = `QUESTIONS@${subjectID}`;
  const gsi1pKey = `QUESTIONS`;
  const gsi1sKey = `QUESTIONS`;

  const item = {
    pKey,
    sKey,
    title,
    titleLower: title.toLowerCase(),
    difficultyLevel,
    type,
    options,
    answerKey,
    "GSI1-pKey": gsi1pKey,
    "GSI1-sKey": gsi1sKey,
    blanks,
    solution,
    isDeleted: false,
    rand: Math.random(),
    createdAt: now,
    updatedAt: now,
  };

  await dynamoDB
    .put({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: "attribute_not_exists(pKey)",
    })
    .promise();

  return {
    success: true,
    message: "Question added successfully",
    id: pKey.split("#")[1],
  };
}
