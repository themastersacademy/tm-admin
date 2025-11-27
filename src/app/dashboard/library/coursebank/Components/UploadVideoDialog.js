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
      PaperProps={{
        sx: {
          borderRadius: "16px",
          width: "100%",
          maxWidth: "450px",
          padding: "16px",
        },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          <PlayCircleOutline sx={{ color: "var(--primary-color)" }} />
          <Typography variant="h6" fontWeight={700} fontFamily="Lato">
            Upload Video
          </Typography>
        </Stack>
        <IconButton onClick={handleClose} size="small" disabled={uploading}>
          <Close fontSize="small" />
        </IconButton>
      </Stack>

      <DialogContent sx={{ padding: "8px 0 24px 0" }}>
        <Stack gap={3}>
          <Box
            onClick={() => !uploading && videoInputRef.current.click()}
            sx={{
              border: "2px dashed var(--border-color)",
              borderRadius: "12px",
              padding: "32px",
              textAlign: "center",
              cursor: uploading ? "default" : "pointer",
              backgroundColor: "var(--bg-color)",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: uploading
                  ? "var(--border-color)"
                  : "var(--primary-color)",
                backgroundColor: uploading
                  ? "var(--bg-color)"
                  : "rgba(33, 150, 243, 0.04)",
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
              <Stack alignItems="center" gap={1}>
                <VideoLibraryOutlined
                  sx={{ fontSize: 48, color: "var(--primary-color)" }}
                />
                <Typography fontWeight={600} noWrap maxWidth="300px">
                  {video.name}
                </Typography>
                <Typography fontSize="12px" color="var(--text2)">
                  {formatVideoSize(video.size)}
                </Typography>
              </Stack>
            ) : (
              <Stack alignItems="center" gap={1}>
                <PlayCircleOutline
                  sx={{ fontSize: 48, color: "var(--text3)" }}
                />
                <Typography fontWeight={600} color="var(--text2)">
                  Click to browse
                </Typography>
                <Typography fontSize="12px" color="var(--text3)">
                  Max video size: {formatVideoSize(MAX_VIDEO_SIZE)}
                </Typography>
              </Stack>
            )}
          </Box>

          <TextField
            fullWidth
            placeholder="Video Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
            InputProps={{
              sx: {
                borderRadius: "10px",
                backgroundColor: "var(--bg-color)",
                "& fieldset": { border: "none" },
              },
            }}
          />

          {(uploading || error || statusMessage) && (
            <Stack gap={1}>
              {uploading && (
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography fontSize="12px" color="var(--text2)">
                    {statusMessage}
                  </Typography>
                  <Typography fontSize="12px" fontWeight={600}>
                    {Math.round(progress)}%
                  </Typography>
                </Stack>
              )}
              {uploading && (
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "var(--border-color)",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "var(--primary-color)",
                      borderRadius: 3,
                    },
                  }}
                />
              )}
              {error && (
                <Typography fontSize="12px" color="var(--error-color)">
                  {error}
                </Typography>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ padding: 0, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={uploading}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            color: "var(--text2)",
            borderColor: "var(--border-color)",
            flex: 1,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={uploading || !video}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            backgroundColor: "var(--primary-color)",
            flex: 1,
            boxShadow: "none",
          }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
