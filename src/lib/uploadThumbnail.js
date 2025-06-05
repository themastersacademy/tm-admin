import { apiFetch } from "./apiFetch";
import axios from "axios";

export async function createThumbnail({ file, courseID, goalID }) {
  return await apiFetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/courses/create-thumb`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseID,
        goalID,
        fileName: file.name,
        fileType: file.type,
      }),
    }
  );
}

export async function uploadThumbnailToS3({
  file,
  fileData,
  setProgress,
  setResponseMessage,
  setUploading,
  setProgressVariant,
  setCourse,
  thumbnailPreview,
  setThumbnailPreview,
}) {
  setProgressVariant("determinate");
  console.log(fileData.data.url);

  await axios.put(fileData.data.url, file, {
    headers: { "Content-Type": file.type },
    onUploadProgress: (progressEvent) => {
      console.log("Uploading thumbnail...");

      const percent = (
        (progressEvent.loaded / progressEvent.total) *
        100
      ).toFixed(2);
      setCourse((prev) => ({ ...prev, thumbnail: fileData.data.url }));
      setResponseMessage(`Uploading ${percent}%`);
      setProgress(percent);
    },
  });
  setThumbnailPreview(fileData.data.url);
  setCourse((prev) => ({ ...prev, thumbnail: thumbnailPreview}));
  setResponseMessage("Upload completed");
  setUploading(false);
}
