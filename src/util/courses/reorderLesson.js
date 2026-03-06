import { dynamoDB } from "../awsAgent";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

export async function reorderLesson({ courseID, goalID, lessonIDs, sections }) {
  if (!courseID || !lessonIDs) {
    return { success: false, message: "Missing courseID or lessonIDs" };
  }

  const TABLE = `${process.env.AWS_DB_NAME}master`;

  const expressionParts = ["SET lessonIDs = :lessonIDs"];
  const expressionValues = { ":lessonIDs": lessonIDs };

  // If sections are provided, update them too
  if (sections) {
    expressionParts[0] += ", sections = :sections";
    expressionValues[":sections"] = sections;
  }

  const params = {
    TableName: TABLE,
    Key: {
      pKey: `COURSE#${courseID}`,
      sKey: `COURSES@${goalID}`,
    },
    UpdateExpression: expressionParts[0],
    ExpressionAttributeValues: expressionValues,
  };

  try {
    await dynamoDB.send(new UpdateCommand(params));
    return { success: true, message: "Lesson order updated" };
  } catch (error) {
    console.error("Error updating lesson order:", error);
    throw new Error("Could not update lesson order");
  }
}
