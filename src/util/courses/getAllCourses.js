import { dynamoDB } from "../awsAgent";
import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

export async function getAllCoursesByGoalID({ goalID }) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    KeyConditionExpression: "sKey = :sKey",
    ExpressionAttributeValues: {
      ":sKey": `COURSES@${goalID}`,
    },
  };
  try {
    const { Items } = await dynamoDB.send(new QueryCommand(params));
    return {
      success: true,
      message: "Courses fetched successfully",
      data: Items.map((item) => ({
        courseID: item.pKey.split("#")[1],
        title: item.title,
        thumbnail: item.thumbnail,
        lessons: item.lessons,
        duration: item.duration,
        isLive: item.isLive,
      })),
    };
  } catch (error) {
    console.error("DynamoDB Error:", error);
    throw new Error("Internal server error");
  }
}

export async function getALLCourse() {
  // sKey starts with COURSES
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    FilterExpression: "begins_with(sKey, :sKey)",
    ExpressionAttributeValues: {
      ":sKey": "COURSES@",
    },
  };
  try {
    const { Items } = await dynamoDB.send(new ScanCommand(params));
    return {
      success: true,
      message: "Courses fetched successfully",
      data: Items.map((item) => ({
        courseID: item.pKey.split("#")[1],
        goalID: item.sKey.split("@")[1],
        title: item.title,
        thumbnail: item.thumbnail,
        lessons: item.lessons,
        duration: item.duration,
        subscription: item.subscription,
      })),
    };
  } catch (error) {
    console.error("DynamoDB Error:", error);
    throw new Error("Internal server error");
  }
}
