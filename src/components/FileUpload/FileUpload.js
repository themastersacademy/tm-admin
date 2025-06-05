"use client";
import {
  Button,
  DialogContent,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import StyledTextField from "../StyledTextField/StyledTextField";
import { useState, useRef } from "react";
import DialogBox from "../DialogBox/DialogBox";
import { Close, East } from "@mui/icons-material";
import { createFile, uploadToS3 } from "@/src/lib/uploadFile";

export default function FileUpload({ isOpen, onClose, bankID, fetchCourse }) {
  const MAX_FILE_SIZE =
    Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_FILE_SIZE_MB) * 1024 * 1024;
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [isFileSizeExceed, setIsFileSizeExceed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("No file selected");
  const [progressVariant, setProgressVariant] = useState("indeterminate");

  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    else if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    else return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const fileSizeDisplay = formatFileSize(selectedFile.size);

    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setIsFileSizeExceed(true);
        setFile(selectedFile);
        setResponseMessage(
          `File size ${fileSizeDisplay}. Max limit is ${formatFileSize(
            MAX_FILE_SIZE
          )}`
        );
      } else {
        setIsFileSizeExceed(false);
        setFile(selectedFile);
        setResponseMessage(`File size ${fileSizeDisplay}. Ready to upload.`);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async () => {
    if (!file && !title) {
      setResponseMessage("Please select a file to upload.");
      return;
    }
    setUploading(true);
    setResponseMessage("Creating File");

    try {
      const fileData = await createFile({ file, title, bankID });
      setResponseMessage("Preparing for upload");
      await uploadToS3({
        file,
        setProgress,
        setResponseMessage,
        fileData,
        setUploading,
        setProgressVariant,
        onClose,
        setFile,
        fetchCourse,
        setTitle
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
            setFile(null);
            setResponseMessage("No file selected");
            onClose();
          }}
          sx={{ borderRadius: "10px", padding: "6px" }}
          disabled={uploading}
        >
          <Close sx={{ color: "var(--text2)" }} />
        </IconButton>
      }
      title="Add File"
      actionButton={
        <Button
          variant="text"
          endIcon={<East />}
          onClick={handleUpload}
          sx={{ textTransform: "none", color: "var(--primary-color)" }}
          disabled={isFileSizeExceed || uploading || !file}
        >
          Upload
        </Button>
      }
    >
      <DialogContent>
        <Stack gap="15px">
          <StyledTextField
            placeholder="Enter File title"
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
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ visibility: "hidden", position: "absolute" }}
            />
            {file ? (
              <Typography>{file.name}</Typography>
            ) : (
              <Typography>Select File</Typography>
            )}
            <Button
              variant="contained"
              sx={{
                backgroundColor: "var(--primary-color)",
                height: "30px",
                textTransform: "none",
                marginLeft: "auto",
                minWidth: "130px",
              }}
              onClick={triggerFileInput}
            >
              Choose File
            </Button>
          </Stack>
          {!uploading && (
            <Typography
              color={isFileSizeExceed ? "error" : ""}
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
