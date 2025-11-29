import s3FileUpload from "@/src/lib/s3FileUpload";
import { dynamoDB, s3 } from "@/src/util/awsAgent";
import { UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

export async function createGoalThumbnail({ goalID, fileType, fileName }) {
  if (!goalID || !fileType || !fileName) {
    throw new Error("Missing required parameters");
  }

  // Extract file extension and generate a unique S3 key for the thumbnail.
  const fileExtension = fileName.split(".").pop();
  const awsFileName = `${
    process.env.AWS_THUMB_PATH
  }goal-${randomUUID()}-${goalID}.${fileExtension}`;

  try {
    // Get a signed URL for uploading the file using the unique awsFileName.
    const signedUrl = await s3FileUpload({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: awsFileName,
      fileType,
      Expires: 60 * 60,
    });

    // Update the goal record in DynamoDB with the new banner URL.
    const bannerURL = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${awsFileName}`;
    const goalUpdateParams = {
      TableName: `${process.env.AWS_DB_NAME}master`,
      Key: {
        pKey: `GOAL#${goalID}`,
        sKey: "GOALS",
      },
      UpdateExpression: "SET bannerImage = :banner, updatedAt = :u",
      ExpressionAttributeValues: {
        ":banner": bannerURL,
        ":u": Date.now(),
      },
    };

    await dynamoDB.send(new UpdateCommand(goalUpdateParams));

    return {
      success: true,
      message: "Banner created successfully",
      data: { url: signedUrl, bannerURL },
    };
  } catch (err) {
    console.error("Error creating banner:", err);
    throw new Error("Internal server error");
  }
}

export async function deleteGoalThumbnail({ goalID }) {
  if (!goalID) {
    throw new Error("goalID is required");
  }

  const TABLE = `${process.env.AWS_DB_NAME}master`;

  // 1. Retrieve the goal record.
  const getParams = {
    TableName: TABLE,
    Key: {
      pKey: `GOAL#${goalID}`,
      sKey: "GOALS",
    },
  };

  try {
    const result = await dynamoDB.send(new GetCommand(getParams));
    if (!result.Item) {
      throw new Error("Goal not found");
    }
    const bannerURL = result.Item.bannerImage;
    if (!bannerURL || bannerURL === "") {
      return { success: true, message: "No banner to delete" };
    }
    let s3Key = "";
    if (bannerURL) {
      // Assume URL format: https://{bucket}.s3.{region}.amazonaws.com/{s3Key}
      // Extract the s3Key: take everything after the third '/'.
      const parts = bannerURL.split("/");
      s3Key = parts.slice(3).join("/");
    }

    // 2. Delete the banner file from S3 if s3Key is available.
    if (s3Key) {
      const s3DeleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
      };
      await s3.send(new DeleteObjectCommand(s3DeleteParams));
    }

    // 3. Update the goal record in DynamoDB to remove the banner.
    const updateParams = {
      TableName: TABLE,
      Key: {
        pKey: `GOAL#${goalID}`,
        sKey: "GOALS",
      },
      UpdateExpression: "SET updatedAt = :u REMOVE bannerImage",
      ExpressionAttributeValues: {
        ":u": Date.now(),
      },
    };

    await dynamoDB.send(new UpdateCommand(updateParams));

    return { success: true, message: "Banner deleted successfully" };
  } catch (error) {
    console.error("Error deleting banner:", error);
    throw new Error("Internal server error");
  }
}
