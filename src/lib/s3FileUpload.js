import { s3 } from "../util/awsAgent";

export default async function s3FileUpload({ Bucket, Key, fileType, Expires }) {
  const fileParams = {
    Bucket,
    Key,
    Expires,
    ContentType: fileType,
  };

  try {
    const url = await s3.getSignedUrlPromise("putObject", fileParams);

    return url;
  } catch (err) {
    throw new Error("Internal server error");
  }
}
