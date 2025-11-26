import { dynamoDB } from "../awsAgent";
import { GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

export default async function getAllResources({ bankID }) {
  const bankParams = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    Key: {
      pKey: `BANK#${bankID}`,
      sKey: `BANKS`,
    },
  };
  const params = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    FilterExpression: "sKey = :sKey",
    ExpressionAttributeValues: {
      ":sKey": `RESOURCE@${bankID}`,
    },
  };
  try {
    const bankResponse = await dynamoDB.send(new GetCommand(bankParams));
    console.log("bankResponse", bankResponse);

    const response = await dynamoDB.send(new ScanCommand(params));
    return {
      success: true,
      message: "All resources fetched successfully",
      data: {
        bankID,
        bankTitle: bankResponse.Item.title,
        videoCollectionID: bankResponse.Item.videoCollectionID,
        resources: response.Items.map((resource) => {
          const {
            pKey,
            name,
            isUploaded,
            type,
            thumbnail,
            url,
            videoID,
            path,
          } = resource;
          return {
            resourceID: pKey.split("#")[1],
            type,
            name,
            isUploaded,
            thumbnail,
            videoID,
            url,
            path,
          };
        }),
      },
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
