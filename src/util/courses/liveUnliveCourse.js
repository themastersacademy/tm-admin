import { dynamoDB } from "../awsAgent";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import getCourse from "./getCourse";

export default async function liveUnliveCourse({ courseID, goalID }) {
  const course = await getCourse({ courseID, goalID });
  if (!course.success) {
    throw new Error(course.message);
  }
  if (course.data.isLive) {
    const params = {
      TableName: `${process.env.AWS_DB_NAME}master`,
      Key: {
        pKey: `COURSE#${courseID}`,
        sKey: `COURSES@${goalID}`,
      },
      UpdateExpression: "set isLive = :isLive",
      ExpressionAttributeValues: {
        ":isLive": false,
      },
    };
    await dynamoDB.send(new UpdateCommand(params));
    return {
      success: true,
      message: "Course unlive successfully",
    };
  }
  if (course.data.lessonIDs.length === 0) {
    throw new Error("Course has no lessons");
  }
  if (course.data.title.length === 0) {
    throw new Error("Course title is required");
  }
  if (course.data.thumbnail.length === 0) {
    throw new Error("Course thumbnail is required");
  }
  if (course.data.description.length === 0) {
    throw new Error("Course description is required");
  }
  if (course.data.language.length === 0) {
    throw new Error("Course language is required");
  }
  if (course.data.duration === 0) {
    throw new Error("Course duration is required");
  }

  if (
    course.data.subscription.isFree === false &&
    course.data.subscription.isPro === false
  ) {
    if (course.data.subscription.plans.length === 0) {
      throw new Error("Course subscription plans are required");
    }
  }
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: `COURSE#${courseID}`,
      sKey: `COURSES@${goalID}`,
    },
    UpdateExpression: "set isLive = :isLive",
    ExpressionAttributeValues: {
      ":isLive": true,
    },
  };
  await dynamoDB.send(new UpdateCommand(params));
  return {
    success: true,
    message: "Course live successfully",
  };
}
