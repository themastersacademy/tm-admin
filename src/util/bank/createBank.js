import { dynamoDB } from "../awsAgent";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

export default async function createBank({ title }) {
  const bankID = `BANK#${randomUUID()}`;
  const params = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    Item: {
      pKey: bankID,
      sKey: `BANKS`,
      "GSI1-pKey": `BANKS`,
      "GSI1-sKey": bankID,
      title,
      videoCollectionID: await createVideoCollection({ name: title }),
      resources: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  try {
    await dynamoDB.send(new PutCommand(params));
    return {
      success: true,
      message: "Bank created successfully",
      data: {
        bankID: params.Item.pKey.split("#")[1],
        videoCollectionID: params.Item.videoCollectionID,
      },
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    await deleteVideoCollection({
      videoCollectionID: params.Item.videoCollectionID,
    });
    throw new Error("Internal server error");
  }
}

function createVideoCollection({ name }) {
  const url = `https://video.bunnycdn.com/library/${process.env.BUNNY_VIDEO_LIBRARY_ID}/collections`;
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      AccessKey: process.env.BUNNY_API_KEY,
    },
    body: JSON.stringify({ name }),
  };

  return fetch(url, options)
    .then((res) => res.json())
    .then((json) => json.guid);
}

async function deleteVideoCollection({ videoCollectionID }) {
  const url = `https://video.bunnycdn.com/library/${process.env.BUNNY_VIDEO_LIBRARY_ID}/collections/${videoCollectionID}`;
  const options = {
    method: "DELETE",
    headers: {
      accept: "application/json",
      AccessKey: process.env.BUNNY_API_KEY,
    },
  };
  fetch(url, options)
    .then((res) => res.json())
    .catch((err) => console.error(err));
}
