"use server";
import { s3 } from "../awsAgent";
import { randomUUID } from "crypto";

export default async function uploadImage({ filename, fileType }) {
  if (!fileType.startsWith("image")) {
    return {
      success: false,
      message: "Invalid file type",
    };
  }
  const fileExtension = filename.split(".")[1];
  const awsFileName = `${
    process.env.AWS_QUESTION_PATH
  }${randomUUID()}.${fileExtension}`;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: awsFileName,
    // Body: image,
    ContentType: fileType,
  };
  try {
    const url = await s3.getSignedUrlPromise("putObject", params);
    return {
      success: true,
      message: "Image signed URL generated successfully",
      data: {
        signedUrl: url,
        imgUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${awsFileName}`,
      },
    };
  } catch (err) {
    console.error("S3 Error:", err);
    throw new Error("Internal server error");
  }
}
