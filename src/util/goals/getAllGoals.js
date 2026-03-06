import { dynamoDB } from "../awsAgent";
import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

export default async function getAllGoals() {
  const TABLE = `${process.env.AWS_DB_NAME}master`;

  try {
    // Step 1: Query via GSI
    const gsiItems = [];
    let lastKey;

    do {
      const response = await dynamoDB.send(
        new QueryCommand({
          TableName: TABLE,
          IndexName: "masterTableIndex",
          KeyConditionExpression: "#gsi1pk = :gsi1pk",
          ExpressionAttributeNames: {
            "#gsi1pk": "GSI1-pKey",
          },
          ExpressionAttributeValues: {
            ":gsi1pk": "GOALS",
          },
          ...(lastKey && { ExclusiveStartKey: lastKey }),
        })
      );
      gsiItems.push(...(response.Items || []));
      lastKey = response.LastEvaluatedKey;
    } while (lastKey);

    // Step 2: Merge with legacy scan fallback
    const foundKeys = new Set(gsiItems.map((item) => item.pKey));
    let legacyLastKey;
    do {
      const response = await dynamoDB.send(
        new ScanCommand({
          TableName: TABLE,
          FilterExpression: "sKey = :sKey",
          ExpressionAttributeValues: {
            ":sKey": "GOALS",
          },
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
      message: "All goals fetched successfully",
      data: {
        goals: gsiItems.map((goal) => {
          const {
            pKey,
            title,
            icon,
            isLive,
            coursesList = [],
            subjectList = [],
            blogList = [],
            updatedAt,
          } = goal;
          return {
            goalID: pKey.split("#")[1],
            title,
            icon,
            isLive,
            coursesCount: coursesList.length,
            subjectsCount: subjectList.length,
            blogsCount: blogList.length,
            updatedAt,
          };
        }),
      },
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
