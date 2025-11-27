import { s3 } from "../awsAgent";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Generates a pre-signed URL for retrieving a file from S3.
 *
 * @param {Object} params
 * @param {string} params.path - The S3 key (file path) for the file.
 * @param {number} [params.expiry=3600] - URL expiry time in seconds (default: 1 hour).
 * @returns {Promise<Object>} Returns an object with the signed URL if successful.
 */
export async function getFileURL({ path, expiry = 3600 }) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: path,
    });

    // Generate the pre-signed URL for the GET operation
    const url = await getSignedUrl(s3, command, { expiresIn: expiry });

    return {
      success: true,
      url,
      message: "Pre-signed URL generated successfully",
    };
  } catch (error) {
    console.error("Error generating GET signed URL:", error);
    return {
      success: false,
      message: "Failed to generate pre-signed URL",
      error: error.message,
    };
  }
}
