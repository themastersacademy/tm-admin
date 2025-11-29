import { dynamoDB, s3 } from "../awsAgent";
import {
  PutCommand,
  TransactWriteCommand,
  QueryCommand,
  UpdateCommand,
  GetCommand,
  BatchGetCommand,
} from "@aws-sdk/lib-dynamodb";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { getExamGroup } from "./groupExamController";
import { validateExamForBlob, validateBatchListLimit } from "./examValidation";

export async function createExam({
  type,
  title = "",
  groupID = null,
  goalID = null,
  batchList = [],
}) {
  // --- 1. Validate input ---
  //check if type is valid
  if (!["mock", "group", "scheduled"].includes(type)) {
    throw new Error("Invalid exam type");
  }
  //check if goalID is valid
  if (type !== "scheduled" && !goalID) {
    throw new Error("Goal ID is required");
  }
  if (type === "group" && !groupID) {
    throw new Error("Group ID is required");
  }
  if (type === "scheduled" && !batchList.length) {
    throw new Error("Batch list is required");
  }
  if (type === "scheduled") {
    validateBatchListLimit(batchList);
  }

  // --- 2. Prepare keys & timestamps ---
  const examID = randomUUID();
  const now = Date.now();
  let group;
  if (type === "group") {
    group = await getExamGroup(groupID);
    if (!group.success) {
      throw new Error("Group not found");
    }
  }

  // --- 3. Create exam ---
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    IndexName: "masterTableIndex",
    Item: {
      pKey: `EXAM#${examID}`,
      sKey: `EXAMS@${type}`,
      "GSI1-pKey": "EXAMS",
      "GSI1-sKey": "EXAMS",
      type,
      title,
      createdAt: now,
      updatedAt: now,
      ...((type === "mock" || type === "group") && { goalID }),
      ...(type === "group" && { groupID }),
      ...(type === "scheduled" && { batchList }),
      isLive: false,
      blobVersion: 0,
      blobBucketKey: null,
      blobUpdatedAt: null,
      duration: null,
      startTimeStamp: null,
      isLifeTime: true,
      endTimeStamp: null,
      questionSection: [],
      answerList: [],
      totalQuestions: 0,
      totalSections: 0,
      totalMarks: 0,
      settings: {
        isAntiCheat: false,
        isFullScreenMode: false,
        isProTest: false,
        isShowResult: true,
        isRandomQuestion: false,
        mCoinReward: {
          isEnabled: false,
          conditionPercent: 0,
          rewardCoin: 0,
        },
      },
    },
    ConditionExpression: "attribute_not_exists(pKey)",
  };

  const transactItems = [];
  if (type === "scheduled") {
    batchList.forEach((batch) => {
      transactItems.push({
        Put: {
          TableName: `${process.env.AWS_DB_NAME}master`,
          Item: {
            pKey: `BATCH_EXAM#${batch}`,
            sKey: `BATCH_EXAMS@${examID}`,
            "GSI1-pKey": "BATCH_EXAMS",
            "GSI1-sKey": `BATCH_EXAMS#${examID}`,
            batchID: batch,
            examID,
            createdAt: now,
            updatedAt: now,
          },
          ConditionExpression:
            "attribute_not_exists(pKey) AND attribute_not_exists(sKey)",
        },
      });
    });
  }

  if (type === "group") {
    params.Item.settings = group.data.settings;
  }
  // --- 4. Save exam to database ---
  try {
    await dynamoDB.send(new PutCommand(params));
    if (type === "scheduled") {
      await dynamoDB.send(
        new TransactWriteCommand({ TransactItems: transactItems })
      );
    }
    return {
      success: true,
      message: "Exam created successfully",
    };
  } catch (error) {
    console.error("error", error);
    throw error;
  }
}

