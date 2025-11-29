import { dynamoDB } from "../awsAgent.js";
import {
  PutCommand,
  QueryCommand,
  GetCommand,
  TransactWriteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { getInstitute } from "./instituteControllers.js";
import { getUserByID } from "../user/userController.js";
import { randomUUID } from "crypto";

const MASTER_TABLE = `${process.env.AWS_DB_NAME}master`;
const MASTER_TABLE_INDEX = "masterTableIndex";

/**
 * Create a new batch under an institute.
 */
export async function createBatch({ instituteID, title }) {
  const batchCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const inst = await getInstitute({ instituteID });
  if (!inst.success) {
    throw new Error(inst.message);
  }

  const now = Date.now();
  const newItem = {
    pKey: `BATCH#${randomUUID()}`,
    sKey: "BATCHES",
    "GSI1-pKey": "BATCHES",
    "GSI1-sKey": `BATCH@${instituteID}`,
    batchCode,
    title,
    instituteID,
    instituteMeta: {
      title: inst.data.title,
      email: inst.data.email,
      status: inst.data.status,
    },
    status: "LOCKED", // default locked
    capacity: 1,
    enrolledStudentCount: 0, // start at 0
    startDate: null,
    endDate: null,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await dynamoDB.send(
      new PutCommand({
        TableName: MASTER_TABLE,
        Item: newItem,
        ConditionExpression: "attribute_not_exists(pKey)", // ensure no overwrite
      })
    );

    return {
      success: true,
      message: "Batch created successfully",
      data: {
        id: newItem.pKey.split("#")[1],
        batchCode: newItem.batchCode,
        title: newItem.title,
        status: newItem.status,
        capacity: newItem.capacity,
        enrolledStudentCount: newItem.enrolledStudentCount,
        instituteID: newItem.instituteID,
        instituteMeta: newItem.instituteMeta,
        startDate: newItem.startDate,
        endDate: newItem.endDate,
        createdAt: newItem.createdAt,
        updatedAt: newItem.updatedAt,
      },
    };
  } catch (err) {
    console.error("Error creating batch:", err);
    throw new Error("Error creating batch");
  }
}

/**
 * Fetch all batches for a given institute.
 */
export async function getAllBatchesByInstituteID({ instituteID }) {
  const inst = await getInstitute({ instituteID });
  if (!inst.success) {
    throw new Error(inst.message);
  }

  const params = {
    TableName: MASTER_TABLE,
    IndexName: MASTER_TABLE_INDEX,
    KeyConditionExpression: "#gsi1pk = :pKey AND #gsi1sk = :sKey",
    ExpressionAttributeNames: {
      "#gsi1pk": "GSI1-pKey",
      "#gsi1sk": "GSI1-sKey",
    },
    ExpressionAttributeValues: {
      ":pKey": "BATCHES",
      ":sKey": `BATCH@${instituteID}`,
    },
  };

  try {
    const result = await dynamoDB.send(new QueryCommand(params));
    const batchList = result.Items.map((item) => ({
      id: item.pKey.split("#")[1],
      batchCode: item.batchCode,
      title: item.title,
      status: item.status,
      capacity: item.capacity,
      enrolledStudentCount: item.enrolledStudentCount,
      startDate: item.startDate,
      endDate: item.endDate,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return {
      success: true,
      message: "Batches fetched successfully",
      data: {
        instituteMeta: inst.data,
        batchList,
      },
    };
  } catch (err) {
    console.error("Error fetching batches:", err);
    throw new Error("Error fetching batches");
  }
}

/**
 * Fetch all batches (for admin or global view).
 */
export async function getAllBatches() {
  const params = {
    TableName: MASTER_TABLE,
    IndexName: MASTER_TABLE_INDEX,
    KeyConditionExpression: "#gsi1pk = :pKey",
    ExpressionAttributeNames: {
      "#gsi1pk": "GSI1-pKey",
    },
    ExpressionAttributeValues: {
      ":pKey": "BATCHES",
    },
  };

  try {
    const result = await dynamoDB.send(new QueryCommand(params));
    const data = result.Items.map((item) => ({
      id: item.pKey.split("#")[1],
      batchCode: item.batchCode,
      title: item.title,
      status: item.status,
      capacity: item.capacity,
      enrolledStudentCount: item.enrolledStudentCount,
      startDate: item.startDate,
      endDate: item.endDate,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      instituteID: item.instituteID,
      instituteMeta: item.instituteMeta,
    }));
    return {
      success: true,
      message: "Batches fetched successfully",
      data,
    };
  } catch (err) {
    console.error("Error fetching all batches:", err);
    throw new Error("Error fetching all batches");
  }
}

/**
 * Fetch a single batch by its ID.
 */
export async function getBatch({ batchID }) {
  const params = {
    TableName: MASTER_TABLE,
    Key: {
      pKey: `BATCH#${batchID}`,
      sKey: "BATCHES",
    },
  };
  try {
    const result = await dynamoDB.send(new GetCommand(params));
    if (!result.Item) {
      throw new Error("Batch not found");
    }
    const item = result.Item;
    return {
      success: true,
      message: "Batch fetched successfully",
      data: {
        id: item.pKey.split("#")[1],
        batchCode: item.batchCode,
        title: item.title,
        status: item.status,
        capacity: item.capacity,
        enrolledStudentCount: item.enrolledStudentCount,
        startDate: item.startDate,
        endDate: item.endDate,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        instituteID: item.instituteID,
        instituteMeta: item.instituteMeta,
      },
    };
  } catch (err) {
    console.error("Error fetching batch:", err);
    throw new Error("Error fetching batch");
  }
}

/**
 * Enroll a student into a batch.
 *
 * Only succeeds if:
 *   - The batch exists and has status = "UNLOCKED"
 *   - enrolledStudentCount < capacity
 *   - The STUDENT_BATCH record does not already exist
 *
 * Uses a single TransactWrite to guarantee atomicity.
 */
export async function enrollStudentInBatch({ userID, batchID, rollNo }) {
  const now = Date.now();

  // 1) Fetch user and batch metadata (we need studentMeta and batchMeta)
  const studentResp = await getUserByID(userID);
  if (!studentResp.success) {
    throw new Error(studentResp.message);
  }
  const studentMeta = {
    name: studentResp.data.name,
    email: studentResp.data.email,
  };

  const batchResp = await getBatch({ batchID });
  if (!batchResp.success) {
    throw new Error(batchResp.message);
  }
  const batchData = batchResp.data;

  try {
    await dynamoDB.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: MASTER_TABLE,
              Item: {
                pKey: `STUDENT_BATCH#${userID}`,
                sKey: `STUDENT_BATCH@${batchID}`,
                "GSI1-pKey": "STUDENT_BATCHES",
                "GSI1-sKey": `STUDENT_BATCH@${batchID}`,
                userID,
                batchID,
                studentMeta,
                batchMeta: {
                  id: batchID,
                  title: batchData.title,
                  instituteID: batchData.instituteID,
                  instituteMeta: batchData.instituteMeta,
                },
                rollNo: rollNo || null,
                joinedAt: now,
              },
              ConditionExpression:
                "attribute_not_exists(pKey) AND attribute_not_exists(sKey)",
            },
          },
          {
            Update: {
              TableName: MASTER_TABLE,
              Key: {
                pKey: `BATCH#${batchID}`,
                sKey: "BATCHES",
              },
              UpdateExpression:
                "SET enrolledStudentCount = enrolledStudentCount + :inc, updatedAt = :u",
              ConditionExpression:
                "attribute_exists(pKey) AND #st = :unlocked AND enrolledStudentCount < #capacity",
              ExpressionAttributeNames: {
                "#st": "status",
                "#capacity": "capacity",
              },
              ExpressionAttributeValues: {
                ":inc": 1,
                ":u": now,
                ":unlocked": "UNLOCKED",
              },
            },
          },
        ],
      })
    );

    return { success: true, message: "Student enrolled in batch" };
  } catch (err) {
    // AWS SDK v2 uses `err.CancellationReasons` (capital “C”)
    const reasons = Array.isArray(err.CancellationReasons)
      ? err.CancellationReasons
      : [];

    // If the Put (index 0) failed, reasons[0].Code will be "ConditionalCheckFailed"
    if (reasons[0]?.Code === "ConditionalCheckFailed") {
      throw new Error("Student is already enrolled in this batch");
    }

    // If the Update (index 1) failed, reasons[1].Code === "ConditionalCheckFailed"
    if (reasons[1]?.Code === "ConditionalCheckFailed") {
      // Refetch the batch to determine whether it's locked or full
      const latest = await getBatch({ batchID });
      if (!latest.success) {
        throw new Error("Batch update failed and could not refetch batch info");
      }
      const { status, enrolledStudentCount, capacity } = latest.data;

      if (status !== "UNLOCKED") {
        throw new Error("Batch is locked");
      } else if (enrolledStudentCount >= capacity) {
        throw new Error("Batch has reached its capacity");
      } else {
        throw new Error("Failed to enroll due to unknown batch constraint");
      }
    }

    console.error("Error in enrollStudentInBatch:", err);
    throw new Error("Error enrolling student in batch");
  }
}

