import { apiFetch } from "./apiFetch";
import axios from "axios";

export async function createBanner({ file, title }) {
  const json = await apiFetch("/api/banner", {
    method: "POST",
    body: JSON.stringify({
      title: title,
      fileName: file.name,
      fileType: file.type,
    }),
    headers: { "Content-Type": "application/json" },
  });
  return json;
}

export async function uploadToS3({
  file,
  setProgress,
  setResponseMessage,
  bannerData,
  setUploading,
  setProgressVariant,
  onClose,
  setTitle,
  setFile,
  fetchBanners,
  showSnackbar,
}) {
  setProgressVariant("determinate");
  try {
    await axios.put(bannerData.data.signedUrl, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (progressEvent) => {
        console.log("Uploading...");
        const percent = (
          (progressEvent.loaded / progressEvent.total) *
          100
        ).toFixed(2);
        setResponseMessage(`Uploading ${percent}%`);
        setProgress(percent);
      },
    });
    setResponseMessage("Upload completed");

    // Add a slight delay to ensure S3 object is available
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await verifyBanner(
      bannerData.data.bannerID,
      setResponseMessage,
      setUploading,
      setProgressVariant,
      onClose,
      setFile,
      fetchBanners,
      setTitle,
      showSnackbar
    );
  } catch (error) {
    setResponseMessage(`Upload failed: ${error.message}`);
    setUploading(false);
    showSnackbar(`Upload failed: ${error.message}`, "error", "", "3000");
  }
}

async function verifyBanner(
  bannerID,
  setResponseMessage,
  setUploading,
  setProgressVariant,
  onClose,
  setFile,
  fetchBanners,
  setTitle,
  showSnackbar
) {
  setProgressVariant("indeterminate");
  setResponseMessage("Verifying Banner...");

  try {
    const data = await apiFetch("/api/banner", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bannerID,
      }),
    });

    if (data.success) {
      setResponseMessage("Banner verified");
      showSnackbar("Banner uploaded successfully", "success", "", "3000");
      setUploading(false);
      setFile(null);
      setTitle("");
      setResponseMessage("No file selected");
      onClose();
      fetchBanners();
    } else {
      setResponseMessage(`Verification failed: ${data.message}`);
      setUploading(false);
      showSnackbar(`Verification failed: ${data.message}`, "error", "", "3000");
    }
  } catch (error) {
    setResponseMessage(`Error verifying banner: ${error.message}`);
    setUploading(false);
    showSnackbar(`Error verifying banner: ${error.message}`, "error", "", "3000");
  }
}