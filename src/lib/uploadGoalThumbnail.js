import { apiFetch } from "./apiFetch";
import axios from "axios";

export async function createGoalThumbnail({ file, goalID }) {
  return await apiFetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/create-thumb`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goalID,
        fileName: file.name,
        fileType: file.type,
      }),
    }
  );
}

export async function uploadGoalThumbnailToS3({
  file,
  fileData,
  setProgress,
  setResponseMessage,
  setUploading,
  setBannerPreview,
  onUploadSuccess,
}) {
  console.log(fileData.data.url);

  await axios.put(fileData.data.url, file, {
    headers: { "Content-Type": file.type },
    onUploadProgress: (progressEvent) => {
      console.log("Uploading banner...");

      const percent = (
        (progressEvent.loaded / progressEvent.total) *
        100
      ).toFixed(2);
      setResponseMessage(`Uploading ${percent}%`);
      setProgress(percent);
    },
  });
  setBannerPreview(fileData.data.bannerURL);
  setResponseMessage("Upload completed");
  setUploading(false);
  if (onUploadSuccess) onUploadSuccess(fileData.data.bannerURL);
}
