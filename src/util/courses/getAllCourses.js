import { dynamoDB } from "../awsAgent";
import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = `${process.env.AWS_DB_NAME}master`;
const MASTER_TABLE_INDEX = "masterTableIndex";

export async function getAllCoursesByGoalID({ goalID }) {
  const queryParams = {
    TableName: TABLE_NAME,
    IndexName: MASTER_TABLE_INDEX,
    KeyConditionExpression: "#gsi1pk = :gsi1pk AND #gsi1sk = :gsi1sk",
    ExpressionAttributeNames: {
      "#gsi1pk": "GSI1-pKey",
      "#gsi1sk": "GSI1-sKey",
      "#duration": "duration",
    },
    ExpressionAttributeValues: {
      ":gsi1pk": "COURSES",
      ":gsi1sk": `COURSES@${goalID}`,
    },
    ProjectionExpression:
      "pKey, sKey, title, thumbnail, lessons, #duration, isLive, subscription",
  };

  try {
    const items = [];
    let lastKey;

    try {
      do {
        const response = await dynamoDB.send(
          new QueryCommand({
            ...queryParams,
            ...(lastKey && { ExclusiveStartKey: lastKey }),
          })
        );
        items.push(...(response.Items || []));
        lastKey = response.LastEvaluatedKey;
      } while (lastKey);
    } catch (queryError) {
      console.warn(
        "Falling back to Scan for getAllCoursesByGoalID:",
        queryError?.message || queryError
      );
    }

    // Merge with legacy scan fallback (deduplicated)
    const foundKeys = new Set(items.map((item) => item.pKey));
    let legacyLastKey;
    do {
      const legacyResponse = await dynamoDB.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: "sKey = :sKey",
          ExpressionAttributeValues: {
            ":sKey": `COURSES@${goalID}`,
          },
          ProjectionExpression:
            "pKey, sKey, title, thumbnail, lessons, #duration, isLive, subscription",
          ExpressionAttributeNames: {
            "#duration": "duration",
          },
          ...(legacyLastKey && { ExclusiveStartKey: legacyLastKey }),
        })
      );
      for (const item of legacyResponse.Items || []) {
        if (!foundKeys.has(item.pKey)) {
          items.push(item);
        }
      }
      legacyLastKey = legacyResponse.LastEvaluatedKey;
    } while (legacyLastKey);

    return {
      success: true,
      message: "Courses fetched successfully",
      data: items.map((item) => ({
        courseID: item.pKey.split("#")[1],
        title: item.title,
        thumbnail: item.thumbnail,
        lessons: item.lessons,
        duration: item.duration,
        isLive: item.isLive,
      })),
    };
  } catch (error) {
    console.error("DynamoDB Error:", error);
    throw new Error("Internal server error");
  }
}

export async function getALLCourse() {
  const queryParams = {
    TableName: TABLE_NAME,
    IndexName: MASTER_TABLE_INDEX,
    KeyConditionExpression: "#gsi1pk = :gsi1pk",
    ExpressionAttributeNames: {
      "#gsi1pk": "GSI1-pKey",
      "#duration": "duration",
    },
    ExpressionAttributeValues: {
      ":gsi1pk": "COURSES",
    },
    ProjectionExpression:
      "pKey, sKey, title, thumbnail, lessons, #duration, subscription",
  };

  try {
    const items = [];
    let lastKey;

    try {
      do {
        const response = await dynamoDB.send(
          new QueryCommand({
            ...queryParams,
            ...(lastKey && { ExclusiveStartKey: lastKey }),
          })
        );
        items.push(...(response.Items || []));
        lastKey = response.LastEvaluatedKey;
      } while (lastKey);
    } catch (queryError) {
      console.warn(
        "Falling back to Scan for getALLCourse:",
        queryError?.message || queryError
      );
    }

    // Merge with legacy scan fallback (deduplicated)
    const foundKeys = new Set(items.map((item) => item.pKey));
    let legacyLastKey2;
    do {
      const legacyResponse = await dynamoDB.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: "begins_with(sKey, :sKey)",
          ExpressionAttributeValues: {
            ":sKey": "COURSES@",
          },
          ProjectionExpression:
            "pKey, sKey, title, thumbnail, lessons, #duration, subscription",
          ExpressionAttributeNames: {
            "#duration": "duration",
          },
          ...(legacyLastKey2 && { ExclusiveStartKey: legacyLastKey2 }),
        })
      );
      for (const item of legacyResponse.Items || []) {
        if (!foundKeys.has(item.pKey)) {
          items.push(item);
        }
      }
      legacyLastKey2 = legacyResponse.LastEvaluatedKey;
    } while (legacyLastKey2);

    return {
      success: true,
      message: "Courses fetched successfully",
      data: items.map((item) => ({
        courseID: item.pKey.split("#")[1],
        goalID: item.sKey.split("@")[1],
        title: item.title,
        thumbnail: item.thumbnail,
        lessons: item.lessons,
        duration: item.duration,
        subscription: item.subscription,
      })),
    };
  } catch (error) {
    console.error("DynamoDB Error:", error);
    throw new Error("Internal server error");
  }
}
