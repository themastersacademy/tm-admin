import crypto from "crypto";
import { dynamoDB } from "../awsAgent";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

export default async function createGoals({ title, icon }) {
  const pKey = `GOAL#${crypto.randomUUID()}`;
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Item: {
      pKey,
      sKey: "GOALS",
      "GSI1-pKey": "GOALS",
      "GSI1-sKey": pKey,
      title,
      icon,
      tagline: "",
      description: "",
      bannerImage: "",
      isLive: false,
      subjectList: [],
      coursesList: [],
      blogList: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
  try {
    await dynamoDB.send(new PutCommand(params));
    return {
      success: true,
      message: "Goal created successfully",
      data: {
        goalID: params.Item.pKey.split("#")[1],
      },
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
