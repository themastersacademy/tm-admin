import { dynamoDB } from "../awsAgent";

export default async function getCourse({ courseID, goalID }) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: `COURSE#${courseID}`,
      sKey: `COURSES@${goalID}`,
    },
  };
  try {
    const { Item } = await dynamoDB.get(params).promise();
    if (!Item) {
      return {
        success: false,
        message: "Course not found",
      };
    }
    return {
      success: true,
      message: "Course fetched successfully",
      data: {
        ...Item,
        id: Item.pKey.split("#")[1],
        goalID: Item.sKey.split("@")[1],
        pKey: undefined,
        sKey: undefined,
      },
    };
  } catch (error) {
    console.error("DynamoDB Error:", error);
    throw new Error("Internal server error");
  }
}
