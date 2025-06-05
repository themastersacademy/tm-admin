import { dynamoDB } from "../awsAgent";

export default async function deleteBank({ bankID }) {
  // 1. Check if the bank exists.
  const bankGetParams = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    Key: {
      pKey: `BANK#${bankID}`,
      sKey: `BANKS`,
    },
  };

  try {
    const bank = await dynamoDB.get(bankGetParams).promise();
    if (!bank.Item) {
      return {
        success: false,
        message: "Bank not found",
      };
    }

    // 2. Scan for resources associated with the bank.
    const resourceParams = {
      TableName: `${process.env.AWS_DB_NAME}content`,
      FilterExpression: "sKey = :skeyVal",
      ExpressionAttributeValues: {
        ":skeyVal": `RESOURCE@${bankID}`,
      },
    };

    const resources = await dynamoDB.scan(resourceParams).promise();
    console.log("Resources:", resources);
    if (resources.Items && resources.Items.length > 0) {
      return {
        success: false,
        message: "Bank has resources. Please delete them first",
      };
    }

    // 3. If available, delete the associated Bunny collection.
    if (bank.Item.videoCollectionID) {
      await deleteBunnyCollection({
        videoCollectionID: bank.Item.videoCollectionID,
      });
    }

    // 4. Delete the bank record.
    const deleteParams = {
      TableName: `${process.env.AWS_DB_NAME}content`,
      Key: {
        pKey: `BANK#${bankID}`,
        sKey: `BANKS`,
      },
    };

    await dynamoDB.delete(deleteParams).promise();

    return {
      success: true,
      message: "Bank deleted successfully",
    };
  } catch (error) {
    console.error("DynamoDB Error:", error);
    throw new Error("Internal server error");
  }
}

// Helper function that deletes a Bunny collection using async/await.
async function deleteBunnyCollection({ videoCollectionID }) {
  const url = `https://video.bunnycdn.com/library/${process.env.BUNNY_VIDEO_LIBRARY_ID}/collections/${videoCollectionID}`;
  const options = {
    method: "DELETE",
    headers: {
      accept: "application/json",
      AccessKey: process.env.BUNNY_API_KEY,
    },
  };

  try {
    const res = await fetch(url, options);
    const json = await res.json();
    console.log("Bunny Collection delete response:", json);
  } catch (err) {
    console.error("Error deleting Bunny collection:", err);
  }
}
