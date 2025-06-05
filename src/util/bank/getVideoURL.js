import { dynamoDB } from "../awsAgent";
import generateBunnyVideoURL from "@/src/lib/generateBunnyVideoURL";

export default async function getVideoURL(resourceID) {
  if (!resourceID) {
    return { success: false, message: "Resource ID is required" };
  }
  
  const TABLE = `${process.env.AWS_DB_NAME}content`;
  
  try {
    // Query for the resource item using its partition key.
    const resourceQueryParams = {
      TableName: TABLE,
      KeyConditionExpression: "pKey = :rKey",
      ExpressionAttributeValues: {
        ":rKey": `RESOURCE#${resourceID}`,
      },
      Select: "ALL_ATTRIBUTES",
    };

    const resourceResult = await dynamoDB.query(resourceQueryParams).promise();
    console.log("Resource result:", resourceResult);
    
    if (!resourceResult.Items || resourceResult.Items.length === 0) {
      return { success: false, message: "Resource not found" };
    }
    
    const resourceItem = resourceResult.Items[0];
    if (resourceItem.type !== "VIDEO") {
      return { success: false, message: "Resource is not a video" };
    }
    
    const videoID = resourceItem.videoID;
    const videoURL = generateBunnyVideoURL(videoID);
    
    return { success: true, videoURL };
  } catch (error) {
    console.error("Error fetching video URL:", error);
    return { success: false, message: "Error fetching video URL" };
  }
}
