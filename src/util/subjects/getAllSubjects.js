import {dynamoDB} from "../awsAgent";

export default async function getAllSubjects() {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    FilterExpression: "sKey = :sKey",
    ExpressionAttributeValues: {
      ":sKey": "SUBJECTS",
    },
  };
  try {
    const response = await dynamoDB.scan(params).promise();
    return {
      success: true,
      message: "Subjects fetched successfully",
      data: {
        subjects: response.Items.map((subject) => ({
          subjectID: subject.pKey.split("#")[1],
          title: subject.title,
          createdAt: subject.createdAt,
          updatedAt: subject.updatedAt,
        })),
      },
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
