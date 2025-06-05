import { dynamoDB } from "../awsAgent";

export async function reorderLesson({ courseID, goalID, lessonIDs }) {
  if (!courseID || !lessonIDs) {
    return { success: false, message: "Missing courseID or lessonIDs" };
  }

  const TABLE = `${process.env.AWS_DB_NAME}master`;

  const params = {
    TableName: TABLE,
    Key: {
      pKey: `COURSE#${courseID}`,
      sKey: `COURSES@${goalID}`,
    },
    UpdateExpression: "SET lessonIDs = :lessonIDs",
    ExpressionAttributeValues: {
      ":lessonIDs": lessonIDs,
    },
  };

  try {
    await dynamoDB.update(params).promise();
    return { success: true, message: "Lesson order updated" };
  } catch (error) {
    console.error("Error updating lesson order:", error);
    throw new Error("Could not update lesson order");
  }
}
