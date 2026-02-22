import { dynamoDB } from "../awsAgent";
import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

export default async function getAllBank() {
  const queryParams = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    IndexName: "contentTableIndex",
    KeyConditionExpression: "#gsi1pk = :gsi1pk",
    ExpressionAttributeNames: {
      "#gsi1pk": "GSI1-pKey",
    },
    ExpressionAttributeValues: {
      ":gsi1pk": "BANKS",
    },
    ProjectionExpression: "pKey, title, createdAt, resources",
  };

  const fallbackScanParams = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    FilterExpression: "sKey = :sKey",
    ExpressionAttributeValues: {
      ":sKey": "BANKS",
    },
    ProjectionExpression: "pKey, title, createdAt, resources",
  };

  try {
    const items = [];
    let lastKey;

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

    // Backward compatibility for legacy records missing GSI attributes.
    if (items.length === 0) {
      let legacyLastKey;
      do {
        const response = await dynamoDB.send(
          new ScanCommand({
            ...fallbackScanParams,
            ...(legacyLastKey && { ExclusiveStartKey: legacyLastKey }),
          })
        );
        items.push(...(response.Items || []));
        legacyLastKey = response.LastEvaluatedKey;
      } while (legacyLastKey);
    }

    return {
      success: true,
      message: "All banks fetched successfully",
      data: {
        banks: items.map((bank) => {
          const { pKey, title, createdAt, resources } = bank;
          return {
            bankID: pKey.split("#")[1],
            title,
            createdAt,
            resources: resources || [],
          };
        }),
      },
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
