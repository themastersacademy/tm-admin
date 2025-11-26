"use server";
import { s3 } from "../awsAgent";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: awsFileName,
    ContentType: fileType,
  });
  try {
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
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
