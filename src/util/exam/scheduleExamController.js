import { dynamoDB } from "../awsAgent";
import { QueryCommand, BatchGetCommand } from "@aws-sdk/lib-dynamodb";

const MASTER_TABLE = `${process.env.AWS_DB_NAME}master`;
const MASTER_TABLE_INDEX = "masterTableIndex";

export async function getAllScheduledExams() {
  const params = {
    TableName: MASTER_TABLE,
    IndexName: MASTER_TABLE_INDEX,
    KeyConditionExpression: "#gsi1pKey = :pk and #gsi1sKey = :sk",
    ExpressionAttributeNames: {
      "#gsi1pKey": "GSI1-pKey",
      "#gsi1sKey": "GSI1-sKey",
    },
    FilterExpression: "sKey = :skey",
    ExpressionAttributeValues: {
      ":pk": "EXAMS",
      ":sk": "EXAMS",
      ":skey": "EXAMS@scheduled",
    },
  };

  try {
    // Handle pagination to get all results
    let allItems = [];
    let lastKey = undefined;
    do {
      const queryParams = { ...params };
      if (lastKey) queryParams.ExclusiveStartKey = lastKey;
      const result = await dynamoDB.send(new QueryCommand(queryParams));
      allItems = allItems.concat(result.Items || []);
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);

    // Collect all unique batch IDs across all exams
    const allBatchIds = new Set();
    for (const item of allItems) {
      if (item.batchList) {
        item.batchList.forEach((id) => allBatchIds.add(id));
      }
    }

    // Fetch all batch metadata in batches of 100 (BatchGetCommand limit)
    const batchMetaMap = {};
    const batchIdArray = [...allBatchIds];
    for (let i = 0; i < batchIdArray.length; i += 100) {
      const chunk = batchIdArray.slice(i, i + 100);
      const batchKeys = chunk.map((id) => ({
        pKey: `BATCH#${id}`,
        sKey: "BATCHES",
      }));

      const batchResult = await dynamoDB.send(
        new BatchGetCommand({
          RequestItems: {
            [MASTER_TABLE]: { Keys: batchKeys },
          },
        }),
      );

      const batches = batchResult.Responses[MASTER_TABLE] || [];
      for (const batch of batches) {
        const batchId = batch.pKey.split("#")[1];
        batchMetaMap[batchId] = { id: batchId, title: batch.title };
      }
    }

    // Map exams with batch metadata
    const examsWithBatchMeta = allItems.map((item) => {
      const batchList = item.batchList || [];
      const batchMeta = batchList
        .map((id) => batchMetaMap[id])
        .filter(Boolean);

      return {
        id: item.pKey.split("#")[1],
        isLive: item.isLive,
        title: item.title,
        startTimeStamp: item.startTimeStamp,
        duration: item.duration,
        totalQuestions: item.totalQuestions,
        totalSections: item.totalSections,
        totalMarks: item.totalMarks,
        isLifeTime: item.isLifeTime,
        endTimeStamp: item.endTimeStamp,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        batchList,
        batchMeta,
      };
    });

    return {
      success: true,
      message: "Scheduled exams retrieved successfully",
      data: examsWithBatchMeta,
    };
  } catch (error) {
    throw new Error(error);
  }
}
