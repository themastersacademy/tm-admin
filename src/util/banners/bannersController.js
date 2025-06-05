import { s3, dynamoDB } from "../awsAgent";
import { randomUUID } from "crypto";
import s3FileUpload from "@/src/lib/s3FileUpload";

export async function getAllBanners() {
  const TableName = `${process.env.AWS_DB_NAME}master`;
  const params = {
    TableName,
    FilterExpression: "sKey = :sKey",
    ExpressionAttributeValues: {
      ":sKey": "BANNERS",
    },
  };

  try {
    const result = await dynamoDB.scan(params).promise();
    return {
      success: true,
      message: "Banners fetched successfully",
      data: result.Items.map((item) => ({
        ...item,
        id: item.bannerID,
        pKey: undefined,
        sKey: undefined,
      })),
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function createBanner({ fileName, fileType, title }) {
  const TableName = `${process.env.AWS_DB_NAME}master`;
  const INDEX_NAME = "masterTableIndex";
  const BucketName = process.env.AWS_BUCKET_NAME;
  const fileExtension = fileName.split(".").pop();
  const bannerID = randomUUID();
  const awsFileName = `${process.env.AWS_LMS_PATH}${bannerID}.${fileExtension}`;
  const bannerURL = `https://${BucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${awsFileName}`;

  const signedUrl = await s3FileUpload({
    Bucket: BucketName,
    Key: awsFileName,
    fileType,
    Expires: 60 * 60,
  });

  const params = {
    TableName: TableName,
    IndexName: INDEX_NAME,
    Item: {
      pKey: `BANNER#${bannerID}`,
      sKey: `BANNERS`,
      "GSI1-pKey": `BANNERS`,
      "GSI1-sKey": bannerID,
      bannerID: bannerID,
      title: title,
      fileType: fileType,
      bannerURL: bannerURL,
      path: awsFileName,
      isUploaded: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  };

  try {
    const result = await dynamoDB.put(params).promise();
    return {
      success: true,
      message: "Banner created successfully",
      data: {
        bannerID: bannerID,
        bannerURL: bannerURL,
        signedUrl: signedUrl,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function verifyBannerUpload({ bannerID }) {
  const TableName = `${process.env.AWS_DB_NAME}master`;
  const now = Date.now();

  // Parameters for querying the banner using its pKey.
  const queryParams = {
    TableName,
    KeyConditionExpression: "pKey = :pKey",
    ExpressionAttributeValues: {
      ":pKey": `BANNER#${bannerID}`,
    },
  };

  // Parameters for updating the banner record.
  const updateParams = {
    TableName,
    Key: {
      pKey: `BANNER#${bannerID}`,
      sKey: "BANNERS",
    },
    UpdateExpression: "SET isUploaded = :isUploaded, updatedAt = :updatedAt",
    ExpressionAttributeValues: {
      ":isUploaded": true,
      ":updatedAt": now,
    },
    ConditionExpression: "attribute_exists(pKey)",
  };

  // Parameters for deleting the banner record if an error occurs.
  const deleteParams = {
    TableName,
    Key: {
      pKey: `BANNER#${bannerID}`,
      sKey: "BANNERS",
    },
  };

  try {
    const result = await dynamoDB.query(queryParams).promise();
    if (!result.Items || result.Items.length === 0) {
      return {
        success: false,
        message: "Banner not found",
      };
    }
    const banner = result.Items[0];

    // Check if the S3 object exists using the stored path.
    const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: banner.path,
    };
    await s3.headObject(s3Params).promise();

    // Update the banner record to mark it as uploaded.
    await dynamoDB.update(updateParams).promise();

    return {
      success: true,
      message: "Banner uploaded successfully",
    };
  } catch (error) {
    // Attempt to delete the banner record if any error occurred.
    try {
      await dynamoDB.delete(deleteParams).promise();
    } catch (delError) {
      console.error("Error deleting banner record:", delError);
    }
    throw new Error(error.message);
  }
}

// Delete Banner from DynamoDB and S3
export async function deleteBanner({ bannerID, path }) {
  const TableName = `${process.env.AWS_DB_NAME}master`;
  const BucketName = process.env.AWS_BUCKET_NAME;

  // Parameters for S3 deletion.
  const s3Params = {
    Bucket: BucketName,
    Key: path,
  };

  // Parameters for deleting the banner record in DynamoDB.
  const bannerParams = {
    TableName,
    Key: {
      pKey: `BANNER#${bannerID}`,
      sKey: "BANNERS",
    },
  };

  try {
    await s3.deleteObject(s3Params).promise();
    await dynamoDB.delete(bannerParams).promise();
    return {
      success: true,
      message: "Banner deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting banner:", error);
    throw new Error(error.message);
  }
}
