import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, ScanCommand } from "@aws-sdk/lib-dynamodb";
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

const client = new DynamoDBClient({ region: env.AWS_REGION, credentials: { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_IAM_SECRET_KEY } });
const db = DynamoDBDocument.from(client);

async function count(table, filter, vals) {
  let total = 0, lastKey;
  do {
    const r = await db.send(new ScanCommand({ TableName: table, FilterExpression: filter, ExpressionAttributeValues: vals, Select: "COUNT", ...(lastKey && { ExclusiveStartKey: lastKey }) }));
    total += r.Count;
    lastKey = r.LastEvaluatedKey;
  } while (lastKey);
  return total;
}

const master = `${env.AWS_DB_NAME}master`;
const content = `${env.AWS_DB_NAME}content`;

console.log(`=== ${env.AWS_DB_NAME} DATA COUNTS ===`);
console.log("Goals:", await count(master, "sKey = :s", {":s":"GOALS"}));
console.log("Courses:", await count(master, "begins_with(sKey, :s)", {":s":"COURSES@"}));
console.log("Lessons:", await count(master, "begins_with(sKey, :s)", {":s":"LESSONS@"}));
console.log("Subjects:", await count(content, "sKey = :s AND begins_with(pKey, :p)", {":s":"METADATA",":p":"SUBJECT#"}));
console.log("Banks:", await count(content, "sKey = :s", {":s":"BANKS"}));
console.log("Resources:", await count(content, "begins_with(sKey, :s)", {":s":"RESOURCE@"}));
console.log("Coupons:", await count(master, "sKey = :s", {":s":"COUPONS"}));
console.log("Banners:", await count(master, "sKey = :s", {":s":"BANNERS"}));
console.log("Announcements:", await count(master, "sKey = :s", {":s":"ANNOUNCEMENT"}));
console.log("Subscriptions:", await count(master, "sKey = :s", {":s":"SUBSCRIPTION_PLAN"}));