export async function getExamByID(examID) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    IndexName: "masterTableIndex",
    KeyConditionExpression: "#gsiPK = :examKey AND #gsiSK = :entity",
    FilterExpression: "pKey = :pkey",
    ExpressionAttributeNames: {
      "#gsiPK": "GSI1-pKey",
      "#gsiSK": "GSI1-sKey",
    },
    ExpressionAttributeValues: {
      ":examKey": "EXAMS",
      ":entity": "EXAMS",
      ":pkey": `EXAM#${examID}`,
    },
  };

  try {
    const result = await dynamoDB.send(new QueryCommand(params));
    if (!result.Items || result.Items.length === 0) {
      return {
        success: false,
        message: "Exam not found",
      };
    }
    return {
      success: true,
      message: "Exam retrieved successfully",
      data: {
        ...result.Items[0],
        id: result.Items[0].pKey.split("#")[1],
        goalID: result.Items[0].sKey.split("@")[2],
        pKey: undefined,
        sKey: undefined,
        "GSI1-pKey": undefined,
        "GSI1-sKey": undefined,
      },
    };
  } catch (error) {
    throw error;
  }
}

export async function getExamByGoalID({ goalID, type }) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    IndexName: "masterTableIndex",
    KeyConditionExpression: "#gsiPK = :examKey AND #gsiSK = :entity",
    FilterExpression: "sKey = :skey AND goalID = :goalID",
    ExpressionAttributeNames: {
      "#gsiPK": "GSI1-pKey",
      "#gsiSK": "GSI1-sKey",
    },
    ExpressionAttributeValues: {
      ":examKey": "EXAMS",
      ":entity": "EXAMS",
      ":skey": `EXAMS@${type}`,
      ":goalID": goalID,
    },
  };

  try {
    const result = await dynamoDB.send(new QueryCommand(params));
    console.log("result", result);
    return {
      success: true,
      message: "Exam retrieved successfully",
      data: result.Items.map((item) => ({
        id: item.pKey.split("#")[1],
        goalID: item.sKey.split("@")[2],
        isLive: item.isLive,
        title: item.title,
        startTimeStamp: item.startTimeStamp,
        duration: item.duration,
        totalQuestions: item.totalQuestions,
        totalSections: item.totalSections,
        totalMarks: item.totalMarks,
        pKey: undefined,
        sKey: undefined,
        "GSI1-pKey": undefined,
        "GSI1-sKey": undefined,
      })),
    };
  } catch (error) {
    throw error;
  }
}

