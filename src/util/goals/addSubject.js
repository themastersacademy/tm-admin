import {dynamoDB} from "../awsAgent";

export default async function addSubject({ subjectID, goalID, title }) {
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
    const data = await dynamoDB.get(getParams).promise();
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
      UpdateExpression: "SET subjectList = list_append(subjectList, :subject)",
      ExpressionAttributeValues: {
        ":subject": [
          {
            subjectID: subjectID,
            title: title,
          },
        ],
      },
    };

    // Update the goal to add the subject
    await dynamoDB.update(updateParams).promise();

    return {
      success: true,
      message: "Subject added successfully",
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}