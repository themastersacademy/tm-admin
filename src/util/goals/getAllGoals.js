import { dynamoDB } from "../awsAgent";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export default async function getAllGoals() {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    FilterExpression: "sKey = :sKey",
    ExpressionAttributeValues: {
      ":sKey": "GOALS",
    },
    ProjectionExpression:
      "pKey, title, icon, isLive, coursesList, subjectList, blogList, updatedAt",
  };
  try {
    const items = [];
    let lastKey;

    do {
      const response = await dynamoDB.send(
        new ScanCommand({
          ...params,
          ...(lastKey && { ExclusiveStartKey: lastKey }),
        })
      );
      items.push(...(response.Items || []));
      lastKey = response.LastEvaluatedKey;
    } while (lastKey);

    return {
      success: true,
      message: "All goals fetched successfully",
      data: {
        goals: items.map((goal) => {
          const {
            pKey,
            title,
            icon,
            isLive,
            coursesList = [],
            subjectList = [],
            blogList = [],
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
