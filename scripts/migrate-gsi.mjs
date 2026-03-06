/**
 * Migration Script: Backfill GSI attributes on BANK and RESOURCE items
 *
 * Usage:
 *   node scripts/migrate-gsi.mjs --dry-run     (shows what will be changed, changes nothing)
 *   node scripts/migrate-gsi.mjs --apply        (applies the changes)
 *
 * Reads AWS credentials from ../.env.local
 * Change AWS_DB_NAME in .env.local to target the correct database (TMA-TEST- or TMA-PRO-)
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env.local
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIndex = trimmed.indexOf("=");
  if (eqIndex === -1) continue;
  env[trimmed.slice(0, eqIndex)] = trimmed.slice(eqIndex + 1);
}

const TABLE = `${env.AWS_DB_NAME}content`;
const MODE = process.argv[2]; // --dry-run or --apply

if (!MODE || (MODE !== "--dry-run" && MODE !== "--apply")) {
  console.log("Usage:");
  console.log("  node scripts/migrate-gsi.mjs --dry-run");
  console.log("  node scripts/migrate-gsi.mjs --apply");
  process.exit(1);
}

const isDryRun = MODE === "--dry-run";

console.log(`\n=== Migration Script ===`);
console.log(`Target table: ${TABLE}`);
console.log(`Mode: ${isDryRun ? "DRY RUN (no changes)" : "APPLY (will write to DB)"}\n`);

const client = new DynamoDBClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_IAM_SECRET_KEY,
  },
});
const dynamoDB = DynamoDBDocument.from(client);

// --- Step 1: Scan for all BANK items ---
async function scanAll(filterExpression, expressionValues) {
  const items = [];
  let lastKey;
  do {
    const resp = await dynamoDB.send(
      new ScanCommand({
        TableName: TABLE,
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionValues,
        ...(lastKey && { ExclusiveStartKey: lastKey }),
      })
    );
    items.push(...(resp.Items || []));
    lastKey = resp.LastEvaluatedKey;
  } while (lastKey);
  return items;
}

async function run() {
  // =============================================
  // PART 1: Fix BANK items missing GSI attributes
  // =============================================
  console.log("--- Scanning BANK items ---");
  const banks = await scanAll("sKey = :sk", { ":sk": "BANKS" });
  console.log(`Found ${banks.length} total BANK items\n`);

  const banksNeedingFix = [];
  for (const bank of banks) {
    const issues = [];
    if (!bank["GSI1-pKey"]) issues.push("missing GSI1-pKey");
    if (!bank["GSI1-sKey"]) issues.push("missing GSI1-sKey");
    if (typeof bank.createdAt === "number") issues.push(`createdAt is number (${bank.createdAt})`);
    if (!bank.resources) issues.push("missing resources array");

    if (issues.length > 0) {
      banksNeedingFix.push({ item: bank, issues });
    }
  }

  if (banksNeedingFix.length === 0) {
    console.log("All BANK items are healthy.\n");
  } else {
    console.log(`${banksNeedingFix.length} BANK items need fixing:\n`);
    for (const { item, issues } of banksNeedingFix) {
      console.log(`  pKey: ${item.pKey}`);
      console.log(`  title: ${item.title}`);
      console.log(`  issues: ${issues.join(", ")}`);
      console.log();
    }
  }

  // =============================================
  // PART 2: Fix RESOURCE items missing GSI attributes
  // =============================================
  console.log("--- Scanning RESOURCE items ---");
  const resources = await scanAll(
    "begins_with(sKey, :prefix)",
    { ":prefix": "RESOURCE@" }
  );
  console.log(`Found ${resources.length} total RESOURCE items\n`);

  const resourcesNeedingFix = [];
  for (const resource of resources) {
    const issues = [];
    if (!resource["GSI1-pKey"]) issues.push("missing GSI1-pKey");
    if (!resource["GSI1-sKey"]) issues.push("missing GSI1-sKey");

    if (issues.length > 0) {
      resourcesNeedingFix.push({ item: resource, issues });
    }
  }

  if (resourcesNeedingFix.length === 0) {
    console.log("All RESOURCE items are healthy.\n");
  } else {
    console.log(`${resourcesNeedingFix.length} RESOURCE items need fixing:\n`);
    for (const { item, issues } of resourcesNeedingFix) {
      console.log(`  pKey: ${item.pKey}  |  sKey: ${item.sKey}`);
      console.log(`  name: ${item.name}  |  type: ${item.type}`);
      console.log(`  issues: ${issues.join(", ")}`);
      console.log();
    }
  }

  // =============================================
  // APPLY FIXES
  // =============================================
  if (isDryRun) {
    console.log("=== DRY RUN COMPLETE === No changes were made.");
    console.log(`\nSummary:`);
    console.log(`  BANK items to fix: ${banksNeedingFix.length}`);
    console.log(`  RESOURCE items to fix: ${resourcesNeedingFix.length}`);
    console.log(`\nRun with --apply to make changes.`);
    return;
  }

  // Apply BANK fixes
  let bankFixed = 0;
  for (const { item } of banksNeedingFix) {
    const updates = [];
    const values = {};
    const names = {};

    if (!item["GSI1-pKey"]) {
      updates.push("#gsi1pk = :gsi1pk");
      values[":gsi1pk"] = "BANKS";
      names["#gsi1pk"] = "GSI1-pKey";
    }
    if (!item["GSI1-sKey"]) {
      updates.push("#gsi1sk = :gsi1sk");
      values[":gsi1sk"] = item.pKey; // e.g. BANK#<uuid>
      names["#gsi1sk"] = "GSI1-sKey";
    }
    if (typeof item.createdAt === "number") {
      updates.push("createdAt = :ca");
      values[":ca"] = new Date(item.createdAt).toISOString();
    }
    if (!item.resources) {
      updates.push("resources = :res");
      values[":res"] = [];
    }

    if (updates.length > 0) {
      await dynamoDB.send(
        new UpdateCommand({
          TableName: TABLE,
          Key: { pKey: item.pKey, sKey: item.sKey },
          UpdateExpression: `SET ${updates.join(", ")}`,
          ExpressionAttributeValues: values,
          ...(Object.keys(names).length > 0 && { ExpressionAttributeNames: names }),
        })
      );
      bankFixed++;
      console.log(`Fixed BANK: ${item.pKey} (${item.title})`);
    }
  }

  // Apply RESOURCE fixes
  let resourceFixed = 0;
  for (const { item } of resourcesNeedingFix) {
    // GSI1-pKey = sKey value (e.g. RESOURCE@<bankID>) so we can query by bankID
    // GSI1-sKey = pKey value (e.g. RESOURCE#<uuid>) for uniqueness
    await dynamoDB.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { pKey: item.pKey, sKey: item.sKey },
        UpdateExpression: "SET #gsi1pk = :gsi1pk, #gsi1sk = :gsi1sk",
        ExpressionAttributeNames: {
          "#gsi1pk": "GSI1-pKey",
          "#gsi1sk": "GSI1-sKey",
        },
        ExpressionAttributeValues: {
          ":gsi1pk": item.sKey,   // RESOURCE@<bankID>
          ":gsi1sk": item.pKey,   // RESOURCE#<uuid>
        },
      })
    );
    resourceFixed++;
    console.log(`Fixed RESOURCE: ${item.pKey} | ${item.name} (${item.type})`);
  }

  console.log(`\n=== MIGRATION COMPLETE ===`);
  console.log(`  BANK items fixed: ${bankFixed}`);
  console.log(`  RESOURCE items fixed: ${resourceFixed}`);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
