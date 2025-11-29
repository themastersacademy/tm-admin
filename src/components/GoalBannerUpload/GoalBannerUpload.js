import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import {
  createGoalThumbnail,
  uploadGoalThumbnailToS3,
} from "@/src/lib/uploadGoalThumbnail";
import { apiFetch } from "@/src/lib/apiFetch";
import { CloudUpload, Delete } from "@mui/icons-material";

export default function GoalBannerUpload({
  goalID,
  bannerImage,
  onBannerChange,
}) {
  const { showSnackbar } = useSnackbar();
  const [thumbnail, setThumbnail] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [responseMessage, setResponseMessage] = useState("No file selected");
  const [bannerPreview, setBannerPreview] = useState(bannerImage || "");
  const thumbnailInputRef = useRef(null);
  const MAX_SIZE_MB = 5 * 1024 * 1024;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setBannerPreview(bannerImage || "");
  }, [bannerImage]);

  const handleThumbnailChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      if (selectedFile.size > MAX_SIZE_MB) {
        setResponseMessage("File size exceeds limit (Max: 5MB)");
        showSnackbar("File size exceeds limit (Max: 5MB)", "error", "", "3000");
        return;
      }
      setThumbnail(selectedFile);
      // Create local preview
      setBannerPreview(URL.createObjectURL(selectedFile));
    }
  };

  const triggerFileInput = () => {
    thumbnailInputRef.current.click();
  };

  const handleThumbnailUpload = async () => {
    if (!thumbnail) {
      showSnackbar("Select a banner image", "error", "", "3000");
      return;
    }

    setUploading(true);

    try {
      const fileData = await createGoalThumbnail({
        file: thumbnail,
        goalID: goalID,
      });

      await uploadGoalThumbnailToS3({
        file: thumbnail,
        fileData,
        setProgress,
        setResponseMessage,
        setUploading,
        setBannerPreview,
        onUploadSuccess: (url) => {
          if (onBannerChange) onBannerChange(url);
          setThumbnail(null);
        },
      });
    } catch (error) {
      setResponseMessage("Upload failed. Please try again.");
      showSnackbar("Upload failed", "error", "", "3000");
    }
    setUploading(false);
  };

  const handleDeleteThumbnail = () => {
    setIsLoading(true);
    try {
      apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/delete-thumb`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goalID: goalID,
        }),
      }).then((data) => {
        if (data.success) {
          setBannerPreview("");
          if (onBannerChange) onBannerChange("");
          showSnackbar("Banner deleted successfully", "success", "", "3000");
        } else {
          showSnackbar("Failed to delete banner", "error", "", "3000");
        }
        setIsLoading(false);
      });
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  return (
    <Stack gap="12px">
      <Typography
        sx={{
          fontFamily: "Lato",
          fontSize: "14px",
          fontWeight: 600,
          color: "var(--text2)",
        }}
      >
        Banner Image
      </Typography>
      <Stack
        justifyContent="center"
        alignItems="center"
        sx={{
          border: !bannerPreview ? "1px dashed var(--text4)" : "none",
          width: "100%",
          height: "160px",
          borderRadius: "10px",
          cursor: "pointer",
          backgroundColor: "var(--bg-color)",
          position: "relative",
          overflow: "hidden",
          backgroundImage: bannerPreview ? `url(${bannerPreview})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        onClick={!bannerPreview ? triggerFileInput : undefined}
      >
        {!bannerPreview && (
          <Stack alignItems="center" gap="8px">
            <CloudUpload sx={{ color: "var(--text4)", fontSize: "32px" }} />
            <Typography
              sx={{
                fontSize: "12px",
                color: "var(--text4)",
              }}
            >
              Click to upload banner
            </Typography>
            <Typography
              sx={{
                fontSize: "10px",
                color: "var(--text4)",
                textAlign: "center",
              }}
            >
              Recommended: 1200 x 400px • Max 5MB
            </Typography>
          </Stack>
        )}

        {uploading && (
          <Stack
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.7)",
            }}
          >
            <CircularProgress
              size={24}
              sx={{ color: "var(--primary-color)" }}
            />
            <Typography sx={{ fontSize: "12px", marginTop: "8px" }}>
              {responseMessage}
            </Typography>
          </Stack>
        )}
      </Stack>

      <input
        type="file"
        accept="image/*"
        ref={thumbnailInputRef}
        style={{ display: "none" }}
        onChange={handleThumbnailChange}
      />

      <Stack direction="row" gap="12px" justifyContent="flex-end">
        {thumbnail && !uploading && (
          <Button
            variant="contained"
            onClick={handleThumbnailUpload}
            size="small"
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
            }}
          >
            Upload
          </Button>
        )}

        {bannerPreview && !thumbnail && (
          <Button
            variant="outlined"
            color="error"
            onClick={handleDeleteThumbnail}
            startIcon={isLoading ? <CircularProgress size={16} /> : <Delete />}
            size="small"
            sx={{
              textTransform: "none",
            }}
            disabled={isLoading}
          >
            Remove Banner
          </Button>
        )}
        {bannerPreview && (
          <Button
            variant="outlined"
            onClick={triggerFileInput}
            size="small"
            sx={{
              textTransform: "none",
            }}
          >
            Change
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
