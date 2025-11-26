import { dynamoDB } from "../awsAgent";
import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { updateSubject } from "../subjects/createSubject";

const TABLE_NAME = `${process.env.AWS_DB_NAME}content`;

/**
 * Batch‑writes an array of already‑sanitized question objects into DynamoDB.
 * Splits into chunks of 25 (DynamoDB limit) and returns per‑item results.
 *
 * @param {Array<Object>} questions – each must have:
 *   { subjectID, title, difficultyLevel, type, options, answerKey, blanks, solution }
 * @returns {Promise<Array<{ success: boolean, id?: string, error?: string }>>}
 */
export async function batchAddQuestions(questions) {
  // Helper to build a single PutRequest
  const toPutRequest = (q) => {
    const now = Date.now();
    const pKey = `QUESTION#${randomUUID()}`;
    const sKey = `QUESTIONS@${q.subjectID}`;
    const gsi1pKey = `QUESTIONS`;
    const gsi1sKey = `QUESTIONS`;

    return {
      PutRequest: {
        Item: {
          pKey,
          sKey,
          title: q.title,
          titleLower: q.title.toLowerCase(),
          difficultyLevel: q.difficultyLevel,
          type: q.type,
          options: q.options,
          answerKey: q.answerKey,
          blanks: q.blanks,
          solution: q.solution,
          isDeleted: false,
          rand: Math.random(),
          "GSI1-pKey": gsi1pKey,
          "GSI1-sKey": gsi1sKey,
          createdAt: now,
          updatedAt: now,
        },
      },
    };
  };

  // Chunk into batches of max 25
  const BATCH_SIZE = 25;
  const batches = [];
  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    batches.push(questions.slice(i, i + BATCH_SIZE));
  }

  const results = [];
  for (const batch of batches) {
    const requestItems = {
      [TABLE_NAME]: batch.map(toPutRequest),
    };
    try {
      const resp = await dynamoDB.send(
        new BatchWriteCommand({ RequestItems: requestItems })
      );

      // Unprocessed items, if any
      const unproc = resp.UnprocessedItems?.[TABLE_NAME] || [];
      // Successes = batch.length – unproc.length
      batch.forEach((q, idx) => {
        const thisReq = requestItems[TABLE_NAME][idx];
        const putKey = thisReq.PutRequest.Item.pKey;
        const wasUnproc = unproc.some((u) => u.PutRequest.Item.pKey === putKey);
        if (wasUnproc) {
          results.push({ success: false, error: "Unprocessed by DynamoDB" });
        } else {
          results.push({ success: true, id: putKey.split("#")[1] });
        }
      });
    } catch (err) {
      // If the whole batch failed
      batch.forEach(() => {
        results.push({
          success: false,
          error: err.message || "BatchWrite failed",
        });
      });
    }
  }

  // Update subject totalQuestions
  await updateSubject({
    subjectID: questions[0].subjectID,
    totalQuestions: questions.length,
  });

  return results;
}
