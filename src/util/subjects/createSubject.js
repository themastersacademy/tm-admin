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
      totalQuestions: 0,
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

/**
 * Update Subject
 * @param {string} subjectID
 * @param {number} totalQuestions
 * @param {string} title
 */

// Update Subject params in optional

export async function updateSubject({ subjectID, totalQuestions, title }) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    Key: {
      pKey: `SUBJECT#${subjectID}`,
      sKey: "SUBJECTS",
    },
    UpdateExpression: "SET",
    ExpressionAttributeValues: {},
  };
  if (totalQuestions) {
    params.UpdateExpression += " totalQuestions = :totalQuestions";
    params.ExpressionAttributeValues = {
      ":totalQuestions": totalQuestions,
    };
  }
  if (title) {
    console.log(title);
    params.UpdateExpression += " title = :title, titleLower = :titleLower";
    params.ExpressionAttributeValues = {
      ...params.ExpressionAttributeValues,
      ":title": title,
      ":titleLower": title.toLowerCase(),
    };
  }

  params.UpdateExpression += ", updatedAt = :updatedAt";
  params.ExpressionAttributeValues = {
    ...params.ExpressionAttributeValues,
    ":updatedAt": Date.now(),
  };

  try {
    console.log(params);
    await dynamoDB.update(params).promise();
    return {
      success: true,
      message: "Subject updated successfully",
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
