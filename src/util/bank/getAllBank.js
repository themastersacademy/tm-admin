import { dynamoDB } from "../awsAgent";

export default async function getAllBank() {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    FilterExpression: "sKey = :sKey",
    ExpressionAttributeValues: {
      ":sKey": "BANKS",
    },
  };
  try {
    const response = await dynamoDB.scan(params).promise();
    return {
      success: true,
      message: "All banks fetched successfully",
      data: {
        banks: response.Items.map((bank) => {
          const { pKey, title } = bank;
          return { bankID: pKey.split("#")[1], title,};
        }),
      },
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
