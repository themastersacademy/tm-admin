import { dynamoDB } from "../awsAgent";
import {
  GetCommand,
  QueryCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { updateGoalCoursesList } from "./updateCourse";

export default async function deleteLesson({ lessonID, courseID, goalID }) {
  if (!lessonID || !courseID || !goalID) {
    throw new Error("lessonID, courseID, and goalID are required");
  }

  const TABLE = `${process.env.AWS_DB_NAME}master`;
  const now = Date.now();

  try {
    // 1. Get the lesson item.
    const lessonParams = {
      TableName: TABLE,
      Key: {
        pKey: `LESSON#${lessonID}`,
        sKey: `LESSONS@${courseID}`,
      },
    };
    const lessonResult = await dynamoDB.send(new GetCommand(lessonParams));
    if (!lessonResult.Item) {
      return { success: false, message: "Lesson not found" };
    }
    const lessonItem = lessonResult.Item;

    // 2. Get the course item.
    const courseParams = {
      TableName: TABLE,
      Key: {
        pKey: `COURSE#${courseID}`,
        sKey: `COURSES@${goalID}`,
      },
    };
    const courseResult = await dynamoDB.send(new GetCommand(courseParams));
    if (!courseResult.Item) {
      return { success: false, message: "Course not found" };
    }
    const courseItem = courseResult.Item;

    // Remove lessonID from the course's lessonIDs array.
    const updatedLessonIDs = (courseItem.lessonIDs || []).filter(
      (id) => id !== lessonID
    );
    const updatedLessonsCount =
      (courseItem.lessons || 0) > 0 ? courseItem.lessons - 1 : 0;

    // Prepare transaction items:
    const transactItems = [
      // Delete the lesson item.
      {
        Delete: {
          TableName: TABLE,
          Key: {
            pKey: `LESSON#${lessonID}`,
            sKey: `LESSONS@${courseID}`,
          },
        },
      },
      // Update the course item.
      {
        Update: {
          TableName: TABLE,
          Key: {
            pKey: `COURSE#${courseID}`,
            sKey: `COURSES@${goalID}`,
          },
          UpdateExpression:
            "SET lessonIDs = :lids, lessons = :count, updatedAt = :u",
          ExpressionAttributeValues: {
            ":lids": updatedLessonIDs,
            ":count": updatedLessonsCount,
            ":u": now,
          },
        },
      },
    ];

    // 3. If the lesson is linked to a resource, update the resource item.
    if (lessonItem.resourceID) {
      // Query the resource item using its pKey.
      const resourceQueryParams = {
        TableName: TABLE,
        KeyConditionExpression: "pKey = :rKey",
        ExpressionAttributeValues: {
          ":rKey": `RESOURCE#${lessonItem.resourceID}`,
        },
        Select: "ALL_ATTRIBUTES",
      };
      const resourceResult = await dynamoDB.send(
        new QueryCommand(resourceQueryParams)
      );
      if (resourceResult.Items && resourceResult.Items.length > 0) {
        const resourceItem = resourceResult.Items[0];
        // Remove lessonID from the resource's linkedLessons array.
        const updatedLinkedLessons = (resourceItem.linkedLessons || []).filter(
          (id) => id !== lessonID
        );
        transactItems.push({
          Update: {
            TableName: TABLE,
            Key: {
              pKey: `RESOURCE#${lessonItem.resourceID}`,
              sKey: resourceItem.sKey, // using the existing sKey from the resource item
            },
            UpdateExpression: "SET linkedLessons = :ll, updatedAt = :u",
            ExpressionAttributeValues: {
              ":ll": updatedLinkedLessons,
              ":u": now,
            },
          },
        });
      }
    }

    // Execute the transaction.
    const transactParams = {
      TransactItems: transactItems,
    };
    await dynamoDB.send(new TransactWriteCommand(transactParams));

    await updateGoalCoursesList({
      courseID,
      goalID,
      title: courseItem.title,
      language: courseItem.language,
      duration: courseItem.duration,
      lessonDelta: -1,
    });
    return { success: true, message: "Lesson deleted successfully" };
  } catch (error) {
    console.error("Error deleting lesson:", error);
    throw new Error("Internal server error");
  }
}
