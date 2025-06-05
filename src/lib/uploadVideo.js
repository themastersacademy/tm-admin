import { apiFetch } from "./apiFetch";
import * as tus from "tus-js-client";

export async function createVideo({ title, bankID }) {
  const json = await apiFetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/resource/create-video`,
    {
      method: "POST",
      body: JSON.stringify({
        title: title,
        bankID: bankID,
      }),
      headers: { "Content-Type": "application/json" },
    }
  );
  return json;
}

export async function verifyVideo({
  resourceID,
  videoID,
  bankID,
  setResponseMessage,
  setUploading,
  setProgressVariant,
}) {
  setResponseMessage("Verifying Video..");
  setProgressVariant("indeterminate");

  try {
    const data = await apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/resource/verify-video`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceID,
          videoID,
          bankID,
        }),
      }
    );
    setResponseMessage("Video Verified");
    setUploading(false);
  } catch (error) {
    setResponseMessage("Error verifying Video");
  }
}

export async function uploadingVideo({
  video,
  setResponseMessage,
  setUploading,
  bankID,
  title,
  setProgressVariant,
  onClose,
  setTitle,
  setVideo,
  fetchCourse
}) {
  setProgressVariant(0);

  try {
    const json = await createVideo({ title, bankID });

    setResponseMessage(`Uploading.. %`);

    const upload = new tus.Upload(video, {
      endpoint: "https://video.bunnycdn.com/tusupload",
      retryDelays: [0, 3000, 5000, 10000, 20000, 60000, 60000],
      headers: {
        AuthorizationSignature: json.data.signature, // SHA256 signature (server-side generated)
        AuthorizationExpire: json.data.expirationTime, // Expiration time (Unix timestamp)
        VideoId: json.data.videoID, // Video GUID
        LibraryId: json.data.libraryID, // Your Bunny.net library ID
      },
      metadata: {
        filetype: video.type,
        title: title,
        videoId: json.data.videoID,
        collection: "collectionID",
      },
      onError: function (error) {
        setUploading(false);
        setResponseMessage("Error: " + error.message);
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        const progress = Math.round((bytesUploaded / bytesTotal) * 100);
        setResponseMessage(`Uploading ${progress} %`);
        setProgressVariant(progress);
      },
      onSuccess: async () => {
        setResponseMessage("Verifying Video");
        setProgressVariant(100);
        await verifyVideo({
          resourceID: json.data.resourceID,
          videoID: json.data.videoID,
          bankID,
          setResponseMessage,
          setProgressVariant,
          setUploading,
        });
        setUploading(false);
        setResponseMessage("Upload complete!");
        onClose();
        setTitle("");
        setVideo(null);
        setProgressVariant(0);
        setResponseMessage("No file selected");
        fetchCourse();
      },
    });

    upload.findPreviousUploads().then(function (previousUploads) {
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }
      upload.start();
    });
  } catch (error) {
    setResponseMessage(error.message);
    throw error;
  }
}