/**
 * Remove a student from a batch.
 *
 * We’ll delete the STUDENT_BATCH record and decrement the batch’s enrolledStudentCount.
 * We guard so that enrolledStudentCount never goes below zero.
 */
export async function removeStudentFromBatch(userID, batchID) {
  try {
    await dynamoDB.send(
      new TransactWriteCommand({
        TransactItems: [
          // 1) Delete the join record
          {
            Delete: {
              TableName: MASTER_TABLE,
              Key: {
                pKey: `STUDENT_BATCH#${userID}`,
                sKey: `STUDENT_BATCH@${batchID}`,
              },
              ConditionExpression:
                "attribute_exists(pKey) AND attribute_exists(sKey)",
            },
          },
          // 2) Decrement enrolledStudentCount, but only if > 0
          {
            Update: {
              TableName: MASTER_TABLE,
              Key: {
                pKey: `BATCH#${batchID}`,
                sKey: "BATCHES",
              },
              UpdateExpression:
                "SET enrolledStudentCount = enrolledStudentCount - :dec, updatedAt = :u",
              ConditionExpression:
                "attribute_exists(pKey) AND enrolledStudentCount > :zero",
              ExpressionAttributeValues: {
                ":dec": 1,
                ":u": Date.now(),
                ":zero": 0,
              },
            },
          },
        ],
      })
    );

    return { success: true, message: "Student removed from batch" };
  } catch (err) {
    // If the student‐batch delete failed or the decrement failed, it will be a ConditionalCheckFailed
    console.error("Error in removeStudentFromBatch:", err);
    if (
      err.code === "TransactionCanceledException" &&
      Array.isArray(err.cancellationReasons)
    ) {
      const reasons = err.cancellationReasons;
      if (reasons[0]?.Code === "ConditionalCheckFailed") {
        throw new Error("Student was not enrolled in this batch");
      }
      if (reasons[1]?.Code === "ConditionalCheckFailed") {
        throw new Error("Cannot decrement count below zero");
      }
    }
    throw new Error("Error removing student from batch");
  }
}