export async function updateExamBasicInfo({
  examID,
  type,
  title,
  duration,
  isShowResult,
  isAntiCheat,
  isFullScreenMode,
  isProTest,
  startTimeStamp,
  mCoinRewardIsEnabled,
  mCoinRewardConditionPercent,
  mCoinRewardRewardCoin,
  isRandomQuestion,
  isLifeTime,
  endTimeStamp,
}) {
  const now = Date.now();
  const updates = [`updatedAt = :updatedAt`];
  const exprVals = { ":updatedAt": now };
  const exprNames = {}; // only if you later need to alias a reserved word

  if (title !== undefined) {
    updates.push("title = :title");
    exprVals[":title"] = title;
  }
  if (duration !== undefined) {
    exprNames["#dur"] = "duration";
    updates.push("#dur = :duration");
    exprVals[":duration"] = duration;
  }
  if (startTimeStamp !== undefined) {
    // if (startTimeStamp < now) {
    //   throw new Error("Exam schedule must be in the future");
    // }
    // alias startTimeStamp in case it’s reserved
    exprNames["#startTS"] = "startTimeStamp";
    updates.push("#startTS = :startTimeStamp");
    exprVals[":startTimeStamp"] = startTimeStamp;
  }
  // Now update the nested settings object:
  if (isShowResult !== undefined) {
    updates.push("settings.isShowResult = :isShowResult");
    exprVals[":isShowResult"] = isShowResult;
  }
  if (isAntiCheat !== undefined) {
    updates.push("settings.isAntiCheat = :isAntiCheat");
    exprVals[":isAntiCheat"] = isAntiCheat;
  }
  if (isFullScreenMode !== undefined) {
    updates.push("settings.isFullScreenMode = :isFullScreenMode");
    exprVals[":isFullScreenMode"] = isFullScreenMode;
  }
  if (isProTest !== undefined) {
    updates.push("settings.isProTest = :isProTest");
    exprVals[":isProTest"] = isProTest;
  }
  if (isRandomQuestion !== undefined) {
    updates.push("settings.isRandomQuestion = :isRandomQuestion");
    exprVals[":isRandomQuestion"] = isRandomQuestion;
  }
  if (mCoinRewardIsEnabled !== undefined) {
    updates.push("settings.mCoinReward.isEnabled = :mCoinRewardIsEnabled");
    exprVals[":mCoinRewardIsEnabled"] = mCoinRewardIsEnabled;
  }
  if (mCoinRewardConditionPercent !== undefined) {
    updates.push(
      "settings.mCoinReward.conditionPercent = :mCoinRewardConditionPercent"
    );
    exprVals[":mCoinRewardConditionPercent"] = mCoinRewardConditionPercent;
  }
  if (mCoinRewardRewardCoin !== undefined) {
    updates.push("settings.mCoinReward.rewardCoin = :mCoinRewardRewardCoin");
    exprVals[":mCoinRewardRewardCoin"] = mCoinRewardRewardCoin;
  }
  if (isLifeTime !== undefined) {
    updates.push("isLifeTime = :isLifeTime");
    exprVals[":isLifeTime"] = isLifeTime;
  }
  if (endTimeStamp !== undefined) {
    if (endTimeStamp < now) {
      throw new Error("Exam end time must be in the future");
    }
    // alias endTimeStamp in case it’s reserved
    exprNames["#endTS"] = "endTimeStamp";
    updates.push("#endTS = :endTimeStamp");
    exprVals[":endTimeStamp"] = endTimeStamp;
  }
  if (updates.length === 1) {
    // only updatedAt was added
    throw new Error("No updatable fields provided.");
  }

  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: `EXAM#${examID}`,
      sKey: `EXAMS@${type}`,
    },
    UpdateExpression: "SET " + updates.join(", "),
    ExpressionAttributeValues: {
      ...exprVals,
      ":isLive": false,
    },
    // only include this if exprNames isn’t empty:
    ...(Object.keys(exprNames).length && {
      ExpressionAttributeNames: exprNames,
    }),
    ConditionExpression: "attribute_exists(pKey) AND isLive = :isLive",
  };

  // if (duration) {
  //   params.ExpressionAttributeNames = expressionAttributeNames;
  // }

  try {
    await dynamoDB.send(new UpdateCommand(params));
    return {
      success: true,
      message: "Exam updated successfully",
    };
  } catch (error) {
    throw error;
  }
}

