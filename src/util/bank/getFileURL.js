import { s3 } from "../awsAgent";

/**
 * Generates a pre-signed URL for retrieving a file from S3.
 *
 * @param {Object} params
 * @param {string} params.path - The S3 key (file path) for the file.
 * @param {number} [params.expiry=3600] - URL expiry time in seconds (default: 1 hour).
 * @returns {Promise<Object>} Returns an object with the signed URL if successful.
 */
export async function getFileURL({ path, expiry = 3600 }) {
  const fileParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: path, // The file path in S3
    Expires: expiry, // Expiry time in seconds (e.g., 3600 seconds = 1 hour)
  };

  try {
    // Generate the pre-signed URL for the GET operation
    const url = await s3.getSignedUrlPromise("getObject", fileParams);
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