/**
 * Fetch all student‐batch join records for a given batch.
 */
export async function getStudentsForBatch(batchID) {
  const params = {
    TableName: MASTER_TABLE,
    IndexName: MASTER_TABLE_INDEX,
    KeyConditionExpression: "#gsi1pk = :pk AND #gsi1sk = :sk",
    ExpressionAttributeNames: {
      "#gsi1pk": "GSI1-pKey",
      "#gsi1sk": "GSI1-sKey",
    },
    ExpressionAttributeValues: {
      ":pk": "STUDENT_BATCHES",
      ":sk": `STUDENT_BATCH@${batchID}`,
    },
  };

  try {
    const result = await dynamoDB.send(new QueryCommand(params));
    const data = result.Items.map((item) => ({
      id: item.pKey.split("#")[1], // studentID
      userID: item.userID,
      batchID: item.batchID,
      studentMeta: item.studentMeta,
      batchMeta: item.batchMeta,
      rollNo: item.rollNo,
      joinedAt: item.joinedAt,
    }));
    return {
      success: true,
      message: "Students fetched successfully",
      data,
    };
  } catch (err) {
    console.error("Error fetching students for batch:", err);
    throw new Error("Error fetching students for batch");
  }
}

/**
 * Sets a batch’s status to either "LOCKED" or "UNLOCKED".
 *
 * If `shouldLock = true`: it will only succeed if the batch exists AND status = "UNLOCKED".
 * If `shouldLock = false`: it will only succeed if the batch exists AND status = "LOCKED".
 *
 * @param {string} batchID      – the UUID portion of pKey (so pKey = `BATCH#${batchID}`)
 * @param {boolean} shouldLock  – true  to lock, false to unlock
 * @returns {Promise<{ success: boolean, updatedAttributes: object }>}
 * @throws  Error if the batch doesn’t exist or is already in the desired state
 */
