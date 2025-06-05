import { dynamoDB } from "../awsAgent";
import { randomUUID, createHash } from "crypto";

export async function createVideo({ title, bankID }) {
  let bankResponse;
  let videoCollectionID;
  let videoID;
  const bankParams = {
    TableName: `${process.env.AWS_DB_NAME}content`,
    Key: {
      pKey: `BANK#${bankID}`,
      sKey: `BANKS`,
    },
  };
  try {
    bankResponse = await dynamoDB.get(bankParams).promise();
    if (!bankResponse.Item) {
      return { success: false, message: "Bank not found" };
    }
    videoCollectionID = bankResponse.Item.videoCollectionID;
    videoID = await createBunnyVideo({ title, videoCollectionID });
    const resourceParams = {
      TableName: `${process.env.AWS_DB_NAME}content`,
      Item: {
        pKey: `RESOURCE#${randomUUID()}`,
        sKey: `RESOURCE@${bankID}`,
        type: "VIDEO",
        thumbnail: "",
        name: title,
        videoID,
        url: "",
        isUploaded: false,
        linkedLessons: [],
      },
    };
    await dynamoDB.put(resourceParams).promise();
    const { signature, expirationTime } = createSignature({ videoID });
    return {
      success: true,
      message: "Video created successfully",
      data: {
        resourceID: resourceParams.Item.pKey.split("#")[1],
        videoID,
        signature,
        expirationTime,
        libraryID: process.env.BUNNY_VIDEO_LIBRARY_ID,
      },
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    if (videoID) await deleteBunnyVideo(videoID);

    throw new Error("Internal server error");
  }
}

async function createBunnyVideo({ title, videoCollectionID }) {
  const response = await fetch(
    `https://video.bunnycdn.com/library/${process.env.BUNNY_VIDEO_LIBRARY_ID}/videos`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        AccessKey: process.env.BUNNY_API_KEY,
      },
      body: JSON.stringify({ title, collectionId: videoCollectionID }),
    }
  );
  const data = await response.json();
  return data.guid;
}

async function deleteBunnyVideo(videoID) {
  const response = await fetch(
    `https://video.bunnycdn.com/library/${process.env.BUNNY_VIDEO_LIBRARY_ID}/videos/${videoID}`,
    {
      method: "DELETE",
      headers: {
        accept: "application/json",
        AccessKey: process.env.BUNNY_API_KEY,
      },
    }
  );
  console.log(await response.json());
  return response.ok;
}

function createSignature({ videoID }) {
  const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;
  const stringToHash = `${process.env.BUNNY_VIDEO_LIBRARY_ID}${process.env.BUNNY_API_KEY}${expirationTime}${videoID}`;
  const signature = createHash("sha256").update(stringToHash).digest("hex");
  return { signature, expirationTime };
}

export async function verifyUpload({ resourceID, bankID, videoID }) {
  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${process.env.BUNNY_VIDEO_LIBRARY_ID}/videos/${videoID}`,
      {
        headers: {
          AccessKey: process.env.BUNNY_API_KEY,
        },
      }
    );
    const data = await response.json();
    //data.status === 0 means the video is Created
    //data.status === 1 means the video is uploaded
    //data.status === 2 means the video is Processing
    //data.status === 3 means the video is Transcoding
    //data.status === 4 means the video is Finished
    //data.status === 5 means the video is Error
    //data.status === 6 means the video is UploadFailed
    if (
      data.status === 1 ||
      data.status === 4 ||
      data.status === 3 ||
      data.status === 2
    ) {
      const params = {
        TableName: `${process.env.AWS_DB_NAME}content`,
        Key: {
          pKey: `RESOURCE#${resourceID}`,
          sKey: `RESOURCE@${bankID}`,
        },
        UpdateExpression: "SET isUploaded = :isUploaded",
        ExpressionAttributeValues: {
          ":isUploaded":
            data.status === 1 ||
            data.status === 4 ||
            data.status === 3 ||
            data.status === 2,
        },
      };
      await dynamoDB.update(params).promise();
      return {
        success: true,
        message: "Upload verified",
        data: { isUploaded: data.status === 1, videoStatus: data.status },
      };
    } else if (data.status === 5 || data.status === 6) {
      return {
        success: false,
        message: "Upload failed",
        data: { isUploaded: data.status === 1, videoStatus: data.status },
      };
    } else {
      return {
        success: false,
        message: "Upload not completed",
        data: { isUploaded: false, videoStatus: data.status },
      };
    }
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Internal server error");
  }
}
