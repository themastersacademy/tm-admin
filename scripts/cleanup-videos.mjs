/**
 * Video Resource Cleanup Script
 *
 * Scans DynamoDB video resources and cross-checks with Bunny.net to find:
 *   1. Failed uploads (isUploaded=false, Bunny status 0/5/6)
 *   2. Duplicate videos (same name in same bank)
 *   3. Orphaned DB records (videoID not found in Bunny)
 *   4. Orphaned Bunny videos (not referenced by any DB resource)
 *   5. Stale bank.resources[] entries
 *
 * Usage:
 *   node scripts/cleanup-videos.mjs              # Dry run (report only)
 *   node scripts/cleanup-videos.mjs --execute    # Actually delete bad resources
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocument,
  ScanCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load .env.local ──
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

const EXECUTE = process.argv.includes("--execute");
const CONTENT_TABLE = `${env.AWS_DB_NAME}content`;
const LIBRARY_ID = env.BUNNY_VIDEO_LIBRARY_ID;
const BUNNY_API_KEY = env.BUNNY_API_KEY;

const client = new DynamoDBClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_IAM_SECRET_KEY,
  },
});
const db = DynamoDBDocument.from(client);

// Bunny video status labels
const BUNNY_STATUS = {
  0: "Created",
  1: "Uploaded",
  2: "Processing",
  3: "Transcoding",
  4: "Finished",
  5: "Error",
  6: "UploadFailed",
};

// ── Helpers ──

async function fetchAllResources() {
  const items = [];
  let lastKey;
  do {
    const res = await db.send(
      new ScanCommand({
        TableName: CONTENT_TABLE,
        FilterExpression: "begins_with(sKey, :prefix)",
        ExpressionAttributeValues: { ":prefix": "RESOURCE@" },
        ...(lastKey && { ExclusiveStartKey: lastKey }),
      })
    );
    items.push(...(res.Items || []));
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);
  return items;
}

async function fetchAllBanks() {
  const items = [];
  let lastKey;
  do {
    const res = await db.send(
      new ScanCommand({
        TableName: CONTENT_TABLE,
        FilterExpression: "sKey = :skey",
        ExpressionAttributeValues: { ":skey": "BANKS" },
        ...(lastKey && { ExclusiveStartKey: lastKey }),
      })
    );
    items.push(...(res.Items || []));
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);
  return items;
}

async function fetchAllBunnyVideos() {
  const allVideos = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const res = await fetch(
      `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos?page=${page}&itemsPerPage=${perPage}`,
      { headers: { accept: "application/json", AccessKey: BUNNY_API_KEY } }
    );
    const data = await res.json();
    if (!data.items || data.items.length === 0) break;
    allVideos.push(...data.items);
    if (allVideos.length >= data.totalItems) break;
    page++;
  }

  return allVideos;
}

async function getBunnyVideoStatus(videoID) {
  try {
    const res = await fetch(
      `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoID}`,
      { headers: { accept: "application/json", AccessKey: BUNNY_API_KEY } }
    );
    if (res.status === 404) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function deleteBunnyVideo(videoID) {
  const res = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoID}`,
    {
      method: "DELETE",
      headers: { accept: "application/json", AccessKey: BUNNY_API_KEY },
    }
  );
  return res.ok;
}

async function deleteDBResource(resourceID, bankID) {
  await db.send(
    new DeleteCommand({
      TableName: CONTENT_TABLE,
      Key: {
        pKey: `RESOURCE#${resourceID}`,
        sKey: `RESOURCE@${bankID}`,
      },
    })
  );
}

async function syncBankResources(bankPKey, bankID) {
  // Fetch actual resources for this bank from DynamoDB
  const items = [];
  let lastKey;
  do {
    const res = await db.send(
      new QueryCommand({
        TableName: CONTENT_TABLE,
        IndexName: "contentTableIndex",
        KeyConditionExpression: "#gsi1pk = :gsi1pk",
        ExpressionAttributeNames: { "#gsi1pk": "GSI1-pKey" },
        ExpressionAttributeValues: { ":gsi1pk": `RESOURCE@${bankID}` },
        ...(lastKey && { ExclusiveStartKey: lastKey }),
      })
    );
    items.push(...(res.Items || []));
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);

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

  await db.send(
    new UpdateCommand({
      TableName: CONTENT_TABLE,
      Key: { pKey: bankPKey, sKey: "BANKS" },
      UpdateExpression: "SET resources = :resources",
      ExpressionAttributeValues: { ":resources": newResources },
    })
  );
}

function formatSize(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

// ── Main ──

async function main() {
  console.log("=".repeat(70));
  console.log("  VIDEO RESOURCE CLEANUP DIAGNOSTIC");
  console.log(`  Database: ${CONTENT_TABLE}`);
  console.log(`  Bunny Library: ${LIBRARY_ID}`);
  console.log(`  Mode: ${EXECUTE ? "EXECUTE (will delete!)" : "DRY RUN (report only)"}`);
  console.log("=".repeat(70));

  // Step 1: Fetch all data
  console.log("\n[1/4] Fetching all resources from DynamoDB...");
  const allResources = await fetchAllResources();
  const videoResources = allResources.filter((r) => r.type === "VIDEO");
  const fileResources = allResources.filter((r) => r.type === "FILE");
  console.log(
    `  Total resources: ${allResources.length} (${videoResources.length} videos, ${fileResources.length} files)`
  );

  console.log("\n[2/4] Fetching all banks from DynamoDB...");
  const allBanks = await fetchAllBanks();
  console.log(`  Total banks: ${allBanks.length}`);

  console.log("\n[3/4] Fetching all videos from Bunny.net...");
  const bunnyVideos = await fetchAllBunnyVideos();
  console.log(`  Total Bunny videos: ${bunnyVideos.length}`);

  // Build lookup maps
  const bunnyMap = new Map(); // videoID -> bunny video data
  for (const v of bunnyVideos) {
    bunnyMap.set(v.guid, v);
  }

  const dbVideoIDs = new Set(); // all videoIDs referenced in DB
  for (const r of videoResources) {
    if (r.videoID) dbVideoIDs.add(r.videoID);
  }

  // ── Analysis ──
  console.log("\n[4/4] Analyzing...\n");

  const report = {
    failedUploads: [],
    duplicates: [],
    orphanedDB: [],
    orphanedBunny: [],
    staleBankEntries: [],
  };

  // 1. Check each video resource against Bunny
  console.log("─".repeat(70));
  console.log("  CHECK 1: Video Upload Status");
  console.log("─".repeat(70));

  for (const resource of videoResources) {
    const resourceID = resource.pKey.split("#")[1];
    const bankID = resource.sKey.split("@")[1];
    const bunnyVideo = bunnyMap.get(resource.videoID);

    if (!resource.videoID) {
      report.failedUploads.push({
        resourceID,
        bankID,
        name: resource.name,
        reason: "No videoID in DB record",
        videoID: null,
        createdAt: resource.createdAt,
      });
      continue;
    }

    if (!bunnyVideo) {
      // Video not found in Bunny — orphaned DB record
      report.orphanedDB.push({
        resourceID,
        bankID,
        name: resource.name,
        videoID: resource.videoID,
        isUploaded: resource.isUploaded,
        createdAt: resource.createdAt,
      });
      continue;
    }

    // Check Bunny status
    const status = bunnyVideo.status;
    if (status === 0 || status === 5 || status === 6) {
      report.failedUploads.push({
        resourceID,
        bankID,
        name: resource.name,
        videoID: resource.videoID,
        bunnyStatus: BUNNY_STATUS[status],
        bunnyStatusCode: status,
        isUploaded: resource.isUploaded,
        storageSize: bunnyVideo.storageSize,
        createdAt: resource.createdAt,
      });
    } else if (!resource.isUploaded && (status >= 1 && status <= 4)) {
      // Bunny says uploaded but DB says not — flag but don't delete
      console.log(
        `  [INFO] Resource "${resource.name}" (${resourceID}) — Bunny status: ${BUNNY_STATUS[status]}, but DB.isUploaded=false. Should update DB.`
      );
    }
  }

  // 2. Find duplicates (same name in same bank)
  console.log("\n" + "─".repeat(70));
  console.log("  CHECK 2: Duplicate Videos (same name in same bank)");
  console.log("─".repeat(70));

  const bankResourceMap = new Map(); // bankID -> Map(name -> [resources])
  for (const resource of videoResources) {
    const bankID = resource.sKey.split("@")[1];
    if (!bankResourceMap.has(bankID)) bankResourceMap.set(bankID, new Map());
    const nameMap = bankResourceMap.get(bankID);
    const name = resource.name.toLowerCase().trim();
    if (!nameMap.has(name)) nameMap.set(name, []);
    nameMap.get(name).push(resource);
  }

  for (const [bankID, nameMap] of bankResourceMap) {
    const bank = allBanks.find((b) => b.pKey === `BANK#${bankID}`);
    const bankTitle = bank?.title || "Unknown Bank";

    for (const [name, resources] of nameMap) {
      if (resources.length <= 1) continue;

      // Sort by createdAt — keep the newest successfully uploaded one
      const sorted = resources.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // Find the best one to keep: prefer isUploaded=true with Bunny status 4 (Finished)
      let keepIndex = sorted.findIndex((r) => {
        const bunny = bunnyMap.get(r.videoID);
        return r.isUploaded && bunny && bunny.status === 4;
      });
      if (keepIndex === -1) {
        // No finished one — keep the newest uploaded one
        keepIndex = sorted.findIndex((r) => {
          const bunny = bunnyMap.get(r.videoID);
          return r.isUploaded && bunny && bunny.status >= 1 && bunny.status <= 4;
        });
      }
      if (keepIndex === -1) keepIndex = 0; // keep newest if none are good

      const duplicateGroup = {
        bankID,
        bankTitle,
        name: sorted[0].name,
        count: sorted.length,
        keep: {
          resourceID: sorted[keepIndex].pKey.split("#")[1],
          videoID: sorted[keepIndex].videoID,
          isUploaded: sorted[keepIndex].isUploaded,
          bunnyStatus: bunnyMap.get(sorted[keepIndex].videoID)
            ? BUNNY_STATUS[bunnyMap.get(sorted[keepIndex].videoID).status]
            : "Not in Bunny",
          createdAt: sorted[keepIndex].createdAt,
        },
        remove: sorted
          .filter((_, i) => i !== keepIndex)
          .map((r) => ({
            resourceID: r.pKey.split("#")[1],
            videoID: r.videoID,
            isUploaded: r.isUploaded,
            bunnyStatus: bunnyMap.get(r.videoID)
              ? BUNNY_STATUS[bunnyMap.get(r.videoID).status]
              : "Not in Bunny",
            storageSize: bunnyMap.get(r.videoID)?.storageSize || 0,
            createdAt: r.createdAt,
          })),
      };

      report.duplicates.push(duplicateGroup);
    }
  }

  // 3. Orphaned Bunny videos (in Bunny but not in DB)
  console.log("\n" + "─".repeat(70));
  console.log("  CHECK 3: Orphaned Bunny Videos (not in DB)");
  console.log("─".repeat(70));

  for (const bunnyVideo of bunnyVideos) {
    if (!dbVideoIDs.has(bunnyVideo.guid)) {
      report.orphanedBunny.push({
        videoID: bunnyVideo.guid,
        title: bunnyVideo.title,
        status: BUNNY_STATUS[bunnyVideo.status],
        statusCode: bunnyVideo.status,
        storageSize: bunnyVideo.storageSize,
        collectionId: bunnyVideo.collectionId,
        dateUploaded: bunnyVideo.dateUploaded,
      });
    }
  }

  // 4. Stale bank.resources[] entries
  console.log("\n" + "─".repeat(70));
  console.log("  CHECK 4: Stale Bank Resource Arrays");
  console.log("─".repeat(70));

  for (const bank of allBanks) {
    const bankID = bank.pKey.split("#")[1];
    const bankResources = bank.resources || [];

    // Get actual resource IDs for this bank
    const actualResources = allResources.filter(
      (r) => r.sKey === `RESOURCE@${bankID}`
    );
    const actualIDs = new Set(actualResources.map((r) => r.pKey.split("#")[1]));

    const staleEntries = bankResources.filter(
      (r) => !actualIDs.has(r.resourceID)
    );
    const missingEntries = actualResources.filter(
      (r) => !bankResources.some((br) => br.resourceID === r.pKey.split("#")[1])
    );

    if (staleEntries.length > 0 || missingEntries.length > 0) {
      report.staleBankEntries.push({
        bankID,
        bankTitle: bank.title,
        bankPKey: bank.pKey,
        arrayCount: bankResources.length,
        actualCount: actualResources.length,
        staleCount: staleEntries.length,
        missingCount: missingEntries.length,
        staleEntries: staleEntries.map((r) => ({
          resourceID: r.resourceID,
          name: r.name,
        })),
      });
    }
  }

  // ── Print Report ──
  console.log("\n" + "=".repeat(70));
  console.log("  CLEANUP REPORT");
  console.log("=".repeat(70));

  // Failed uploads
  console.log(`\n  FAILED UPLOADS: ${report.failedUploads.length}`);
  for (const r of report.failedUploads) {
    console.log(
      `    - "${r.name}" | Bank: ${r.bankID.slice(0, 8)}... | Reason: ${r.reason || r.bunnyStatus} | Created: ${r.createdAt}`
    );
  }

  // Orphaned DB records
  console.log(`\n  ORPHANED DB RECORDS (video missing from Bunny): ${report.orphanedDB.length}`);
  for (const r of report.orphanedDB) {
    console.log(
      `    - "${r.name}" | Bank: ${r.bankID.slice(0, 8)}... | videoID: ${r.videoID.slice(0, 8)}... | DB.isUploaded: ${r.isUploaded}`
    );
  }

  // Duplicates
  console.log(`\n  DUPLICATE VIDEO GROUPS: ${report.duplicates.length}`);
  let totalDuplicateSize = 0;
  for (const group of report.duplicates) {
    console.log(
      `    "${group.name}" in "${group.bankTitle}" — ${group.count} copies`
    );
    console.log(
      `      KEEP: ${group.keep.resourceID.slice(0, 8)}... (${group.keep.bunnyStatus}, ${group.keep.createdAt})`
    );
    for (const r of group.remove) {
      totalDuplicateSize += r.storageSize || 0;
      console.log(
        `      REMOVE: ${r.resourceID.slice(0, 8)}... (${r.bunnyStatus}, ${formatSize(r.storageSize)}, ${r.createdAt})`
      );
    }
  }

  // Orphaned Bunny videos
  console.log(`\n  ORPHANED BUNNY VIDEOS (not in DB): ${report.orphanedBunny.length}`);
  let totalOrphanSize = 0;
  for (const v of report.orphanedBunny) {
    totalOrphanSize += v.storageSize || 0;
    console.log(
      `    - "${v.title}" | ${v.status} | ${formatSize(v.storageSize)} | ${v.dateUploaded}`
    );
  }

  // Stale bank entries
  console.log(`\n  BANKS WITH STALE RESOURCE ARRAYS: ${report.staleBankEntries.length}`);
  for (const b of report.staleBankEntries) {
    console.log(
      `    "${b.bankTitle}" — array: ${b.arrayCount}, actual: ${b.actualCount}, stale: ${b.staleCount}, missing: ${b.missingCount}`
    );
  }

  // Summary
  const totalToDelete =
    report.failedUploads.length +
    report.orphanedDB.length +
    report.duplicates.reduce((sum, g) => sum + g.remove.length, 0);
  const totalBunnyToDelete =
    report.failedUploads.filter((r) => r.videoID).length +
    report.duplicates.reduce((sum, g) => sum + g.remove.filter((r) => r.videoID).length, 0) +
    report.orphanedBunny.length;
  const totalSizeToFree = totalDuplicateSize + totalOrphanSize;

  console.log("\n" + "=".repeat(70));
  console.log("  SUMMARY");
  console.log("=".repeat(70));
  console.log(`  DB resources to delete:    ${totalToDelete}`);
  console.log(`  Bunny videos to delete:    ${totalBunnyToDelete}`);
  console.log(`  Storage to free:           ${formatSize(totalSizeToFree)}`);
  console.log(`  Banks to sync:             ${report.staleBankEntries.length}`);

  // Save report to file
  const reportPath = resolve(__dirname, `cleanup-report-${Date.now()}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n  Report saved to: ${reportPath}`);

  // ── Execute cleanup ──
  if (!EXECUTE) {
    console.log(
      "\n  Run with --execute flag to perform cleanup: node scripts/cleanup-videos.mjs --execute"
    );
    return;
  }

  console.log("\n" + "=".repeat(70));
  console.log("  EXECUTING CLEANUP...");
  console.log("=".repeat(70));

  let deletedDB = 0;
  let deletedBunny = 0;
  let syncedBanks = 0;
  const errors = [];

  // Delete failed uploads
  for (const r of report.failedUploads) {
    try {
      if (r.videoID) {
        await deleteBunnyVideo(r.videoID);
        deletedBunny++;
        console.log(`  [Bunny] Deleted video: ${r.videoID}`);
      }
      await deleteDBResource(r.resourceID, r.bankID);
      deletedDB++;
      console.log(`  [DB] Deleted resource: ${r.resourceID} ("${r.name}")`);
    } catch (err) {
      errors.push({ type: "failedUpload", resourceID: r.resourceID, error: err.message });
      console.error(`  [ERROR] Failed to delete ${r.resourceID}: ${err.message}`);
    }
  }

  // Delete orphaned DB records (no Bunny video)
  for (const r of report.orphanedDB) {
    try {
      await deleteDBResource(r.resourceID, r.bankID);
      deletedDB++;
      console.log(`  [DB] Deleted orphaned resource: ${r.resourceID} ("${r.name}")`);
    } catch (err) {
      errors.push({ type: "orphanedDB", resourceID: r.resourceID, error: err.message });
      console.error(`  [ERROR] Failed to delete ${r.resourceID}: ${err.message}`);
    }
  }

  // Delete duplicate copies (keep the best one)
  for (const group of report.duplicates) {
    for (const r of group.remove) {
      try {
        if (r.videoID) {
          await deleteBunnyVideo(r.videoID);
          deletedBunny++;
          console.log(`  [Bunny] Deleted duplicate video: ${r.videoID}`);
        }
        await deleteDBResource(r.resourceID, group.bankID);
        deletedDB++;
        console.log(
          `  [DB] Deleted duplicate resource: ${r.resourceID} ("${group.name}")`
        );
      } catch (err) {
        errors.push({ type: "duplicate", resourceID: r.resourceID, error: err.message });
        console.error(`  [ERROR] Failed to delete ${r.resourceID}: ${err.message}`);
      }
    }
  }

  // Delete orphaned Bunny videos
  for (const v of report.orphanedBunny) {
    try {
      await deleteBunnyVideo(v.videoID);
      deletedBunny++;
      console.log(`  [Bunny] Deleted orphaned video: ${v.videoID} ("${v.title}")`);
    } catch (err) {
      errors.push({ type: "orphanedBunny", videoID: v.videoID, error: err.message });
      console.error(`  [ERROR] Failed to delete Bunny video ${v.videoID}: ${err.message}`);
    }
  }

  // Sync bank resource arrays
  const banksToSync = new Set();
  // Collect all affected bank IDs
  for (const r of report.failedUploads) banksToSync.add(r.bankID);
  for (const r of report.orphanedDB) banksToSync.add(r.bankID);
  for (const g of report.duplicates) banksToSync.add(g.bankID);
  for (const b of report.staleBankEntries) banksToSync.add(b.bankID);

  for (const bankID of banksToSync) {
    try {
      await syncBankResources(`BANK#${bankID}`, bankID);
      syncedBanks++;
      console.log(`  [DB] Synced bank resources array: ${bankID}`);
    } catch (err) {
      errors.push({ type: "bankSync", bankID, error: err.message });
      console.error(`  [ERROR] Failed to sync bank ${bankID}: ${err.message}`);
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("  CLEANUP COMPLETE");
  console.log("=".repeat(70));
  console.log(`  DB resources deleted:   ${deletedDB}`);
  console.log(`  Bunny videos deleted:   ${deletedBunny}`);
  console.log(`  Banks synced:           ${syncedBanks}`);
  console.log(`  Errors:                 ${errors.length}`);

  if (errors.length > 0) {
    const errPath = resolve(__dirname, `cleanup-errors-${Date.now()}.json`);
    writeFileSync(errPath, JSON.stringify(errors, null, 2));
    console.log(`  Error details saved to: ${errPath}`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