export async function updateBatchListExamBasicInfo({ batchList, examID }) {
  // 1) Validate that this is a scheduled exam
  const res = await getExamByID(examID);
  if (!res.success) throw new Error("Exam not found");
  if (res.data.type !== "scheduled") throw new Error("Exam is not scheduled");

  const existing = res.data.batchList || [];
  const now = Date.now();

  validateBatchListLimit(batchList);

  // 2) Compute diffs
  const oldSet = new Set(existing);
  const newSet = new Set(batchList);

  const toAdd = batchList.filter((b) => !oldSet.has(b));
  const toRemove = existing.filter((b) => !newSet.has(b));
  const toKeep = batchList.filter((b) => oldSet.has(b));

  // 3) Build TransactWrite items
  const TransactItems = [];

  // ➕ Add new links
  for (const batchID of toAdd) {
    TransactItems.push({
      Put: {
        TableName: `${process.env.AWS_DB_NAME}master`,
        Item: {
          pKey: `BATCH_EXAM#${batchID}`,
          sKey: `BATCH_EXAMS@${examID}`,
          "GSI1-pKey": "BATCH_EXAMS",
          "GSI1-sKey": `BATCH_EXAMS#${examID}`,
          batchID,
          examID,
          createdAt: now,
          updatedAt: now,
        },
      },
    });
  }

  // ➖ Remove old links
  for (const batchID of toRemove) {
    TransactItems.push({
      Delete: {
        TableName: `${process.env.AWS_DB_NAME}master`,
        Key: {
          pKey: `BATCH_EXAM#${batchID}`,
          sKey: `BATCH_EXAMS@${examID}`,
        },
      },
    });
  }

  // If there's nothing to do, bail out
  if (TransactItems.length === 0) {
    return { success: true, message: "No batch changes" };
  }

  // 🔄 Refresh timestamp on unchanged links
  for (const batchID of toKeep) {
    TransactItems.push({
      Update: {
        TableName: `${process.env.AWS_DB_NAME}master`,
        Key: {
          pKey: `BATCH_EXAM#${batchID}`,
          sKey: `BATCH_EXAMS@${examID}`,
        },
        UpdateExpression: "SET updatedAt = :u",
        ExpressionAttributeValues: {
          ":u": now,
        },
      },
    });
  }

  //Update batchList in exam
  const updateExamParams = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: `EXAM#${examID}`,
      sKey: `EXAMS@scheduled`,
    },
    UpdateExpression: "SET batchList = :batchList",
    ExpressionAttributeValues: {
      ":batchList": batchList,
    },
  };

  console.log("updateExamParams", updateExamParams);
  console.log("TransactItems", TransactItems);

  try {
    await dynamoDB.send(new TransactWriteCommand({ TransactItems }));
    await dynamoDB.send(new UpdateCommand(updateExamParams));
    return { success: true, message: "Batch list updated successfully" };
  } catch (error) {
    throw error;
  }
}

