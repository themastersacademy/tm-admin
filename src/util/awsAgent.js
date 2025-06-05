"server only";
import AWS from "aws-sdk";

if (
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_IAM_SECRET_KEY ||
  !process.env.AWS_REGION
) {
  throw new Error(
    "Cannot Read env variable AWS_ACCESS_KEY_ID or AWS_SECRET_KEY or REGION"
  );
}

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_IAM_SECRET_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const s3 = new AWS.S3();

export { dynamoDB, s3 };
