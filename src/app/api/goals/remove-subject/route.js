import { dynamoDB } from "@/src/util/awsAgent";

export async function POST(request) {
  const { goalID, subjectID } = await request.json();

  if (!goalID || !subjectID) {
    return Response.json(
      { success: false, message: "goalID and subjectID are required" },
      { status: 400 }
    );
  }

  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: `GOAL#${goalID}`,
      sKey: "GOALS",
    },
  };

  try {
    // Retrieve the current goal item
    const result = await dynamoDB.get(params).promise();
    if (!result.Item) {
      return Response.json(
        { success: false, message: "Goal not found" },
        { status: 404 }
      );
    }

    const currentSubjectList = result.Item.subjectList || [];

    // Filter out the subject with the given subjectID.
    const newSubjectList = currentSubjectList.filter(
      (item) => item.subjectID !== subjectID
    );

    // Update the goal with the new subjectList
    const updateParams = {
      TableName: `${process.env.AWS_DB_NAME}master`,
      Key: {
        pKey: `GOAL#${goalID}`,
        sKey: "GOALS",
      },
      UpdateExpression: "SET subjectList = :newList, updatedAt = :u",
      ExpressionAttributeValues: {
        ":newList": newSubjectList,
        ":u": Date.now(),
      },
    };

    await dynamoDB.update(updateParams).promise();
    return Response.json(
      { success: true, message: "Subject removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing subject:", error);
    return Response.json(
      { success: false, message: "Error removing subject" },
      { status: 500 }
    );
  }
}
