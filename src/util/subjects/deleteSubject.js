import { dynamoDB } from "../awsAgent";

export default async function deleteSubject(subjectId) {
  if (!subjectId) {
    return {
      success: false,
      message: "Subject ID is required",
    };
  }

  // 1. Check if the subject exists.
  const subjectParams = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    Key: {
      pKey: `SUBJECT#${subjectId}`,
      sKey: "SUBJECTS",
    },
  };

  try {
    const subjectResult = await dynamoDB.get(subjectParams).promise();
    if (!subjectResult.Item) {
      return {
        success: false,
        message: "Subject not found",
      };
    }

    // 2. Check if any questions exist for the subject.
    // Use Select: "COUNT" to minimize data read.
    const questionParams = {
      TableName: `${process.env.AWS_DB_NAME}content`,
      FilterExpression: "sKey = :skeyVal",
      ExpressionAttributeValues: {
        ":skeyVal": `QUESTIONS@${subjectId}`,
      },
      Select: "COUNT",
    };

    const questionResult = await dynamoDB.scan(questionParams).promise();
    console.log("questionResult", questionResult);

    if (questionResult.Count && questionResult.Count > 0) {
      return {
        success: false,
        message: `This subject has ${questionResult.Count} associated question(s). Please delete all associated questions before deleting the subject.`,
      };
    }

    // 3. Delete the subject record.
    const deleteParams = {
      TableName: `${process.env.AWS_DB_NAME}content`,
      Key: {
        pKey: `SUBJECT#${subjectId}`,
        sKey: "SUBJECTS",
      },
    };

    await dynamoDB.delete(deleteParams).promise();

    return {
      success: true,
      message: "Subject deleted successfully",
    };
  } catch (error) {
    console.error("DynamoDB Error in deleteSubject:", error);
    throw new Error("Internal server error");
  }
}
