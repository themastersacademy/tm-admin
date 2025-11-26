import { dynamoDB } from "../awsAgent";
import { PutCommand, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

export async function createExamGroup({ goalID, title }) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    IndexName: "masterTableIndex",
    Item: {
      pKey: `EXAM_GROUP#${randomUUID()}`,
      sKey: `EXAM_GROUPS@${goalID}`,
      title,
      "GSI1-pKey": `EXAM_GROUP`,
      "GSI1-sKey": `EXAM_GROUP`,
      isLive: false,
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
      examList: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  };
  try {
    await dynamoDB.send(new PutCommand(params));
    return {
      success: true,
      message: "Exam group created successfully",
    };
  } catch (error) {
    throw new Error(error);
  }
}

export async function updateExamGroup({
  examGroupID,
  goalID,
  title,
  // isLive,
  isProTest,
  isAntiCheat,
  isFullScreenMode,
  isShowResult,
  isRandomQuestion,
  mCoinRewardIsEnabled,
  mCoinRewardConditionPercent,
  mCoinRewardRewardCoin,
}) {
  const now = Date.now();

  // 1) Build the list of SET clauses and values
  const updateExpressions = [];
  const expressionAttributeValues = {};

  if (title !== undefined) {
    updateExpressions.push("title = :title");
    expressionAttributeValues[":title"] = title;
  }
  // if (isLive !== undefined) {
  //   updateExpressions.push("isLive = :isLive");
  //   expressionAttributeValues[":isLive"] = isLive;
  // }

  if (isProTest !== undefined) {
    updateExpressions.push("settings.isProTest = :isProTest");
    expressionAttributeValues[":isProTest"] = isProTest;
  }
  if (isAntiCheat !== undefined) {
    updateExpressions.push("settings.isAntiCheat = :isAntiCheat");
    expressionAttributeValues[":isAntiCheat"] = isAntiCheat;
  }
  if (isFullScreenMode !== undefined) {
    updateExpressions.push("settings.isFullScreenMode = :isFullScreenMode");
    expressionAttributeValues[":isFullScreenMode"] = isFullScreenMode;
  }
  if (isShowResult !== undefined) {
    updateExpressions.push("settings.isShowResult = :isShowResult");
    expressionAttributeValues[":isShowResult"] = isShowResult;
  }
  if (isRandomQuestion !== undefined) {
    updateExpressions.push("settings.isRandomQuestion = :isRandomQuestion");
    expressionAttributeValues[":isRandomQuestion"] = isRandomQuestion;
  }

  if (mCoinRewardIsEnabled !== undefined) {
    updateExpressions.push(
      "settings.mCoinReward.isEnabled = :mCoinRewardIsEnabled"
    );
    expressionAttributeValues[":mCoinRewardIsEnabled"] = mCoinRewardIsEnabled;
  }
  if (mCoinRewardConditionPercent !== undefined) {
    updateExpressions.push(
      "settings.mCoinReward.conditionPercent = :mCoinRewardConditionPercent"
    );
    expressionAttributeValues[":mCoinRewardConditionPercent"] =
      mCoinRewardConditionPercent;
  }
  if (mCoinRewardRewardCoin !== undefined) {
    updateExpressions.push(
      "settings.mCoinReward.rewardCoin = :mCoinRewardRewardCoin"
    );
    expressionAttributeValues[":mCoinRewardRewardCoin"] = mCoinRewardRewardCoin;
  }

  // always bump updatedAt
  updateExpressions.push("updatedAt = :updatedAt");
  expressionAttributeValues[":updatedAt"] = now;

  // 2) Ensure at least one non-default field to update
  if (updateExpressions.length === 1) {
    throw new Error("No updatable fields provided.");
  }

  // 3) Reconstruct sKey as used in creation
  const sKey = `EXAM_GROUPS@${goalID}`;

  // 4) Assemble and execute the update
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: `EXAM_GROUP#${examGroupID}`,
      sKey,
    },
    UpdateExpression: "SET " + updateExpressions.join(", "),
    ExpressionAttributeValues: expressionAttributeValues,
    ConditionExpression: "attribute_exists(pKey)",
  };

  try {
    await dynamoDB.send(new UpdateCommand(params));
    return {
      success: true,
      message: "Exam group updated successfully",
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateExamGroupLiveStatus({
  examGroupID,
  goalID,
  isLive,
}) {
  if (isLive) {
    const examList = await getExamListByGroupID(examGroupID);
    if (examList.data.length === 0) {
      return {
        success: false,
        message: "Exam is not available",
      };
    }
    const isAnyExamLive = examList.data.some((exam) => exam.isLive);
    if (!isAnyExamLive) {
      return {
        success: false,
        message: "Any one exam should be live",
      };
    }
    const params = {
      TableName: `${process.env.AWS_DB_NAME}master`,
      Key: {
        pKey: `EXAM_GROUP#${examGroupID}`,
        sKey: `EXAM_GROUPS@${goalID}`,
      },
      UpdateExpression: "SET isLive = :isLive",
      ExpressionAttributeValues: {
        ":isLive": isLive,
      },
    };
    await dynamoDB.send(new UpdateCommand(params));
    return {
      success: true,
      message: "Group is live now",
    };
  } else {
    const params = {
      TableName: `${process.env.AWS_DB_NAME}master`,
      Key: {
        pKey: `EXAM_GROUP#${examGroupID}`,
        sKey: `EXAM_GROUPS@${goalID}`,
      },
      UpdateExpression: "SET isLive = :isLive",
      ExpressionAttributeValues: {
        ":isLive": isLive,
      },
    };
    await dynamoDB.send(new UpdateCommand(params));
    return {
      success: true,
      message: "Group is not live now",
    };
  }
}

export async function getExamGroupByGoalID(goalID) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    IndexName: "masterTableIndex",
    KeyConditionExpression: "#gsiPK = :examKey AND #gsiSK = :entity",
    FilterExpression: "sKey = :sKey",
    ExpressionAttributeNames: {
      "#gsiPK": "GSI1-pKey",
      "#gsiSK": "GSI1-sKey",
    },
    ExpressionAttributeValues: {
      ":examKey": "EXAM_GROUP",
      ":entity": "EXAM_GROUP",
      ":sKey": `EXAM_GROUPS@${goalID}`,
    },
    // ProjectionExpression: "pKey, title, isLive, mCoin, isProTest, examList",
  };
  try {
    const { Items } = await dynamoDB.send(new QueryCommand(params));
    console.log(Items[0]);
    return {
      success: true,
      message: "Exam group retrieved successfully",
      data: Items.map((item) => ({
        id: item.pKey.split("#")[1],
        goalID: item.sKey.split("@")[1],
        isLive: item.isLive,
        title: item.title,
        examList: item.examList,
        pKey: undefined,
        sKey: undefined,
        "GSI1-pKey": undefined,
        "GSI1-sKey": undefined,
      })),
    };
  } catch (error) {
    throw new Error(error);
  }
}

