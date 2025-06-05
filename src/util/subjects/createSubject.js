import { dynamoDB } from "../awsAgent";
import { randomUUID } from "crypto";

export default async function createSubject({ title }) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    Item: {
      pKey: `SUBJECT#${randomUUID()}`,
      sKey: "SUBJECTS",
      title,
      titleLower: title.toLowerCase(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  };
  try {
    await dynamoDB.put(params).promise();
    return {
      success: true,
      message: "Subject created successfully",
      data: {
        subjectID: params.Item.pKey.split("#")[1],
        title: params.Item.title,
      },
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
