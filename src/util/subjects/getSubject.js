import {dynamoDB} from "../awsAgent";

export default async function getSubject({ subjectID }) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    Key: {
      pKey: `SUBJECT#${subjectID}`,
      sKey: "SUBJECTS",
    },
  };
  try {
    const response = await dynamoDB.get(params).promise();
    if (!response.Item) {
      return {
        success: false,
        message: "Subject not found",
      };
    }
    return {
      success: true,
      message: "Subject fetched successfully",
      data: {
        subjectID: response.Item.pKey.split("#")[1],
        title: response.Item.title,
        createdAt: response.Item.createdAt,
        updatedAt: response.Item.updatedAt,
      },
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