export async function getExamGroup(examGroupID) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    IndexName: "masterTableIndex",
    KeyConditionExpression: "#gsiPK = :examKey AND #gsiSK = :entity",
    FilterExpression: "pKey = :pKey",
    ExpressionAttributeNames: {
      "#gsiPK": "GSI1-pKey",
      "#gsiSK": "GSI1-sKey",
    },
    ExpressionAttributeValues: {
      ":examKey": "EXAM_GROUP",
      ":entity": "EXAM_GROUP",
      ":pKey": `EXAM_GROUP#${examGroupID}`,
    },
  };
  try {
    const { Items } = await dynamoDB.send(new QueryCommand(params));
    if (Items.length === 0) {
      return {
        success: false,
        message: "Exam group not found",
      };
    }
    return {
      success: true,
      message: "Exam retrieved successfully",
      data: {
        id: Items[0].pKey.split("#")[1],
        goalID: Items[0].sKey.split("@")[1],
        isLive: Items[0].isLive,
        ...Items[0],
        pKey: undefined,
        sKey: undefined,
        "GSI1-pKey": undefined,
        "GSI1-sKey": undefined,
      },
    };
  } catch (error) {
    throw new Error(error);
  }
}

export async function getExamListByGroupID(groupID) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    IndexName: "masterTableIndex",
    KeyConditionExpression: "#gsiPK = :examKey AND #gsiSK = :entity",
    FilterExpression: "sKey = :sKey AND groupID = :groupID",
    ExpressionAttributeNames: {
      "#gsiPK": "GSI1-pKey",
      "#gsiSK": "GSI1-sKey",
    },
    ExpressionAttributeValues: {
      ":examKey": "EXAMS",
      ":entity": "EXAMS",
      ":sKey": `EXAMS@group`,
      ":groupID": groupID,
    },
  };
  try {
    const { Items } = await dynamoDB.send(new QueryCommand(params));
    return {
      success: true,
      message: "Exam list retrieved successfully",
      data: Items.map((item) => ({
        id: item.pKey.split("#")[1],
        goalID: item.sKey.split("@")[1],
        groupID: item.groupID,
        title: item.title,
        isLive: item.isLive,
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
    throw new Error(error);
  }
}
