import { dynamoDB } from "../awsAgent";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

export default async function getGoal({ goalID }) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: `GOAL#${goalID}`,
      sKey: "GOALS",
    },
    ReturnConsumedCapacity: "TOTAL",
  };
  try {
    const response = await dynamoDB.send(new GetCommand(params));
    console.log(response);

    if (!response.Item) {
      return {
        success: false,
        message: "Goal not found",
      };
    }
    return {
      success: true,
      message: "Goal fetched successfully",
      data: {
        goalID: response.Item.pKey.split("#")[1],
        title: response.Item.title,
        icon: response.Item.icon,
        subjectList: response.Item.subjectList,
        coursesList: response.Item.coursesList,
        blogList: response.Item.blogList,
        isLive: response.Item.isLive,
      },
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
