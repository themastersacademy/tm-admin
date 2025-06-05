import { dynamoDB } from "../awsAgent";
import {
  validateSubscription,
  sortSubscriptionPlans,
} from "@/src/lib/validateSubscription";
/**
 * Updates the basic information for a course.
 * Also calls updateGoalCoursesList to keep the goal’s coursesList in sync.
 *
 * @param {Object} params
 * @param {string} params.courseID - The unique identifier of the course.
 * @param {string} params.goalID - The goal ID under which this course is grouped.
 * @param {string} params.title - The new course title.
 * @param {string} params.description - The new description.
 * @param {string} params.thumbnail - The new thumbnail URL.
 * @param {Array} params.language - The updated list of languages.
 * @returns {Promise<Object>} Response object indicating success or failure.
 */
export async function updateBasicCourseInfo({
  courseID,
  goalID,
  title,
  description,
  language,
  duration,
}) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: `COURSE#${courseID}`,
      sKey: `COURSES@${goalID}`,
    },
    UpdateExpression:
      "SET title = :t, titleLower = :tl, description = :d, #lang = :l, updatedAt = :u, #dur = :dur",
    ExpressionAttributeNames: {
      "#lang": "language",
      "#dur": "duration",
    },
    ExpressionAttributeValues: {
      ":t": title,
      ":tl": title.toLowerCase(),
      ":d": !description ? "" : description,
      ":l": !language ? [] : language,
      ":dur": !duration ? 0 : duration,
      ":u": Date.now(),
    },
  };

  try {
    await dynamoDB.update(params).promise();
    // Update the goal's coursesList for consistency.
    await updateGoalCoursesList({
      courseID,
      goalID,
      title,
      language,
      duration,
      lessonDelta: 0,
    });
    return {
      success: true,
      message: "Course updated",
    };
  } catch (error) {
    console.error("DynamoDB Error in updateBasicCourseInfo:", error);
    throw new Error("Internal server error");
  }
}

/**
 * Updates the course's subscription information.
 *
 * @param {Object} params
 * @param {string} params.courseID - The unique identifier of the course.
 * @param {string} params.goalID - The goal ID under which this course is grouped.
 * @param {Object} params.subscription - The subscription object.
 * @returns {Promise<Object>} Response object indicating success or failure.
 */
export async function updateCourseSubscription({
  courseID,
  goalID,
  subscription,
}) {
  const { valid, errors } = validateSubscription(subscription);
  console.log("valid", valid);
  console.log("errors", errors);
  if (!valid) {
    throw new Error(errors.map((e) => e.message).join("\n"));
  }
  const plans = sortSubscriptionPlans(subscription.plans);
  console.log("plans", plans);
  const updatedSubscription = {
    ...subscription,
    plans,
  };
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: `COURSE#${courseID}`,
      sKey: `COURSES@${goalID}`,
    },
    UpdateExpression: "SET subscription = :s, updatedAt = :u",
    ExpressionAttributeValues: {
      ":s": updatedSubscription,
      ":u": Date.now(),
    },
  };

  try {
    await dynamoDB.update(params).promise();
    return {
      success: true,
      message: "Course subscription updated",
    };
  } catch (error) {
    console.error("DynamoDB Error in updateCourseSubscription:", error);
    throw new Error("Internal server error");
  }
}

/**
 * Updates the coursesList attribute in the goal record to keep it consistent
 * with the course’s basic information.
 *
 * @param {Object} params
 * @param {string} params.courseID - The course ID.
 * @param {string} params.goalID - The goal ID.
 * @param {string} params.title - The updated title of the course.
 * @param {string} params.thumbnail - The updated thumbnail URL.
 * @param {Array} params.language - The updated languages array.
 * @returns {Promise<void>}
 */
export async function updateGoalCoursesList({
  courseID,
  goalID,
  title,
  language,
  duration,
  lessonDelta = 0, // +1 to add lesson, -1 to remove lesson, 0 to leave unchanged
}) {
  // 1. Retrieve the goal record.
  const getParams = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: `GOAL#${goalID}`,
      sKey: "GOALS",
    },
    ProjectionExpression: "coursesList", // only need coursesList
  };

  try {
    const goalResult = await dynamoDB.get(getParams).promise();
    if (!goalResult.Item) {
      throw new Error("Goal not found");
    }

    let coursesList = goalResult.Item.coursesList || [];

    // 2. Find index of the course in coursesList
    const index = coursesList.findIndex((c) => c.id === courseID);

    if (index === -1) {
      // Course does not exist → create a new entry
      // Initialize lessons to lessonDelta if >0, else 0
      const initialLessons = Math.max(0, lessonDelta);

      const newCourse = {
        id: courseID,
        title,
        titleLower: title.toLowerCase(),
        language: language || [],
        duration: duration || "",
        lessons: initialLessons,
        // You can also add default thumbnail or other fields if needed,
        // for example:
        // thumbnail: "",
        // etc.
      };

      coursesList.push(newCourse);
    } else {
      // Course already exists → update its fields + adjust lessons
      const existing = coursesList[index];
      const updatedLessons = Math.max(
        0,
        (typeof existing.lessons === "number" ? existing.lessons : 0) +
          lessonDelta
      );

      const updatedCourseInfo = {
        ...existing,
        title,
        titleLower: title.toLowerCase(),
        language: language || existing.language,
        duration: duration || existing.duration,
        lessons: updatedLessons,
        // If you have fields like thumbnail that you want to carry forward:
        thumbnail: existing.thumbnail,
      };

      coursesList[index] = updatedCourseInfo;
    }

    // 3. Persist the updated coursesList back to DynamoDB
    const updateParams = {
      TableName: `${process.env.AWS_DB_NAME}master`,
      Key: {
        pKey: `GOAL#${goalID}`,
        sKey: "GOALS",
      },
      UpdateExpression: "SET coursesList = :coursesList, updatedAt = :u",
      ExpressionAttributeValues: {
        ":coursesList": coursesList,
        ":u": Date.now(),
      },
    };

    await dynamoDB.update(updateParams).promise();
  } catch (error) {
    console.error("Error updating goal courses list:", error);
    throw new Error("Error updating goal courses list");
  }
}
