import { dynamoDB } from "@/src/util/awsAgent";
import { ScanCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";

export const dynamic = "force-dynamic";

export async function POST() {
  const TABLE = `${process.env.AWS_DB_NAME}content`;
  let deletedCount = 0;
  let lek = null;

  try {
    do {
      // Scan for Questions and Subjects
      const scanParams = {
        TableName: TABLE,
        FilterExpression: "begins_with(pKey, :q) OR begins_with(pKey, :s)",
        ExpressionAttributeValues: {
          ":q": "QUESTION#",
          ":s": "SUBJECT#",
        },
        ProjectionExpression: "pKey, sKey",
        ...(lek && { ExclusiveStartKey: lek }),
      };

      const result = await dynamoDB.send(new ScanCommand(scanParams));
      const items = result.Items || [];

      if (items.length > 0) {
        // Delete in batches of 25
        const chunks = [];
        for (let i = 0; i < items.length; i += 25) {
          chunks.push(items.slice(i, i + 25));
        }

        for (const chunk of chunks) {
          const deleteRequests = chunk.map((item) => ({
            DeleteRequest: {
              Key: { pKey: item.pKey, sKey: item.sKey },
            },
          }));

          await dynamoDB.send(
            new BatchWriteCommand({
              RequestItems: {
                [TABLE]: deleteRequests,
              },
            })
          );
          deletedCount += chunk.length;
        }
      }

      lek = result.LastEvaluatedKey;
    } while (lek);

    return Response.json({
      success: true,
      message: `Successfully deleted ${deletedCount} items (Questions & Subjects).`,
    });
  } catch (error) {
    console.error("Error resetting DB:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