export async function setBatchLockState(batchID, shouldLock) {
  const now = Date.now();
  // Determine target and required current status:
  const targetStatus = shouldLock ? "LOCKED" : "UNLOCKED";
  // const requiredOld = shouldLock ? "UNLOCKED" : "LOCKED";

  const params = {
    TableName: MASTER_TABLE,
    Key: {
      pKey: `BATCH#${batchID}`,
      sKey: "BATCHES",
    },
    UpdateExpression: "SET #st = :target, updatedAt = :u",
    // ConditionExpression: "attribute_exists(pKey) AND #st = :requiredOld",
    ExpressionAttributeNames: {
      "#st": "status",
    },
    ExpressionAttributeValues: {
      ":target": targetStatus,
      // ":requiredOld": requiredOld,
      ":u": now,
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const resp = await dynamoDB.send(new UpdateCommand(params));
    return { success: true, updatedAttributes: resp.Attributes };
  } catch (err) {
    if (
      err.code === "ConditionalCheckFailedException" ||
      err.code === "ConditionalCheckFailed"
    ) {
      throw new Error(
        `Cannot ${
          shouldLock ? "lock" : "unlock"
        } batch. Either it does not exist or is already ${targetStatus}.`
      );
    }
    throw new Error("Error updating batch lock state");
  }
}

/**
 * Updates the capacity of a batch.
 * Will only succeed if:
 *  • The batch exists
 *  • The newCapacity is >= the current enrolledStudentCount (to avoid dropping below already‐enrolled students)
 *
 * @param {string} batchID     – the UUID portion of pKey (i.e. pKey = `BATCH#${batchID}`)
 * @param {number} newCapacity – the new capacity (must be a positive integer)
 */
export async function updateBatchCapacity(batchID, newCapacity) {
  if (!Number.isInteger(newCapacity) || newCapacity < 0) {
    throw new Error("newCapacity must be a non‐negative integer");
  }
  const now = Date.now();

  // We compare enrolledStudentCount <= newCapacity to prevent underflow
  const params = {
    TableName: MASTER_TABLE,
    Key: {
      pKey: `BATCH#${batchID}`,
      sKey: "BATCHES",
    },
    UpdateExpression: "SET #capacity = :newCap, updatedAt = :u",
    ConditionExpression:
      "attribute_exists(pKey) AND (attribute_not_exists(#enrolled) OR #enrolled <= :newCap)",
    ExpressionAttributeNames: {
      "#capacity": "capacity",
      "#enrolled": "enrolledStudentCount",
    },
    ExpressionAttributeValues: {
      ":newCap": newCapacity,
      ":u": now,
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const resp = await dynamoDB.send(new UpdateCommand(params));
    return { success: true, updatedAttributes: resp.Attributes };
  } catch (err) {
    if (
      err.code === "ConditionalCheckFailedException" ||
      err.code === "ConditionalCheckFailed"
    ) {
      throw new Error(
        "Cannot update capacity: batch does not exist or newCapacity is less than enrolledStudentCount"
      );
    }
    console.error("Error updating batch capacity:", err);
    throw new Error("Could not update batch capacity");
  }
}
