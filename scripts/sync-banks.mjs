/**
 * Quick script to re-sync bank resource arrays after cleanup.
 * Fixes the removeUndefinedValues error by filtering out undefined values.
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, ScanCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(resolve(__dirname, "../.env.local"), "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
}

const TABLE = `${env.AWS_DB_NAME}content`;
const client = new DynamoDBClient({
  region: env.AWS_REGION,
  credentials: { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_IAM_SECRET_KEY },
});
const db = DynamoDBDocument.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

async function main() {
  // Fetch all banks
  const banks = [];
  let lastKey;
  do {
    const res = await db.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: "sKey = :skey",
      ExpressionAttributeValues: { ":skey": "BANKS" },
      ...(lastKey && { ExclusiveStartKey: lastKey }),
    }));
    banks.push(...(res.Items || []));
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);

  console.log(`Found ${banks.length} banks. Syncing resource arrays...\n`);

  let synced = 0;
  let errors = 0;

  for (const bank of banks) {
    const bankID = bank.pKey.split("#")[1];
    const bankResources = bank.resources || [];

    // Fetch actual resources for this bank
    const items = [];
    let rLastKey;
    do {
      const res = await db.send(new QueryCommand({
        TableName: TABLE,
        IndexName: "contentTableIndex",
        KeyConditionExpression: "#gsi1pk = :gsi1pk",
        ExpressionAttributeNames: { "#gsi1pk": "GSI1-pKey" },
        ExpressionAttributeValues: { ":gsi1pk": `RESOURCE@${bankID}` },
        ...(rLastKey && { ExclusiveStartKey: rLastKey }),
      }));
      items.push(...(res.Items || []));
      rLastKey = res.LastEvaluatedKey;
    } while (rLastKey);

    const actualIDs = new Set(items.map((r) => r.pKey.split("#")[1]));
    const arrayIDs = new Set(bankResources.map((r) => r.resourceID));

    // Check if sync needed
    const stale = bankResources.filter((r) => !actualIDs.has(r.resourceID));
    const missing = items.filter((r) => !arrayIDs.has(r.pKey.split("#")[1]));

    if (stale.length === 0 && missing.length === 0) continue;

    // Build new resources array from actual DB items
    const newResources = items.map((r) => {
      const entry = {
        resourceID: r.pKey.split("#")[1],
        type: r.type,
        name: r.name,
        createdAt: r.createdAt || new Date().toISOString(),
      };
      if (r.videoID) entry.videoID = r.videoID;
      return entry;
    });

    try {
      await db.send(new UpdateCommand({
        TableName: TABLE,
        Key: { pKey: bank.pKey, sKey: "BANKS" },
        UpdateExpression: "SET resources = :resources",
        ExpressionAttributeValues: { ":resources": newResources },
      }));
      synced++;
      console.log(`  Synced "${bank.title}" — was: ${bankResources.length} entries, now: ${newResources.length} (removed ${stale.length} stale, added ${missing.length} missing)`);
    } catch (err) {
      errors++;
      console.error(`  ERROR syncing "${bank.title}": ${err.message}`);
    }
  }

  console.log(`\nDone. Synced: ${synced}, Errors: ${errors}`);
}

main().catch(console.error);
