import { dynamoDB } from "../awsAgent";

export default async function getLessons(courseID) {
  if (!courseID) {
    return { success: false, message: "Course ID is required" };
  }

  const TABLE = `${process.env.AWS_DB_NAME}master`;

  // 1. Query the course item using its partition key.
  const courseParams = {
    TableName: TABLE,
    KeyConditionExpression: "pKey = :pKey",
    ExpressionAttributeValues: {
      ":pKey": `COURSE#${courseID}`,
    },
  };

  let courseData;
  try {
    courseData = await dynamoDB.query(courseParams).promise();
  } catch (error) {
    console.error("Error querying course:", error);
    throw new Error("Could not query course");
  }

  if (!courseData.Items || courseData.Items.length === 0) {
    return { success: false, message: "Course not found" };
  }

  const lessonParams = {
    TableName: TABLE,
    FilterExpression: "sKey = :sKey",
    ExpressionAttributeValues: {
      ":sKey": `LESSONS@${courseID}`,
    },
  };

  let lessonsData;
  try {
    lessonsData = await dynamoDB.scan(lessonParams).promise();
  } catch (error) {
    console.error("Error querying lessons:", error);
    throw new Error("Could not query lessons");
  }

  const lessonOrder = courseData.Items[0].lessonIDs || [];
  const lessonsById = {};
  lessonsData.Items.forEach((item) => {
    // Assuming pKey is formatted as "LESSON#<lessonID>"
    const id = item.pKey.split("#")[1];
    lessonsById[id] = item;
  });

  // 5. Order the lessons according to the lessonIDs array.
  const orderedLessons = lessonOrder
    .map((id) => {
      const lesson = lessonsById[id];
      if (!lesson) return null;
      return {
        ...lesson,
        id,
        courseID, // explicitly add courseID
        pKey: undefined,
        sKey: undefined,
      };
    })
    .filter((lesson) => lesson !== null);

  return {
    success: true,
    message: "Lessons fetched successfully",
    data: orderedLessons,
  };
}
