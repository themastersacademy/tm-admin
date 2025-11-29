const fs = require("fs");
const path = require("path");

// Load env vars from .env.local
const envPath = path.resolve(__dirname, "../../.env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

// Mock "server only" to avoid error in awsAgent
// We can't easily mock the import, so we'll just copy the client initialization logic here
// to avoid importing the "server only" directive file if it causes issues.
// But let's try importing first. If it fails, we'll inline the logic.

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocument,
  ScanCommand,
  BatchWriteCommand,
} = require("@aws-sdk/lib-dynamodb");

if (
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_IAM_SECRET_KEY ||
  !process.env.AWS_REGION
) {
  console.error("Missing AWS env vars");
  process.exit(1);
}

const dbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_IAM_SECRET_KEY,
  },
});

const dynamoDB = DynamoDBDocument.from(dbClient);

async function resetDB() {
  const TABLE = `${process.env.AWS_DB_NAME}content`;
  console.log(`Scanning table: ${TABLE} for Questions and Subjects...`);

  let deletedCount = 0;
  let lek = null;

  try {
    do {
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
        console.log(`Found ${items.length} items to delete...`);
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
          process.stdout.write(`Deleted ${deletedCount} items...\r`);
        }
      }

      lek = result.LastEvaluatedKey;
    } while (lek);

    console.log(`\nSuccessfully deleted ${deletedCount} items.`);
  } catch (error) {
    console.error("Error resetting DB:", error);
  }
}

resetDB();
