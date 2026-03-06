/**
 * Comprehensive Migration Script: Backfill GSI attributes on all entity types
 *
 * Covers: GOAL, LESSON, SUBJECT, ANNOUNCEMENT items
 * (BANK + RESOURCE items were already migrated by migrate-gsi.mjs)
 *
 * Usage:
 *   node scripts/migrate-all-gsi.mjs --dry-run     (shows what will be changed, changes nothing)
 *   node scripts/migrate-all-gsi.mjs --apply        (applies the changes)
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

const MASTER_TABLE = `${env.AWS_DB_NAME}master`;
const CONTENT_TABLE = `${env.AWS_DB_NAME}content`;
const MODE = process.argv[2]; // --dry-run or --apply

if (!MODE || (MODE !== "--dry-run" && MODE !== "--apply")) {
  console.log("Usage:");
  console.log("  node scripts/migrate-all-gsi.mjs --dry-run");
  console.log("  node scripts/migrate-all-gsi.mjs --apply");
  process.exit(1);
}

const isDryRun = MODE === "--dry-run";

console.log(`\n=== Comprehensive GSI Migration Script ===`);
console.log(`Master table: ${MASTER_TABLE}`);
console.log(`Content table: ${CONTENT_TABLE}`);
console.log(`Mode: ${isDryRun ? "DRY RUN (no changes)" : "APPLY (will write to DB)"}\n`);

const client = new DynamoDBClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_IAM_SECRET_KEY,
  },
});
const dynamoDB = DynamoDBDocument.from(client);

async function scanAll(tableName, filterExpression, expressionValues) {
  const items = [];
  let lastKey;
  do {
    const resp = await dynamoDB.send(
      new ScanCommand({
        TableName: tableName,
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

async function updateItem(tableName, key, updates, values, names) {
  if (isDryRun) return;
  await dynamoDB.send(
    new UpdateCommand({
      TableName: tableName,
      Key: key,
      UpdateExpression: `SET ${updates.join(", ")}`,
      ExpressionAttributeValues: values,
      ...(Object.keys(names).length > 0 && { ExpressionAttributeNames: names }),
    })
  );
}

async function run() {
  let totalFixed = 0;

  // =============================================
  // PART 1: Fix GOAL items
  // =============================================
  console.log("--- Scanning GOAL items ---");
  const goals = await scanAll(MASTER_TABLE, "sKey = :sk", { ":sk": "GOALS" });
  console.log(`Found ${goals.length} total GOAL items`);

  let goalFixed = 0;
  for (const item of goals) {
    const updates = [];
    const values = {};
    const names = {};

    if (!item["GSI1-pKey"]) {
      updates.push("#gsi1pk = :gsi1pk");
      values[":gsi1pk"] = "GOALS";
      names["#gsi1pk"] = "GSI1-pKey";
    }
    if (!item["GSI1-sKey"]) {
      updates.push("#gsi1sk = :gsi1sk");
      values[":gsi1sk"] = item.pKey; // e.g. GOAL#<uuid>
      names["#gsi1sk"] = "GSI1-sKey";
    }
    if (typeof item.createdAt === "number") {
      updates.push("createdAt = :ca");
      values[":ca"] = new Date(item.createdAt).toISOString();
    }

    if (updates.length > 0) {
      await updateItem(MASTER_TABLE, { pKey: item.pKey, sKey: item.sKey }, updates, values, names);
      goalFixed++;
      if (!isDryRun) console.log(`  Fixed GOAL: ${item.pKey} (${item.title})`);
      else console.log(`  Would fix GOAL: ${item.pKey} (${item.title}) — ${updates.length} attrs`);
    }
  }
  console.log(`GOAL items ${isDryRun ? "to fix" : "fixed"}: ${goalFixed}\n`);
  totalFixed += goalFixed;

  // =============================================
  // PART 2: Fix LESSON items
  // =============================================
  console.log("--- Scanning LESSON items ---");
  const lessons = await scanAll(MASTER_TABLE, "begins_with(sKey, :prefix)", { ":prefix": "LESSONS@" });
  console.log(`Found ${lessons.length} total LESSON items`);

  let lessonFixed = 0;
  for (const item of lessons) {
    const updates = [];
    const values = {};
    const names = {};

    if (!item["GSI1-pKey"]) {
      updates.push("#gsi1pk = :gsi1pk");
      values[":gsi1pk"] = item.sKey; // e.g. LESSONS@<courseID>
      names["#gsi1pk"] = "GSI1-pKey";
    }
    if (!item["GSI1-sKey"]) {
      updates.push("#gsi1sk = :gsi1sk");
      values[":gsi1sk"] = item.pKey; // e.g. LESSON#<uuid>
      names["#gsi1sk"] = "GSI1-sKey";
    }
    if (typeof item.createdAt === "number") {
      updates.push("createdAt = :ca");
      values[":ca"] = new Date(item.createdAt).toISOString();
    }

    if (updates.length > 0) {
      await updateItem(MASTER_TABLE, { pKey: item.pKey, sKey: item.sKey }, updates, values, names);
      lessonFixed++;
      if (!isDryRun) console.log(`  Fixed LESSON: ${item.pKey} | ${item.sKey}`);
      else console.log(`  Would fix LESSON: ${item.pKey} | ${item.sKey} — ${updates.length} attrs`);
    }
  }
  console.log(`LESSON items ${isDryRun ? "to fix" : "fixed"}: ${lessonFixed}\n`);
  totalFixed += lessonFixed;

  // =============================================
  // PART 3: Fix SUBJECT items (content table)
  // =============================================
  console.log("--- Scanning SUBJECT items ---");
  const subjects = await scanAll(
    CONTENT_TABLE,
    "sKey = :sk AND begins_with(pKey, :prefix)",
    { ":sk": "METADATA", ":prefix": "SUBJECT#" }
  );
  console.log(`Found ${subjects.length} total SUBJECT items`);

  let subjectFixed = 0;
  for (const item of subjects) {
    const updates = [];
    const values = {};
    const names = {};

    if (!item["GSI1-pKey"]) {
      updates.push("#gsi1pk = :gsi1pk");
      values[":gsi1pk"] = "SUBJECTS";
      names["#gsi1pk"] = "GSI1-pKey";
    }
    if (!item["GSI1-sKey"]) {
      updates.push("#gsi1sk = :gsi1sk");
      values[":gsi1sk"] = item.pKey; // e.g. SUBJECT#<uuid>
      names["#gsi1sk"] = "GSI1-sKey";
    }
    if (typeof item.createdAt === "number") {
      updates.push("createdAt = :ca");
      values[":ca"] = new Date(item.createdAt).toISOString();
    }

    if (updates.length > 0) {
      await updateItem(CONTENT_TABLE, { pKey: item.pKey, sKey: item.sKey }, updates, values, names);
      subjectFixed++;
      if (!isDryRun) console.log(`  Fixed SUBJECT: ${item.pKey} (${item.title})`);
      else console.log(`  Would fix SUBJECT: ${item.pKey} (${item.title}) — ${updates.length} attrs`);
    }
  }
  console.log(`SUBJECT items ${isDryRun ? "to fix" : "fixed"}: ${subjectFixed}\n`);
  totalFixed += subjectFixed;

  // =============================================
  // PART 4: Fix ANNOUNCEMENT items
  // =============================================
  console.log("--- Scanning ANNOUNCEMENT items ---");
  const announcements = await scanAll(
    MASTER_TABLE,
    "sKey = :sk",
    { ":sk": "ANNOUNCEMENT" }
  );
  console.log(`Found ${announcements.length} total ANNOUNCEMENT items`);

  let announcementFixed = 0;
  for (const item of announcements) {
    const updates = [];
    const values = {};
    const names = {};

    if (!item["GSI1-pKey"]) {
      updates.push("#gsi1pk = :gsi1pk");
      values[":gsi1pk"] = "ANNOUNCEMENTS";
      names["#gsi1pk"] = "GSI1-pKey";
    }
    if (!item["GSI1-sKey"]) {
      updates.push("#gsi1sk = :gsi1sk");
      values[":gsi1sk"] = item.pKey; // e.g. ANNOUNCEMENT#<uuid>
      names["#gsi1sk"] = "GSI1-sKey";
    }

    if (updates.length > 0) {
      await updateItem(MASTER_TABLE, { pKey: item.pKey, sKey: item.sKey }, updates, values, names);
      announcementFixed++;
      if (!isDryRun) console.log(`  Fixed ANNOUNCEMENT: ${item.pKey} (${item.title})`);
      else console.log(`  Would fix ANNOUNCEMENT: ${item.pKey} (${item.title}) — ${updates.length} attrs`);
    }
  }
  console.log(`ANNOUNCEMENT items ${isDryRun ? "to fix" : "fixed"}: ${announcementFixed}\n`);
  totalFixed += announcementFixed;

  // =============================================
  // SUMMARY
  // =============================================
  console.log(`=== ${isDryRun ? "DRY RUN" : "MIGRATION"} COMPLETE ===`);
  console.log(`  GOAL items: ${goalFixed}`);
  console.log(`  LESSON items: ${lessonFixed}`);
  console.log(`  SUBJECT items: ${subjectFixed}`);
  console.log(`  ANNOUNCEMENT items: ${announcementFixed}`);
  console.log(`  Total: ${totalFixed}`);

  if (isDryRun) {
    console.log(`\nRun with --apply to make changes.`);
  }
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
