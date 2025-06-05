import { dynamoDB, s3 } from "../awsAgent";

export async function deleteResource({ resourceID, bankID }) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    Key: {
      pKey: `RESOURCE#${resourceID}`,
      sKey: `RESOURCE@${bankID}`,
    },
  };
  try {
    const response = await dynamoDB.get(params).promise();
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
      await s3.deleteObject(fileParams).promise();
    } else if (type === "VIDEO") {
      await deleteBunnyVideo(response.Item.videoID);
    } else {
      throw new Error("Invalid resource type");
    }
    await dynamoDB.delete(params).promise();
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
