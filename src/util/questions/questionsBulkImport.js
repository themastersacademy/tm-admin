import { dynamoDB } from "../awsAgent";
import {
  BatchWriteCommand,
  TransactWriteCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const TABLE_NAME = `${process.env.AWS_DB_NAME}content`;

/**
 * Batch‑writes an array of already‑sanitized question objects into DynamoDB.
 * Uses the NEW folder schema:
 *  - PK: SUBJECT#<subjectID>
 *  - SK: QUESTION#<questionID>
 *  - GSI1-PK: ALL_QUESTIONS
 *  - GSI1-SK: TIMESTAMP#<createdAt>
 *
 * @param {Array<Object>} questions – each must have:
 *   { subjectID, title, difficultyLevel, type, options, answerKey, blanks, solution }
 * @returns {Promise<Array<{ success: boolean, id?: string, error?: string }>>}
 */
export async function batchAddQuestions(questions) {
  if (!questions || questions.length === 0) {
    return [];
  }

  // Group questions by subjectID for counting
  const subjectGroups = {};
  for (const q of questions) {
    if (!subjectGroups[q.subjectID]) {
      subjectGroups[q.subjectID] = [];
    }
    subjectGroups[q.subjectID].push(q);
  }

  // Helper to build a single PutRequest with NEW schema
  const toPutRequest = (q) => {
    const questionID = randomUUID();
    const now = new Date().toISOString();
    const pKey = `SUBJECT#${q.subjectID}`;
    const sKey = `QUESTION#${questionID}`;

    return {
      PutRequest: {
        Item: {
          pKey,
          sKey,
          title: q.title,
          titleLower: q.title.toLowerCase(),
          difficultyLevel: q.difficultyLevel,
          type: q.type,
          options: q.options || [],
          answerKey: q.answerKey || [],
          blanks: q.blanks || [],
          solution: q.solution || "",
          isDeleted: false,
          "GSI1-pKey": "ALL_QUESTIONS",
          "GSI1-sKey": `TIMESTAMP#${now}`,
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
        const putKey = thisReq.PutRequest.Item.sKey; // SK is QUESTION#<id>
        const wasUnproc = unproc.some((u) => u.PutRequest.Item.sKey === putKey);
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

  // Update totalQuestions for each subject atomically
  for (const [subjectID, subjectQuestions] of Object.entries(subjectGroups)) {
    try {
      // First, get current totalQuestions
      const getResp = await dynamoDB.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            pKey: `SUBJECT#${subjectID}`,
            sKey: "METADATA",
          },
          ProjectionExpression: "totalQuestions",
        })
      );

      const currentTotal = getResp.Item?.totalQuestions || 0;
      const newTotal = currentTotal + subjectQuestions.length;

      // Update atomically
      await dynamoDB.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Update: {
                TableName: TABLE_NAME,
                Key: {
                  pKey: `SUBJECT#${subjectID}`,
                  sKey: "METADATA",
                },
                UpdateExpression:
                  "SET totalQuestions = :total, updatedAt = :now",
                ExpressionAttributeValues: {
                  ":total": newTotal,
                  ":now": new Date().toISOString(),
                },
              },
            },
          ],
        })
      );
    } catch (err) {
      console.error(
        `Failed to update totalQuestions for subject ${subjectID}:`,
        err
      );
    }
  }

  return results;
}
