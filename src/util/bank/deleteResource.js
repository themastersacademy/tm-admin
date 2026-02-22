import { dynamoDB, s3 } from "../awsAgent";
import { GetCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function deleteResource({ resourceID, bankID }) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    Key: {
      pKey: `RESOURCE#${resourceID}`,
      sKey: `RESOURCE@${bankID}`,
    },
  };
  try {
    const response = await dynamoDB.send(new GetCommand(params));
    console.log("Response", response);

    if (!response.Item) {
      return { success: false, message: "Resource not found" };
    }

    if (response.Item.linkedLessons.length > 0) {
      return { success: false, message: "Resource is linked to lessons" };
    }
    const { type } = response.Item;
    if (type === "FILE") {
      const fileParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: response.Item.path,
      };
      await s3.send(new DeleteObjectCommand(fileParams));
    } else if (type === "VIDEO") {
      await deleteBunnyVideo(response.Item.videoID);
    } else {
      throw new Error("Invalid resource type");
    }
    await dynamoDB.send(new DeleteCommand(params));

    // 🔹 Update parent Bank item to remove resource
    const bankParams = {
      TableName: `${process.env.AWS_DB_NAME}content`,
      Key: { pKey: `BANK#${bankID}`, sKey: `BANKS` },
    };
    const bankResponse = await dynamoDB.send(new GetCommand(bankParams));
    if (bankResponse.Item && bankResponse.Item.resources) {
      const updatedResources = bankResponse.Item.resources.filter(
        (r) => r.resourceID !== resourceID
      );
      await dynamoDB.send(
        new UpdateCommand({
          TableName: `${process.env.AWS_DB_NAME}content`,
          Key: { pKey: `BANK#${bankID}`, sKey: `BANKS` },
          UpdateExpression: "SET resources = :resources",
          ExpressionAttributeValues: {
            ":resources": updatedResources,
          },
        })
      );
    }

    return { success: true, message: "Resource deleted successfully" };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}

async function deleteBunnyVideo(videoID) {
  const response = await fetch(
    `https://video.bunnycdn.com/library/${process.env.BUNNY_VIDEO_LIBRARY_ID}/videos/${videoID}`,
    {
      method: "DELETE",
      headers: {
        accept: "application/json",
        AccessKey: process.env.BUNNY_API_KEY,
      },
    }
  );
  console.log(await response.json());
  return response.ok;
}
