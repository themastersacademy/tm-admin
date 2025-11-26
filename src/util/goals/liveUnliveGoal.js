import { dynamoDB } from "../awsAgent";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import getGoal from "./getGoal";
import { getGoalContent } from "./goalContent";

export default async function liveUnliveGoal({ goalID }) {
  const goal = await getGoal({ goalID });
  if (!goal.success) {
    throw new Error(goal.message);
  }
  if (goal.data.isLive) {
    const params = {
      TableName: `${process.env.AWS_DB_NAME}master`,
      Key: {
        pKey: `GOAL#${goalID}`,
        sKey: "GOALS",
      },
      UpdateExpression: "set isLive = :isLive",
      ExpressionAttributeValues: {
        ":isLive": !goal.data.isLive,
      },
    };
    await dynamoDB.send(new UpdateCommand(params));
    return {
      success: true,
      message: "Goal unlive successfully",
    };
  }
  if (goal.data.subjectList.length === 0) {
    throw new Error("Goal has no subjects");
  }
  if (goal.data.coursesList.length === 0) {
    throw new Error("Goal has no courses");
  }
  const goalContent = await getGoalContent({ goalID });
  if (!goalContent.success) {
    throw new Error(goalContent.message);
  }
  if (goalContent.data.length === 0) {
    throw new Error("Goal has no blogs");
  }

  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: `GOAL#${goalID}`,
      sKey: "GOALS",
    },
    UpdateExpression: "set isLive = :isLive",
    ExpressionAttributeValues: {
      ":isLive": true,
    },
  };

  await dynamoDB.send(new UpdateCommand(params));
  return {
    success: true,
    message: "Goal live successfully",
  };
}
