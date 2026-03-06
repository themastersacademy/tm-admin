import { dynamoDB } from "../awsAgent";
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

export default async function getAllResources({ bankID, limit, cursor }) {
  const TABLE = `${process.env.AWS_DB_NAME}content`;

  try {
    const bankResponse = await dynamoDB.send(
      new GetCommand({
        TableName: TABLE,
        Key: {
          pKey: `BANK#${bankID}`,
          sKey: `BANKS`,
        },
      })
    );

    if (!bankResponse.Item) {
      return { success: false, message: "Bank not found" };
    }

    const queryParams = {
      TableName: TABLE,
      IndexName: "contentTableIndex",
      KeyConditionExpression: "#gsi1pk = :gsi1pk",
      ExpressionAttributeNames: { "#gsi1pk": "GSI1-pKey" },
      ExpressionAttributeValues: { ":gsi1pk": `RESOURCE@${bankID}` },
    };

    // If limit is provided, use paginated query
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
        message: "Resources fetched successfully",
        data: {
          bankID,
          bankTitle: bankResponse.Item.title,
          videoCollectionID: bankResponse.Item.videoCollectionID,
          resources: mapResources(response.Items || []),
          nextCursor,
        },
      };
    }

    // No limit — fetch all (backward compatible)
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

    return {
      success: true,
      message: "All resources fetched successfully",
      data: {
        bankID,
        bankTitle: bankResponse.Item.title,
        videoCollectionID: bankResponse.Item.videoCollectionID,
        resources: mapResources(items),
      },
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}

function mapResources(items) {
  return items.map((resource) => {
    const { pKey, name, isUploaded, type, thumbnail, url, videoID, path, createdAt } =
      resource;
    return {
      resourceID: pKey.split("#")[1],
      type,
      name,
      isUploaded,
      thumbnail,
      videoID,
      url,
      path,
      createdAt,
    };
  });
}
