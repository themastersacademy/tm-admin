import { randomUUID } from "crypto";
import { dynamoDB } from "../awsAgent";

const MASTER_TABLE = `${process.env.AWS_DB_NAME}master`;
const MASTER_TABLE_INDEX = "masterTableIndex";

export async function getAllScheduledExams() {
  const params = {
    TableName: MASTER_TABLE,
    IndexName: MASTER_TABLE_INDEX,
    KeyConditionExpression: "#gsi1pKey = :pk and #gsi1sKey = :sk",
    ExpressionAttributeNames: {
      "#gsi1pKey": "GSI1-pKey",
      "#gsi1sKey": "GSI1-sKey",
    },
    FilterExpression: "sKey = :skey",
    ExpressionAttributeValues: {
      ":pk": "EXAMS",
      ":sk": "EXAMS",
      ":skey": "EXAMS@scheduled",
    },
  };
  try {
    const result = await dynamoDB.query(params).promise();
    return {
      success: true,
      message: "Scheduled exams retrieved successfully",
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
    throw new Error(error);
  }
}
