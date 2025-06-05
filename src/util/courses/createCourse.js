import { dynamoDB } from "../awsAgent";
import { randomUUID } from "crypto";

export default async function createCourse({ title, goalID }) {
  // Prepare parameters to fetch the goal record.
  const goalParams = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: `GOAL#${goalID}`,
      sKey: `GOALS`,
    },
  };

  // Prepare parameters for the new course record.
  const courseID = `COURSE#${randomUUID()}`;
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    IndexName: "masterTableIndex",
    Item: {
      pKey: courseID,
      sKey: `COURSES@${goalID}`,
      "GSI1-pKey": "COURSES",
      "GSI1-sKey": `COURSES@${goalID}`,
      title,
      titleLower: title.toLowerCase(),
      description: "",
      isLive: false,
      thumbnail: "",
      language: [],
      lessons: 0,
      duration: 0,
      lessonIDs: [],
      subscription: {
        isFree: false,
        isPro: false,
        plans: [],
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  };

  try {
    // Fetch the goal record to ensure it exists.
    const goal = await dynamoDB.get(goalParams).promise();
    if (!goal.Item) {
      return {
        success: false,
        message: "Goal not found",
      };
    }

    // Update the goal record by appending the new course to the coursesList attribute.
    const goalUpdateParams = {
      TableName: `${process.env.AWS_DB_NAME}master`,
      Key: {
        pKey: `GOAL#${goalID}`,
        sKey: `GOALS`,
      },
      UpdateExpression:
        "SET #coursesList = list_append(if_not_exists(#coursesList, :emptyList), :course)",
      ExpressionAttributeNames: {
        "#coursesList": "coursesList", // Using the correct attribute name as in your goal JSON.
      },
      ExpressionAttributeValues: {
        ":emptyList": [],
        ":course": [
          {
            id: courseID.split("#")[1], // Use the newly generated courseID
            title,
            titleLower: title.toLowerCase(),
            thumbnail: "",
            description: "",
            language: [],
            lessons: 0,
            duration: 0,
          },
        ],
      },
    };

    // Create the course record.
    await dynamoDB.put(params).promise();
    // Update the goal with the new course information.
    await dynamoDB.update(goalUpdateParams).promise();

    return {
      success: true,
      message: "Course created",
      data: {
        courseID: courseID.split("#")[1],
        goalID,
      },
    };
  } catch (error) {
    console.error("DynamoDB Error:", error);
    throw new Error("Internal server error");
  }
}
