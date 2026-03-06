import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  Stack,
  LinearProgress,
  Box,
} from "@mui/material";
import {
  Close,
  PlayCircleOutline,
  VideoLibraryOutlined,
} from "@mui/icons-material";
import { uploadingVideo } from "@/src/lib/uploadVideo";

export default function UploadVideoDialog({
  open,
  onClose,
  bankID,
  fetchCourse,
}) {
  const MAX_VIDEO_SIZE = 1024 * 1024 * 1024; // 1GB
  const videoInputRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const formatVideoSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    else if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    else return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const handleVideoChange = (e) => {
    const selectedVideo = e.target.files[0];
    if (selectedVideo) {
      if (selectedVideo.size > MAX_VIDEO_SIZE) {
        setError(
          `Video too large. Max limit is ${formatVideoSize(MAX_VIDEO_SIZE)}`
        );
        setVideo(null);
      } else {
        setError("");
        setVideo(selectedVideo);
        if (!title) {
          setTitle(selectedVideo.name);
        }
      }
    }
  };

  const handleUpload = async () => {
    if (!video) {
      setError("Please select a video");
      return;
    }
    if (!title.trim()) {
      setError("Video title is required");
      return;
    }

    setUploading(true);
    setError("");
    setStatusMessage("Initializing upload...");

    try {
      await uploadingVideo({
        video,
        title,
        setResponseMessage: setStatusMessage,
        setUploading,
        setProgressVariant: setProgress,
        bankID,
        onClose: handleClose,
        setTitle,
        setVideo,
        fetchCourse,
      });
    } catch (err) {
      setError("Upload failed. Please try again.");
      setUploading(false);
      setStatusMessage("");
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setVideo(null);
      setTitle("");
      setError("");
      setProgress(0);
      setStatusMessage("");
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "14px" } }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)" }}
      >
        <Stack direction="row" alignItems="center" gap="10px">
          <Stack
            sx={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "rgba(24, 113, 99, 0.08)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <PlayCircleOutline sx={{ fontSize: "16px", color: "var(--primary-color)" }} />
          </Stack>
          <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "var(--text1)" }}>
            Upload Video
          </Typography>
        </Stack>
        <IconButton onClick={handleClose} size="small" disabled={uploading}>
          <Close sx={{ fontSize: "18px" }} />
        </IconButton>
      </Stack>

      <DialogContent sx={{ padding: "20px" }}>
        <Stack gap="16px">
          {/* Drop zone */}
          <Box
            onClick={() => !uploading && videoInputRef.current.click()}
            sx={{
              border: "1.5px dashed",
              borderColor: video ? "var(--primary-color)" : "var(--border-color)",
              borderRadius: "10px",
              padding: "24px",
              textAlign: "center",
              cursor: uploading ? "default" : "pointer",
              backgroundColor: video ? "rgba(24, 113, 99, 0.02)" : "var(--bg-color)",
              "&:hover": {
                borderColor: uploading ? undefined : "var(--primary-color)",
                backgroundColor: uploading ? undefined : "rgba(24, 113, 99, 0.03)",
              },
            }}
          >
            <input
              type="file"
              accept="video/*"
              ref={videoInputRef}
              onChange={handleVideoChange}
              style={{ display: "none" }}
              disabled={uploading}
            />
            {video ? (
              <Stack alignItems="center" gap="6px">
                <VideoLibraryOutlined
                  sx={{ fontSize: 32, color: "var(--primary-color)" }}
                />
                <Typography
                  sx={{ fontWeight: 600, fontSize: "13px", maxWidth: "280px" }}
                  noWrap
                >
                  {video.name}
                </Typography>
                <Typography sx={{ fontSize: "11px", color: "var(--text4)" }}>
                  {formatVideoSize(video.size)}
                </Typography>
              </Stack>
            ) : (
              <Stack alignItems="center" gap="6px">
                <PlayCircleOutline sx={{ fontSize: 32, color: "var(--text4)" }} />
                <Typography sx={{ fontWeight: 600, fontSize: "13px", color: "var(--text2)" }}>
                  Click to browse
                </Typography>
                <Typography sx={{ fontSize: "11px", color: "var(--text4)" }}>
                  Max video size: {formatVideoSize(MAX_VIDEO_SIZE)}
                </Typography>
              </Stack>
            )}
          </Box>

          {/* Title */}
          <Stack gap="6px">
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "var(--text2)" }}>
              Video Title
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter video title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  fontSize: "13px",
                  backgroundColor: "var(--bg-color)",
                  "& fieldset": { border: "none" },
                },
              }}
            />
          </Stack>

          {/* Progress / Error */}
          {(uploading || error) && (
            <Stack gap="6px">
              {uploading && (
                <>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: "11px", color: "var(--text3)" }}>
                      {statusMessage}
                    </Typography>
                    <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "var(--text2)" }}>
                      {Math.round(progress)}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: "var(--border-color)",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "var(--primary-color)",
                        borderRadius: 2,
                      },
                    }}
                  />
                </>
              )}
              {error && (
                <Typography sx={{ fontSize: "11px", color: "var(--delete-color)" }}>
                  {error}
                </Typography>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ padding: "0 20px 16px", gap: "8px" }}>
        <Button
          onClick={handleClose}
          disabled={uploading}
          fullWidth
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            color: "var(--text2)",
            fontWeight: 600,
            fontSize: "13px",
            height: "36px",
            backgroundColor: "var(--bg-color)",
            "&:hover": { backgroundColor: "var(--border-color)" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={uploading || !video}
          fullWidth
          disableElevation
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            backgroundColor: "var(--primary-color)",
            fontWeight: 600,
            fontSize: "13px",
            height: "36px",
            "&:hover": { backgroundColor: "var(--primary-color-dark)" },
            "&.Mui-disabled": { backgroundColor: "#e0e0e0" },
          }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
