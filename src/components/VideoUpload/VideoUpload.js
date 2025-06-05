"use client";
import {
  Button,
  DialogContent,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import DialogBox from "../DialogBox/DialogBox";
import { Close, East } from "@mui/icons-material";
import StyledTextField from "../StyledTextField/StyledTextField";
import { useRef, useState } from "react";
import { createVideo, uploadingVideo } from "@/src/lib/uploadVideo";

export default function VideoUpload({ isOpen, onClose, bankID,fetchCourse }) {
  const MAX_VIDEO_SIZE = 1024 * 1024 * 1024;
  const videoInputRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [title, setTitle] = useState("");
  const [isVideoSizeExceed, setIsVideoSizeExceed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("No file selected");
  const [progressVariant, setProgressVariant] = useState("determinate");

  function formatVideoSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    else if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    else return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  const handleVideoChange = (e) => {
    const selectedVideo = e.target.files[0];
    const videoSizeDisplay = formatVideoSize(selectedVideo.size);
    if (selectedVideo) {
      if (selectedVideo.size > MAX_VIDEO_SIZE) {
        setIsVideoSizeExceed(true);
        setVideo(selectedVideo);
        setResponseMessage(
          `Video Size ${videoSizeDisplay}. Max limit is ${formatVideoSize(
            MAX_VIDEO_SIZE
          )}`
        );
      } else {
        setIsVideoSizeExceed(false);
        setVideo(selectedVideo);
        setResponseMessage(`Video size ${videoSizeDisplay}. Ready to upload.`);
      }
    }
  };

  const triggerVideoInput = () => {
    videoInputRef.current.click();
  };

  const handleUpload = async () => {
    if (!video && !title) {
      setResponseMessage("Please select a video to upload");
      return;
    }
    setUploading(true);
    setResponseMessage("Creating Video");

    try {
      setResponseMessage("Preparing for upload");
      await uploadingVideo({
        video,
        title,
        setResponseMessage,
        setUploading,
        setProgressVariant: setProgress,
        bankID,
        onClose,
        setTitle,
        setVideo,
        fetchCourse
      });
    } catch (error) {
      setResponseMessage("Upload failed. Please try again.");
      setUploading(false);
    }
  };

  return (
    <DialogBox
      isOpen={isOpen}
      icon={
        <IconButton
          onClick={() => {
            setVideo(null);
            setResponseMessage("No file Selected");
            onClose();
          }}
          sx={{ borderRadius: "10px", padding: "6px" }}
          disabled={uploading}
        >
          <Close sx={{color:"var(--text2)"}} />
        </IconButton>
      }
      title="Add Video"
      actionButton={
        <Button
          variant="text"
          endIcon={<East />}
          onClick={handleUpload}
          sx={{ textTransform: "none", color: "var(--primary-color)" }}
          disabled={isVideoSizeExceed || uploading || !video}
        >
          Upload
        </Button>
      }
    >
      <DialogContent>
        <Stack gap="15px">
          <StyledTextField
            placeholder="Enter Video title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />
          <Stack
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              width: "100%",
              height: "40px",
              border: "1px solid var(--border-color)",
              borderRadius: "4px",
              padding: "8px",
            }}
          >
            <input
              type="file"
              accept="video/*"
              ref={videoInputRef}
              onChange={handleVideoChange}
              style={{ visibility: "hidden", position: "absolute" }}
            />
            {video ? (
              <Typography>{video.name}</Typography>
            ) : (
              <Typography>Select Video</Typography>
            )}
            <Button
              variant="contained"
              sx={{
                backgroundColor: "var(--primary-color)",
                height: "30px",
                minWidth: "130px",
                textTransform: "none",
                marginLeft: "auto",
              }}
              onClick={triggerVideoInput}
            >
              Choose Video
            </Button>
          </Stack>
          {!uploading && (
            <Typography
              color={isVideoSizeExceed ? "error" : ""}
              sx={{ fontSize: "12px" }}
            >
              {responseMessage}
            </Typography>
          )}
          {uploading && (
            <Stack gap={1}>
              <LinearProgress
                variant={progressVariant}
                value={progress}
                sx={{
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "var(--sec-color)",
                  },
                  backgroundColor: "var(--sec-color-acc-2)",
                }}
              />
              <Typography fontSize={14}>{responseMessage}</Typography>
            </Stack>
          )}
        </Stack>
      </DialogContent>
    </DialogBox>
  );
}
