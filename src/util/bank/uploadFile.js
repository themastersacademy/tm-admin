import { dynamoDB, s3 } from "../awsAgent";
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
  try {
    // 🏦 Check if the bank exists in DynamoDB
    const bankParams = {
      TableName: `${process.env.AWS_DB_NAME}content`,
      Key: { pKey: `BANK#${bankID}`, sKey: `BANKS` },
    };

    const bankResponse = await dynamoDB.get(bankParams).promise();
    if (!bankResponse.Item) {
      return { success: false, message: "Bank not found" };
    }

    // 🔹 Prepare resource item for DynamoDB
    const resourceParams = {
      TableName: `${process.env.AWS_DB_NAME}content`,
      Item: {
        pKey: `RESOURCE#${randomUUID()}`,
        sKey: `RESOURCE@${bankID}`,
        type: "FILE",
        name: title,
        url: "",
        path: awsFileName,
        fileType,
        isUploaded: false,
        linkedLessons: [],
      },
    };

    // 📌 Upload resource record to DynamoDB
    await dynamoDB.put(resourceParams).promise();

    // 📂 Generate a pre-signed upload URL from S3
    const fileParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: awsFileName,
      Expires: 60 * 60, // 1 - hour expiry
      ContentType: fileType,
    };

    const url = await s3.getSignedUrlPromise("putObject", fileParams);

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
    const deleteParams = {
      TableName: `${process.env.AWS_DB_NAME}content`,
      Key: { pKey: `RESOURCE#${fileName}`, sKey: `RESOURCE@${bankID}` },
    };
    await dynamoDB.delete(deleteParams).promise();

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
    await s3.headObject(s3Params).promise();

    // 2️⃣ Query DynamoDB to find the correct `sKey`
    const queryParams = {
      TableName: `${process.env.AWS_DB_NAME}content`,
      KeyConditionExpression: "pKey = :pKeyVal",
      ExpressionAttributeValues: { ":pKeyVal": `RESOURCE#${resourceID}` },
    };

    const queryResult = await dynamoDB.query(queryParams).promise();
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

    await dynamoDB.update(updateParams).promise();

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