export async function createAndUpdateExamSection({
  examID,
  type,
  sectionTitle,
  sectionIndex,
  pMark,
  nMark,
}) {
  if (!examID || !type) {
    throw new Error("examID and type are required");
  }
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: `EXAM#${examID}`,
      sKey: `EXAMS@${type}`,
    },
  };

  const updateExpressions = ["updatedAt = :updatedAt"];
  const expressionAttributeValues = {
    ":updatedAt": Date.now(),
    ":isLive": false,
  };

  if (sectionIndex === undefined) {
    // Creating a new exam section
    updateExpressions.push(
      "questionSection = list_append(if_not_exists(questionSection, :emptyList), :newSection)"
    );
    expressionAttributeValues[":emptyList"] = [];
    expressionAttributeValues[":newSection"] = [
      {
        title: sectionTitle || "",
        questions: [],
        pMark: pMark || 0,
        nMark: nMark || 0,
      },
    ];

    params.ConditionExpression = "attribute_exists(pKey) AND isLive = :isLive";
    params.ExpressionAttributeValues = {
      ":isLive": false,
      ...expressionAttributeValues,
    };
    params.UpdateExpression = "set " + updateExpressions.join(", ");
    params.ExpressionAttributeValues = expressionAttributeValues;
  } else {
    // Updating an existing exam section
    if (pMark !== undefined) {
      updateExpressions.push(`questionSection[${sectionIndex}].pMark = :pMark`);
      expressionAttributeValues[":pMark"] = pMark;
    }

    if (nMark !== undefined) {
      updateExpressions.push(`questionSection[${sectionIndex}].nMark = :nMark`);
      expressionAttributeValues[":nMark"] = nMark;
    }

    if (sectionTitle !== undefined) {
      updateExpressions.push(
        `questionSection[${sectionIndex}].title = :sectionTitle`
      );
      expressionAttributeValues[":sectionTitle"] = sectionTitle;
    }

    if (updateExpressions.length === 0) {
      throw new Error("No optional fields provided for update.");
    }

    params.UpdateExpression = "set " + updateExpressions.join(", ");
    params.ConditionExpression = "attribute_exists(pKey) AND isLive = :isLive";
    params.ExpressionAttributeValues = expressionAttributeValues;
  }

  try {
    console.log(params);
    await dynamoDB.send(new UpdateCommand(params));
    return {
      success: true,
      message:
        sectionIndex === undefined
          ? "Exam section created successfully"
          : "Exam section updated successfully",
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function addQuestionToExamSection({
  examID,
  type,
  questions, // Array of objects with at least questionID and subjectID
  sectionIndex, // Index of the section to update
}) {
  const masterTable = `${process.env.AWS_DB_NAME}master`;

  // Process questions: store only questionID and subjectID.
  const processedQuestions = questions.map((q) => ({
    questionID: q.questionID,
    subjectID: q.subjectID,
  }));

  // Fetch the exam item from the master table.
  const examParams = {
    TableName: masterTable,
    Key: {
      pKey: `EXAM#${examID}`,
      sKey: `EXAMS@${type}`,
    },
  };
  const examResult = await dynamoDB.send(new GetCommand(examParams));
  const examData = examResult.Item;
  if (!examData) {
    throw new Error("Exam not found");
  }

  if (examData.isLive) {
    throw new Error("Exam is live");
  }

  // Get the current questionSection array (or default to an empty array).
  let questionSection = examData.questionSection || [];

  // If the section already exists, check and append only new questions.
  if (sectionIndex < questionSection.length) {
    // Ensure the section object has a questions array.
    if (!Array.isArray(questionSection[sectionIndex].questions)) {
      questionSection[sectionIndex].questions = [];
    }
    const existingQuestions = questionSection[sectionIndex].questions;
    // Filter out questions that already exist.
    const newQuestions = processedQuestions.filter(
      (q) =>
        !existingQuestions.some(
          (existing) => existing.questionID === q.questionID
        )
    );
    // Append new questions if any.
    questionSection[sectionIndex].questions =
      existingQuestions.concat(newQuestions);
  } else {
    // If sectionIndex is beyond current sections, add a new section.
    questionSection.push({ title: "", questions: processedQuestions });
    sectionIndex = questionSection.length - 1;
  }

  // Update the exam item with the new questionSection array.
  const updateParams = {
    TableName: masterTable,
    Key: {
      pKey: `EXAM#${examID}`,
      sKey: `EXAMS@${type}`,
    },
    UpdateExpression: "SET questionSection = :qs, updatedAt = :updatedAt",
    ExpressionAttributeValues: {
      ":qs": questionSection,
      ":updatedAt": Date.now(),
      ":isLive": false,
    },
    ConditionExpression: "attribute_exists(pKey) AND isLive = :isLive",
  };

  try {
    await dynamoDB.send(new UpdateCommand(updateParams));
    return {
      success: true,
      message: "Questions added to exam successfully",
    };
  } catch (error) {
    throw error;
  }
}

export async function getQuestionListBySection({ examID, type, sectionIndex }) {
  const examParams = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: `EXAM#${examID}`,
      sKey: `EXAMS@${type}`,
    },
    ProjectionExpression: "questionSection",
  };

  try {
    const examResult = await dynamoDB.send(new GetCommand(examParams));
    const examItem = examResult.Item;
    if (!examItem) {
      throw new Error("Exam not found");
    }
    if (!examItem.questionSection) {
      throw new Error("Section not found");
    }
    if (sectionIndex >= examItem.questionSection.length) {
      throw new Error("Section not found");
    }
    if (!examItem.questionSection[sectionIndex]) {
      throw new Error("Section not found");
    }
    const questionSection = examItem.questionSection[sectionIndex];
    if (!questionSection) {
      throw new Error("Section not found");
    }

    if (questionSection.questions.length <= 0) {
      return {
        success: true,
        message: "Questions retrieved successfully",
        data: [],
      };
    }
    // Build an array of keys for each question using its own questionID and subjectID.
    const questionKeys = questionSection.questions.map((q) => ({
      pKey: `SUBJECT#${q.subjectID}`,
      sKey: `QUESTION#${q.questionID}`,
    }));

    const questionParams = {
      RequestItems: {
        [`${process.env.AWS_DB_NAME}content`]: {
          Keys: questionKeys,
        },
      },
    };

    const questionResult = await dynamoDB.send(
      new BatchGetCommand(questionParams)
    );
    return {
      success: true,
      message: "Questions retrieved successfully",
      data: questionResult.Responses[`${process.env.AWS_DB_NAME}content`].map(
        (item) => {
          return {
            ...item,
            id: item.pKey.split("#")[1],
            subjectID: item.sKey.split("@")[1],
            pKey: undefined,
            sKey: undefined,
          };
        }
      ),
    };
  } catch (error) {
    throw error;
  }
}

