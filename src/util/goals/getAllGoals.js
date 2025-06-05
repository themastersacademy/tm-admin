import { dynamoDB } from "../awsAgent";

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
    const response = await dynamoDB.scan(params).promise();
    return {
      success: true,
      message: "All goals fetched successfully",
      data: {
        goals: response.Items.map((goal) => {
          const { pKey, title, icon, isLive } = goal;
          return { goalID: pKey.split("#")[1], title, icon, isLive };
        }),
      },
    };
    // return response.Items;
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
