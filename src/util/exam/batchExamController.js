import { dynamoDB } from "../awsAgent";
import { QueryCommand, BatchGetCommand } from "@aws-sdk/lib-dynamodb";

const MASTER_TABLE = `${process.env.AWS_DB_NAME}master`;

/**
 * Get all scheduled exams for a specific batch
 * @param {string} batchID - The batch ID
 * @returns {Promise<{success: boolean, message: string, data: Array}>}
 */
export async function getExamsByBatchID(batchID) {
  try {
    // First, query BATCH_EXAM items to get exam IDs
    const queryParams = {
      TableName: MASTER_TABLE,
      KeyConditionExpression: "pKey = :pKey",
      ExpressionAttributeValues: {
        ":pKey": `BATCH_EXAM#${batchID}`,
      },
    };

    const queryResult = await dynamoDB.send(new QueryCommand(queryParams));

    if (!queryResult.Items || queryResult.Items.length === 0) {
      return {
        success: true,
        message: "No exams found for this batch",
        data: [],
      };
    }

    // Extract exam IDs
    const examIDs = queryResult.Items.map((item) => item.examID);

    // Batch get exam details
    const examKeys = examIDs.map((examID) => ({
      pKey: `EXAM#${examID}`,
      sKey: "EXAMS@scheduled",
    }));

    const batchGetParams = {
      RequestItems: {
        [MASTER_TABLE]: {
          Keys: examKeys,
        },
      },
    };

    const batchGetResult = await dynamoDB.send(
      new BatchGetCommand(batchGetParams)
    );

    const exams = batchGetResult.Responses[MASTER_TABLE] || [];

    // For each exam, fetch batch metadata
    const examsWithBatchMeta = await Promise.all(
      exams.map(async (exam) => {
        const batchList = exam.batchList || [];

        if (batchList.length === 0) {
          return {
            id: exam.pKey.split("#")[1],
            title: exam.title,
            isLive: exam.isLive,
            startTimeStamp: exam.startTimeStamp,
            duration: exam.duration,
            totalQuestions: exam.totalQuestions,
            totalSections: exam.totalSections,
            totalMarks: exam.totalMarks,
            isLifeTime: exam.isLifeTime,
            endTimeStamp: exam.endTimeStamp,
            createdAt: exam.createdAt,
            updatedAt: exam.updatedAt,
            batchList: [],
            batchMeta: [],
          };
        }

        // Fetch batch metadata
        const batchKeys = batchList.map((id) => ({
          pKey: `BATCH#${id}`,
          sKey: `BATCH#${id}`,
        }));

        const batchGetParams = {
          RequestItems: {
            [MASTER_TABLE]: {
              Keys: batchKeys,
            },
          },
        };

        const batchResult = await dynamoDB.send(
          new BatchGetCommand(batchGetParams)
        );

        const batches = batchResult.Responses[MASTER_TABLE] || [];
        const batchMeta = batches.map((batch) => ({
          id: batch.pKey.split("#")[1],
          title: batch.title,
        }));

        return {
          id: exam.pKey.split("#")[1],
          title: exam.title,
          isLive: exam.isLive,
          startTimeStamp: exam.startTimeStamp,
          duration: exam.duration,
          totalQuestions: exam.totalQuestions,
          totalSections: exam.totalSections,
          totalMarks: exam.totalMarks,
          isLifeTime: exam.isLifeTime,
          endTimeStamp: exam.endTimeStamp,
          createdAt: exam.createdAt,
          updatedAt: exam.updatedAt,
          batchList,
          batchMeta,
        };
      })
    );

    return {
      success: true,
      message: "Exams retrieved successfully",
      data: examsWithBatchMeta,
    };
  } catch (error) {
    console.error("Error fetching exams for batch:", error);
    throw new Error(error);
  }
}