export async function removeQuestionsFromSection({
  examID,
  type,
  sectionIndex,
  questionIDs,
}) {
  const masterTable = `${process.env.AWS_DB_NAME}master`;

  const examParams = {
    TableName: masterTable,
    Key: {
      pKey: `EXAM#${examID}`,
      sKey: `EXAMS@${type}`,
    },
  };

  try {
    const examResult = await dynamoDB.send(new GetCommand(examParams));
    const examItem = examResult.Item;
    if (!examItem) {
      throw new Error("Exam not found");
    }
    if (examItem.isLive) {
      throw new Error("Exam is live");
    }
    const questionSection = examItem.questionSection[sectionIndex];
    if (!questionSection) {
      throw new Error("Section not found");
    }
    const updatedQuestions = questionSection.questions.filter(
      (q) => !questionIDs.includes(q.questionID)
    );
    examItem.questionSection[sectionIndex].questions = updatedQuestions;
    const updateParams = {
      TableName: masterTable,
      Key: {
        pKey: `EXAM#${examID}`,
        sKey: `EXAMS@${type}`,
      },
      UpdateExpression: "SET questionSection = :qs, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":qs": examItem.questionSection,
        ":updatedAt": Date.now(),
        ":isLive": false,
      },
      ConditionExpression: "attribute_exists(pKey) AND isLive = :isLive",
    };
    await dynamoDB.send(new UpdateCommand(updateParams));
    return {
      success: true,
      message: "Questions removed from section successfully",
    };
  } catch (error) {
    throw error;
  }
}

