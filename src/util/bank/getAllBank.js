import { dynamoDB } from "../awsAgent";
import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

export default async function getAllBank({ limit, cursor } = {}) {
  const TABLE = `${process.env.AWS_DB_NAME}content`;

  try {
    const queryParams = {
      TableName: TABLE,
      IndexName: "contentTableIndex",
      KeyConditionExpression: "#gsi1pk = :gsi1pk",
      ExpressionAttributeNames: { "#gsi1pk": "GSI1-pKey" },
      ExpressionAttributeValues: { ":gsi1pk": "BANKS" },
    };

    // If limit is provided, use paginated query (GSI only, no legacy merge)
    if (limit) {
      const startKey = cursor
        ? JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"))
        : undefined;

      const response = await dynamoDB.send(
        new QueryCommand({
          ...queryParams,
          Limit: limit,
          ...(startKey && { ExclusiveStartKey: startKey }),
        })
      );

      const nextCursor = response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString("base64")
        : null;

      return {
        success: true,
        message: "Banks fetched successfully",
        data: {
          banks: mapBanks(response.Items || []),
          nextCursor,
        },
      };
    }

    // No limit — fetch all with legacy merge (backward compatible)
    const gsiItems = [];
    let lastKey;
    do {
      const response = await dynamoDB.send(
        new QueryCommand({
          ...queryParams,
          ...(lastKey && { ExclusiveStartKey: lastKey }),
        })
      );
      gsiItems.push(...(response.Items || []));
      lastKey = response.LastEvaluatedKey;
    } while (lastKey);

    const foundKeys = new Set(gsiItems.map((item) => item.pKey));

    let legacyLastKey;
    do {
      const response = await dynamoDB.send(
        new ScanCommand({
          TableName: TABLE,
          FilterExpression: "sKey = :sKey",
          ExpressionAttributeValues: { ":sKey": "BANKS" },
          ...(legacyLastKey && { ExclusiveStartKey: legacyLastKey }),
        })
      );
      for (const item of response.Items || []) {
        if (!foundKeys.has(item.pKey)) {
          gsiItems.push(item);
        }
      }
      legacyLastKey = response.LastEvaluatedKey;
    } while (legacyLastKey);

    return {
      success: true,
      message: "All banks fetched successfully",
      data: {
        banks: mapBanks(gsiItems),
      },
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}

function mapBanks(items) {
  return items.map((bank) => {
    const { pKey, title, createdAt, resources } = bank;
    return {
      bankID: pKey.split("#")[1],
      title,
      createdAt,
      resources: resources || [],
    };
  });
}
