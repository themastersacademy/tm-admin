import { dynamoDB } from "../awsAgent";
import { QueryCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { updateGoalCoursesList } from "./updateCourse";

export default async function createLesson({ courseID }) {
  // Define the table name once.
  const TABLE = `${process.env.AWS_DB_NAME}master`;

  // 1. Verify the course exists.
  const courseParams = {
    TableName: TABLE,
    KeyConditionExpression: "pKey = :pKey",
    ExpressionAttributeValues: {
      ":pKey": `COURSE#${courseID}`,
    },
  };

  try {
    const courseResult = await dynamoDB.send(new QueryCommand(courseParams));
    if (!courseResult.Items || courseResult.Items.length === 0) {
      return { success: false, message: "Course not found" };
    }

    // Extract goalID from the course record's sKey (format: "COURSES@<goalID>")
    const courseItem = courseResult.Items[0];
    let goalID = null;
    if (courseItem.sKey && courseItem.sKey.startsWith("COURSES@")) {
      goalID = courseItem.sKey.split("@")[1];
    }
    if (!goalID) {
      return { success: false, message: "Goal ID not found in course record" };
    }

    // 2. Generate a new lesson ID and define the new lesson item.
    const lessonID = randomUUID();
    const now = Date.now();
    const lessonItem = {
      pKey: `LESSON#${lessonID}`,
      sKey: `LESSONS@${courseID}`,
      resourceID: "",
      title: "",
      titleLower: "",
      isPreview: false,
      isLinked: false,
      type: "",
      path: "",
      name: "",
      videoID: "",
      createdAt: now,
      updatedAt: now,
    };

    // 3. Use a transaction to create the lesson and update the course record atomically.
    const transactParams = {
      TransactItems: [
        {
          Put: {
            TableName: TABLE,
            Item: lessonItem,
          },
        },
        {
          Update: {
            TableName: TABLE,
            Key: {
              pKey: `COURSE#${courseID}`,
              sKey: `COURSES@${goalID}`,
            },
            UpdateExpression:
              "SET lessonIDs = list_append(if_not_exists(lessonIDs, :emptyList), :newLesson), lessons = if_not_exists(lessons, :zero) + :inc, updatedAt = :u",
            ExpressionAttributeValues: {
              ":emptyList": [],
              ":newLesson": [lessonID],
              ":zero": 0,
              ":inc": 1,
              ":u": now,
            },
          },
        },
      ],
    };

    await dynamoDB.send(new TransactWriteCommand(transactParams));
    await updateGoalCoursesList({
      courseID,
      goalID,
      title: courseItem.title,
      language: courseItem.language,
      duration: courseItem.duration,
      lessonDelta: 1,
    });
    return { success: true, message: "Lesson created successfully", lessonID };
  } catch (error) {
    console.error("DynamoDB Error:", error);
    throw new Error("Internal server error");
  }
}
