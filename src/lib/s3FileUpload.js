import { s3 } from "../util/awsAgent";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default async function s3FileUpload({ Bucket, Key, fileType, Expires }) {
  const command = new PutObjectCommand({
    Bucket,
    Key,
    ContentType: fileType,
  });

  try {
    const url = await getSignedUrl(s3, command, { expiresIn: Expires });

    return url;
  } catch (err) {
    throw new Error("Internal server error");
  }
}
