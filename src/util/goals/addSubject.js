import { dynamoDB } from "../awsAgent";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import getSubject from "../subjects/getSubject";

export default async function addSubject({ subjectID, goalID }) {
  const subject = await getSubject({ subjectID });
  if (!subject.success) {
    return {
      success: false,
      message: subject.message,
    };
  }
  const { title, totalQuestions } = subject.data;

  // Step 1: Check if the subject already exists in the goal's subjectList
  const getParams = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: `GOAL#${goalID}`,
      sKey: "GOALS",
    },
  };

  try {
    // Get the current goal item
    const data = await dynamoDB.send(new GetCommand(getParams));
    const subjectList = data.Item?.subjectList || [];

    // Step 2: Check if the subject is already in the list
    const subjectExists = subjectList.some(
      (subject) => subject.subjectID === subjectID
    );

    if (subjectExists) {
      // Return a message saying that the subject already exists
      return {
        success: false,
        message: "Subject already exists, cannot add again.",
      };
    }

    // Step 3: If subject does not exist, add it to the list
    const updateParams = {
      TableName: `${process.env.AWS_DB_NAME}master`,
      Key: {
        pKey: `GOAL#${goalID}`,
        sKey: "GOALS",
      },
      UpdateExpression:
        "SET subjectList = list_append(if_not_exists(subjectList, :empty_list), :subject)",
      ExpressionAttributeValues: {
        ":subject": [
          {
            subjectID: subjectID,
            title: title || "",
            totalQuestions: totalQuestions || 0,
          },
        ],
        ":empty_list": [],
      },
    };

    // Update the goal to add the subject
    await dynamoDB.send(new UpdateCommand(updateParams));

    return {
      success: true,
      message: "Subject added successfully",
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
