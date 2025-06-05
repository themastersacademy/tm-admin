import { apiFetch } from "./apiFetch";
import axios from "axios";

export async function createFile({ file, title, bankID }) {
  const json = await apiFetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/resource/create-file`,
    {
      method: "POST",
      body: JSON.stringify({
        title: title,
        fileName: file.name,
        fileType: file.type,
        bankID: bankID,
      }),
      headers: { "Content-Type": "application/json" },
    }
  );
  return json;
}

export async function uploadToS3({
  file,
  setProgress,
  setResponseMessage,
  fileData,
  setUploading,
  setProgressVariant,
  onClose,
  setTitle,
  setFile,
  fetchCourse,
}) {
  setProgressVariant("determinate");
  await axios.put(fileData.data.url, file, {
    headers: { "Content-Type": file.type },
    onUploadProgress: (progressEvent) => {
      console.log("uploading...");
      const percent = (
        (progressEvent.loaded / progressEvent.total) *
        100
      ).toFixed(2);
      setResponseMessage(`Uploading ${percent}%`);
      setProgress(percent);
    },
  });
  setResponseMessage("Upload completed");
  await verifyFile(
    fileData.data.resourceID,
    setResponseMessage,
    setUploading,
    setProgressVariant,
    fileData.data.path
  );
  setFile(null);
  setResponseMessage("No file selected");
  onClose();
  fetchCourse();
  setTitle("");
  return;
}

async function verifyFile(
  resourceID,
  setResponseMessage,
  setUploading,
  setProgressVariant,
  path
) {
  setProgressVariant("indeterminate");
  setResponseMessage("Verifying File...");

  try {
    await apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/resource/verify-file`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceID,
          path,
        }),
      }
    ).then((data) => {
      if (data.success) {
        setResponseMessage("File verified");
        setUploading(false);
      }
    });
  } catch (error) {
    setResponseMessage("Error verifying file.");
  }
}
