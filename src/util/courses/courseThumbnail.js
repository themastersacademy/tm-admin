import s3FileUpload from "@/src/lib/s3FileUpload";
import { dynamoDB, s3 } from "@/src/util/awsAgent";
import { UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

export async function createThumbnail({
  courseID,
  fileType,
  fileName,
  goalID,
}) {
  if (!courseID || !fileType || !fileName || !goalID) {
    throw new Error("Missing required parameters");
  }

  // Extract file extension and generate a unique S3 key for the thumbnail.
  const fileExtension = fileName.split(".").pop();
  const awsFileName = `${
    process.env.AWS_THUMB_PATH
  }${randomUUID()}-${courseID}.${fileExtension}`;

  try {
    // Get a signed URL for uploading the file using the unique awsFileName.
    const signedUrl = await s3FileUpload({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: awsFileName,
      fileType,
      Expires: 60 * 60,
    });

    // Update the course record in DynamoDB with the new thumbnail URL.
    const thumbnailURL = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${awsFileName}`;
    const courseUpdateParams = {
      TableName: `${process.env.AWS_DB_NAME}master`,
      Key: {
        pKey: `COURSE#${courseID}`,
        sKey: `COURSES@${goalID}`,
      },
      UpdateExpression: "SET thumbnail = :thumbnail, updatedAt = :u",
      ExpressionAttributeValues: {
        ":thumbnail": thumbnailURL,
        ":u": Date.now(),
      },
    };

    await dynamoDB.send(new UpdateCommand(courseUpdateParams));
    await updateGoalCourseListThumb({
      courseID,
      goalID,
      thumbnail: thumbnailURL,
    });

    return {
      success: true,
      message: "Thumbnail created successfully",
      data: { url: signedUrl },
    };
  } catch (err) {
    console.error("Error creating thumbnail:", err);
    throw new Error("Internal server error");
  }
}

export async function deleteThumbnail({ courseID, goalID }) {
  if (!courseID || !goalID) {
    throw new Error("courseID and goalID are required");
  }

  const TABLE = `${process.env.AWS_DB_NAME}master`;

  // 1. Retrieve the course record.
  const getParams = {
    TableName: TABLE,
    Key: {
      pKey: `COURSE#${courseID}`,
      sKey: `COURSES@${goalID}`,
    },
  };

  try {
    const result = await dynamoDB.send(new GetCommand(getParams));
    if (!result.Item) {
      throw new Error("Course not found");
    }
    const thumbnailURL = result.Item.thumbnail;
    if (!thumbnailURL || thumbnailURL === "") {
      return { success: true, message: "No thumbnail to delete" };
    }
    let s3Key = "";
    if (thumbnailURL) {
      // Assume URL format: https://{bucket}.s3.{region}.amazonaws.com/{s3Key}
      // Extract the s3Key: take everything after the third '/'.
      const parts = thumbnailURL.split("/");
      s3Key = parts.slice(3).join("/");
    }

    // 2. Delete the thumbnail file from S3 if s3Key is available.
    if (s3Key) {
      const s3DeleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
      };
      await s3.send(new DeleteObjectCommand(s3DeleteParams));
    }

    // 3. Update the course record in DynamoDB to remove the thumbnail.
    // Use a combined UpdateExpression: SET updatedAt then REMOVE thumbnail.
    const updateParams = {
      TableName: TABLE,
      Key: {
        pKey: `COURSE#${courseID}`,
        sKey: `COURSES@${goalID}`,
      },
      UpdateExpression: "SET updatedAt = :u REMOVE thumbnail",
      ExpressionAttributeValues: {
        ":u": Date.now(),
      },
    };

    await dynamoDB.send(new UpdateCommand(updateParams));

    // 4. Update the goal record's coursesList to clear the thumbnail.
    await updateGoalCourseListThumb({ courseID, goalID, thumbnail: "" });

    return { success: true, message: "Thumbnail deleted successfully" };
  } catch (error) {
    console.error("Error deleting thumbnail:", error);
    throw new Error("Internal server error");
  }
}

async function updateGoalCourseListThumb({ courseID, goalID, thumbnail }) {
  if (!courseID || !goalID) {
    throw new Error("courseID and goalID are required");
  }

  const TABLE = `${process.env.AWS_DB_NAME}master`;

  // Retrieve the goal record.
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
    let coursesList = result.Item.coursesList || [];
    const index = coursesList.findIndex((course) => course.id === courseID);
    if (index === -1) {
      throw new Error("Course not found in goal courses list");
    }
    // Update the thumbnail field; if thumbnail is falsy (e.g. null), set it to an empty string.
    coursesList[index].thumbnail = thumbnail || "";

    const updateParams = {
      TableName: TABLE,
      Key: {
        pKey: `GOAL#${goalID}`,
        sKey: "GOALS",
      },
      UpdateExpression: "SET coursesList = :cl, updatedAt = :u",
      ExpressionAttributeValues: {
        ":cl": coursesList,
        ":u": Date.now(),
      },
    };

    await dynamoDB.send(new UpdateCommand(updateParams));
    return { success: true, message: "Goal courses list updated successfully" };
  } catch (error) {
    console.error("Error updating goal courses list thumbnail:", error);
    throw new Error("Error updating goal courses list thumbnail");
  }
}