export async function deleteSection({ examID, type, sectionIndex }) {
  const masterTable = `${process.env.AWS_DB_NAME}master`;
  const examParams = {
    TableName: masterTable,
    Key: {
      pKey: `EXAM#${examID}`,
      sKey: `EXAMS@${type}`,
    },
  };
  try {
    const examResult = await dynamoDB.send(new GetCommand(examParams));
    const examItem = examResult.Item;
    if (!examItem) {
      throw new Error("Exam not found");
    }
    if (examItem.isLive) {
      throw new Error("Exam is live");
    }
    if (examItem.questionSection[sectionIndex].questions.length > 0) {
      throw new Error(
        "Please remove questions from the section before deleting"
      );
    }
    examItem.questionSection.splice(sectionIndex, 1);
    console.log(examItem);

    const updateParams = {
      TableName: masterTable,
      Key: {
        pKey: `EXAM#${examID}`,
        sKey: `EXAMS@${type}`,
      },
      UpdateExpression: "SET questionSection = :qs, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":qs": examItem.questionSection,
        ":updatedAt": Date.now(),
        ":isLive": false,
      },
      ConditionExpression: "attribute_exists(pKey) AND isLive = :isLive",
    };
    await dynamoDB.send(new UpdateCommand(updateParams));
    return {
      success: true,
      message: "Section deleted successfully",
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Mark an exam as “live”:
 *   • Validate
 *   • Build the student‐blob out of Exam + Questions
 *   • Upload to S3
 *   • Update Dynamo
 *   • Clean up on failure
 */
export async function markExamAsLive({ examID, type }) {
  const MASTER = `${process.env.AWS_DB_NAME}master`;
  const CONTENT = `${process.env.AWS_DB_NAME}content`;
  const bucket = process.env.AWS_BUCKET_NAME;
  const prefix = process.env.AWS_EXAM_PATH || "";
  const now = Date.now();
  const sKey = `EXAMS@${type}`;

  // 1) Fetch the raw exam record
  const { Item: examItem } = await dynamoDB.send(
    new GetCommand({
      TableName: MASTER,
      Key: { pKey: `EXAM#${examID}`, sKey },
    })
  );

  if (!examItem) {
    throw new Error("Exam not found");
  }

  if (examItem.isLive) {
    return { success: true, message: "Exam is already live" };
  }

  // if the blob was updated after the exam was updated, we don't need to create a new blob
  if (examItem.blobUpdatedAt >= examItem.updatedAt) {
    console.log("Exam re-activated without new blob");
    await dynamoDB.send(
      new UpdateCommand({
        TableName: MASTER,
        Key: { pKey: `EXAM#${examID}`, sKey },
        UpdateExpression: "SET isLive = :live",
        ExpressionAttributeValues: { ":live": true },
      })
    );
    return { success: true, message: "Exam re-activated without new blob" };
  }

  // 2) Validate shape
  validateExamForBlob(examItem);

  // bump version
  const oldVersion = Number(examItem.blobVersion) || 0;
  const newVersion = oldVersion + 1;
  const blobKey = `${prefix}${examID}-v${newVersion}.json`;

  // 3) Collect question keys
  const questionRefs = examItem.questionSection.flatMap((sec) => sec.questions);

  // Deduplicate keys using a Map to prevent BatchGetCommand error
  const uniqueKeysMap = new Map();
  questionRefs.forEach((q) => {
    // Use questionID as the unique identifier for the map
    if (!uniqueKeysMap.has(q.questionID)) {
      uniqueKeysMap.set(q.questionID, {
        pKey: `SUBJECT#${q.subjectID}`,
        sKey: `QUESTION#${q.questionID}`,
      });
    }
  });

  const keys = Array.from(uniqueKeysMap.values());

  // 4) Batch‐get all question details (only pull what we need)
  // type is reserved keyword in dynamoDB, so we need to use the alias "type"
  const questionItems = [];
  for (let i = 0; i < keys.length; i += 100) {
    const chunk = keys.slice(i, i + 100);
    const resp = await dynamoDB.send(
      new BatchGetCommand({
        RequestItems: {
          [CONTENT]: {
            Keys: chunk,
            // ExpressionAttributeNames: {
            //   "#type": "type",
            // },
            // ProjectionExpression:
            //   "pKey, title, #type, options, correctAnswers, blanks", // type is reserved keyword in dynamoDB, so we need to use the alias "type"
          },
        },
      })
    );
    questionItems.push(...(resp.Responses?.[CONTENT] || []));
  }
  const byId = Object.fromEntries(
    questionItems.map((qi) => [qi.sKey.split("#")[1], qi])
  );

  // 5) Build “sections” + “answerList”
  const sections = examItem.questionSection.map((sec) => ({
    title: sec.title,
    pMark: Number(sec.pMark),
    nMark: Number(sec.nMark),
    questions: sec.questions.map(({ questionID, subjectID }) => {
      const src = byId[questionID];
      if (!src) {
        throw new Error(
          `Question data not found for ID: ${questionID}. It may have been deleted.`
        );
      }
      return {
        questionID,
        subjectID,
        title: src.title,
        type: src.type,
        noOfBlanks: src.type === "FIB" ? src.blanks.length : undefined,
        options:
          src.type === "FIB"
            ? undefined
            : src.options.map(({ id, text }) => ({ id, text })),
      };
    }),
  }));

  const answerList = sections.flatMap((sec) =>
    sec.questions.map((q) => {
      const src = byId[q.questionID];
      if (!src) {
        throw new Error(
          `Question data not found for ID: ${q.questionID}. It may have been deleted.`
        );
      }
      return {
        questionID: q.questionID,
        type: src.type,
        // MCQ/MSQ correct answers by index
        correct:
          src.type === "FIB"
            ? []
            : src.answerKey.map((k) => {
                const opt = src.options.find((o) => o.id === k);
                console.log(opt);
                return opt
                  ? { id: opt.id, text: opt.text, weight: opt.weight }
                  : null;
              }),
        // FIB blanks array
        blanks: src.type === "FIB" ? src.blanks : [],
        pMark: sec.pMark,
        nMark: sec.nMark,
        solution: src.solution,
      };
    })
  );

  // 6) Totals
  const totalQuestions = questionRefs.length;
  const totalSections = sections.length;
  const totalMarks = sections.reduce(
    (acc, sec) => acc + sec.pMark * sec.questions.length,
    0
  );

  // 7) Compose the blob
  const blob = {
    examID,
    title: examItem.title,
    version: newVersion,
    settings: examItem.settings,
    duration: examItem.duration,
    startTimeStamp: examItem.startTimeStamp,
    totalSections,
    totalQuestions,
    totalMarks,
    sections,
    // answerList,
  };

  // 8) Upload to S3
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: blobKey,
        Body: JSON.stringify(blob),
        ContentType: "application/json",
      })
    );
  } catch (err) {
    console.error("🔴 S3 upload failed:", err);
    throw new Error("Failed to upload exam blob");
  }

  // 9) Persist newVersion + blobKey + answerList + totals + isLive
  try {
    await dynamoDB.send(
      new UpdateCommand({
        TableName: MASTER,
        Key: { pKey: `EXAM#${examID}`, sKey },
        UpdateExpression:
          `SET blobVersion = :v, blobBucketKey = :key, answerList = :al, updatedAt = :updatedAt, ` +
          `totalSections = :ts, totalQuestions = :tq, totalMarks = :tm, isLive = :live, blobUpdatedAt = :blobUpdatedAt`,
        ExpressionAttributeValues: {
          ":v": newVersion,
          ":key": blobKey,
          ":al": answerList,
          ":ts": totalSections,
          ":tq": totalQuestions,
          ":tm": totalMarks,
          ":live": true,
          ":blobUpdatedAt": now,
          ":updatedAt": now,
        },
      })
    );
  } catch (err) {
    console.error("🔴 DynamoDB update failed:", err);
    // clean up the blob we just wrote
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: blobKey }));
    } catch (cleanupErr) {
      console.error("⚠️ Failed to clean up stale blob:", cleanupErr);
    }
    throw new Error("Failed to mark exam live");
  }

  return {
    success: true,
    message: "Exam marked as live",
    data: { blob, blobKey },
  };
}

export async function makeExamAsUnLive({ examID, type }) {
  const table = `${process.env.AWS_DB_NAME}master`;
  const sKey = `EXAMS@${type}`;
  const params = {
    TableName: table,
    Key: {
      pKey: `EXAM#${examID}`,
      sKey,
    },
    UpdateExpression: "SET isLive = :newLive",
    ConditionExpression: "attribute_exists(pKey) AND isLive = :oldLive",
    ExpressionAttributeValues: {
      ":newLive": false,
      ":oldLive": true,
    },
  };

  try {
    await dynamoDB.send(new UpdateCommand(params));
    return {
      success: true,
      message: "Exam marked as un-live successfully",
    };
  } catch (err) {
    console.error("Error in makeExamAsUnLive:", err);
    // If you'd like to handle specific Dynamo errors (ConditionalCheckFailed), you can branch here
    throw new Error(err.message || "Internal server error");
  }
}
