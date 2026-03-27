import { dynamoDB, s3 } from "../awsAgent";
import {
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

// 📌 Create a new file record in DynamoDB and generate a pre-signed URL for S3 upload

export async function createFile({ title, bankID, fileName, fileType }) {
  // 🛠 Generate unique file name
  // get the extension of the file from the fileName and it should be the last element of the split array
  const fileExtension = fileName.split(".")?.pop();
  // const fileExtension = fileName.split(".")[1];
  const awsFileName = `${
    process.env.AWS_BANK_PATH
  }${randomUUID()}-${title.replace(/\s+/g, "_")}.${fileExtension}`;
  const resourceID = randomUUID();
  try {
    // 🏦 Check if the bank exists in DynamoDB
    const bankParams = {
      TableName: `${process.env.AWS_DB_NAME}content`,
      Key: { pKey: `BANK#${bankID}`, sKey: `BANKS` },
    };

    const bankResponse = await dynamoDB.send(new GetCommand(bankParams));
    if (!bankResponse.Item) {
      return { success: false, message: "Bank not found" };
    }

    // 🔹 Prepare resource item for DynamoDB
    const resourceParams = {
      TableName: `${process.env.AWS_DB_NAME}content`,
      Item: {
        pKey: `RESOURCE#${resourceID}`,
        sKey: `RESOURCE@${bankID}`,
        "GSI1-pKey": `RESOURCE@${bankID}`,
        "GSI1-sKey": `RESOURCE#${resourceID}`,
        type: "FILE",
        name: title,
        url: "",
        path: awsFileName,
        fileType,
        isUploaded: false,
        linkedLessons: [],
        createdAt: new Date().toISOString(),
      },
    };

    // 📌 Upload resource record to DynamoDB
    await dynamoDB.send(new PutCommand(resourceParams));

    // 📂 Generate a pre-signed upload URL from S3
    const fileParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: awsFileName,
      ContentType: fileType,
    };

    const command = new PutObjectCommand(fileParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    // 🔹 Update parent Bank item with new resource count/list
    await dynamoDB.send(
      new UpdateCommand({
        TableName: `${process.env.AWS_DB_NAME}content`,
        Key: { pKey: `BANK#${bankID}`, sKey: `BANKS` },
        UpdateExpression:
          "SET resources = list_append(if_not_exists(resources, :empty_list), :new_resource)",
        ExpressionAttributeValues: {
          ":empty_list": [],
          ":new_resource": [
            {
              resourceID: resourceParams.Item.pKey.split("#")[1],
              type: "FILE",
              name: title,
              createdAt: resourceParams.Item.createdAt,
            },
          ],
        },
      })
    );

    return {
      success: true,
      message: "File created successfully",
      data: {
        resourceID: resourceParams.Item.pKey.split("#")[1], // Use fileName directly
        url,
        name: title,
        path: awsFileName,
      },
    };
  } catch (err) {
    console.error("Error:", err);

    // 🚨 Rollback - Delete the record if DynamoDB write fails
    try {
      const deleteParams = {
        TableName: `${process.env.AWS_DB_NAME}content`,
        Key: { pKey: `RESOURCE#${resourceID}`, sKey: `RESOURCE@${bankID}` },
      };
      await dynamoDB.send(new DeleteCommand(deleteParams));
    } catch (rollbackErr) {
      console.error("Rollback failed:", rollbackErr);
    }

    throw new Error("Internal server error");
  }
}

// 📌 Verify the uploaded file in S3 and update the record in DynamoDB

export async function verifyFile(resourceID, path) {
  const s3Params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: path,
  };

  try {
    // 1️⃣ Check if file exists in S3
    await s3.send(new HeadObjectCommand(s3Params));

    // 2️⃣ Query DynamoDB to find the correct `sKey`
    const queryParams = {
      TableName: `${process.env.AWS_DB_NAME}content`,
      KeyConditionExpression: "pKey = :pKeyVal",
      ExpressionAttributeValues: { ":pKeyVal": `RESOURCE#${resourceID}` },
    };

    const queryResult = await dynamoDB.send(new QueryCommand(queryParams));
    if (!queryResult.Items || queryResult.Items.length === 0) {
      return { success: false, message: "Resource not found in database" };
    }

    const { sKey } = queryResult.Items[0]; // Get the correct `sKey`

    // 3️⃣ Update `isUploaded` in DynamoDB
    const updateParams = {
      TableName: `${process.env.AWS_DB_NAME}content`,
      Key: { pKey: `RESOURCE#${resourceID}`, sKey },
      UpdateExpression: "SET isUploaded = :val",
      ExpressionAttributeValues: { ":val": true },
    };

    await dynamoDB.send(new UpdateCommand(updateParams));

    return {
      success: true,
      message: "File verified and updated",
      exists: true,
    };
  } catch (error) {
    console.error("Verification Error:", error);
    return {
      success: false,
      message: "File verification failed",
      exists: false,
    };
  }
}
