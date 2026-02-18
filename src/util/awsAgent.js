"server only";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";

if (
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_IAM_SECRET_KEY ||
  !process.env.AWS_REGION
) {
  throw new Error(
    "Cannot Read env variable AWS_ACCESS_KEY_ID or AWS_SECRET_KEY or REGION",
  );
}

// Enforce a strong SESSION_SECRET. HS256 tokens signed with a short/guessable
// secret can be forged by anyone. Minimum 32 characters is required.
// Generate a strong value with: openssl rand -hex 32
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  throw new Error(
    "SESSION_SECRET must be at least 32 characters long. " +
      "Set a strong random value in .env.local (e.g. run: openssl rand -hex 32).",
  );
}

const dbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_IAM_SECRET_KEY,
  },
});

const dynamoDB = DynamoDBDocument.from(dbClient);

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_IAM_SECRET_KEY,
  },
});

export { dynamoDB, s3 };
