import { dynamoDB } from "../awsAgent";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export default async function getAllGoals() {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    FilterExpression: "sKey = :sKey",
    ExpressionAttributeValues: {
      ":sKey": "GOALS",
    },
    ReturnConsumedCapacity: "TOTAL",
  };
  try {
    const response = await dynamoDB.send(new ScanCommand(params));
    return {
      success: true,
      message: "All goals fetched successfully",
      data: {
        goals: response.Items.map((goal) => {
          const {
            pKey,
            title,
            icon,
            isLive,
            coursesList = [],
            subjectList = [],
            blogList = [],
            createdAt,
            updatedAt,
          } = goal;
          return {
            goalID: pKey.split("#")[1],
            title,
            icon,
            isLive,
            coursesCount: coursesList.length,
            subjectsCount: subjectList.length,
            blogsCount: blogList.length,
            updatedAt,
          };
        }),
      },
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
