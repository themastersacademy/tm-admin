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
  CircularProgress,
  LinearProgress,
  Box,
} from "@mui/material";
import {
  Close,
  CloudUpload,
  InsertDriveFileOutlined,
  CheckCircle,
} from "@mui/icons-material";
import { createFile, uploadToS3 } from "@/src/lib/uploadFile";

export default function UploadFileDialog({
  open,
  onClose,
  bankID,
  fetchCourse,
}) {
  const MAX_FILE_SIZE =
    Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_FILE_SIZE_MB) * 1024 * 1024;
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [progressVariant, setProgressVariant] = useState("indeterminate");

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    else if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    else return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError(
          `File too large. Max limit is ${formatFileSize(MAX_FILE_SIZE)}`
        );
        setFile(null);
      } else {
        setError("");
        setFile(selectedFile);
        if (!title) {
          setTitle(selectedFile.name);
        }
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }
    if (!title.trim()) {
      setError("File title is required");
      return;
    }

    setUploading(true);
    setError("");
    setStatusMessage("Initializing upload...");

    try {
      const fileData = await createFile({ file, title, bankID });
      setStatusMessage("Uploading to server...");

      await uploadToS3({
        file,
        setProgress,
        setResponseMessage: setStatusMessage,
        fileData,
        setUploading,
        setProgressVariant,
        onClose: handleClose,
        setFile,
        fetchCourse,
        setTitle,
      });
    } catch (err) {
      setError("Upload failed. Please try again.");
      setUploading(false);
      setStatusMessage("");
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
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
          <CloudUpload sx={{ color: "var(--primary-color)" }} />
          <Typography variant="h6" fontWeight={700} fontFamily="Lato">
            Upload File
          </Typography>
        </Stack>
        <IconButton onClick={handleClose} size="small" disabled={uploading}>
          <Close fontSize="small" />
        </IconButton>
      </Stack>

      <DialogContent sx={{ padding: "8px 0 24px 0" }}>
        <Stack gap={3}>
          <Box
            onClick={() => !uploading && fileInputRef.current.click()}
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
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              disabled={uploading}
            />
            {file ? (
              <Stack alignItems="center" gap={1}>
                <InsertDriveFileOutlined
                  sx={{ fontSize: 48, color: "var(--primary-color)" }}
                />
                <Typography fontWeight={600} noWrap maxWidth="300px">
                  {file.name}
                </Typography>
                <Typography fontSize="12px" color="var(--text2)">
                  {formatFileSize(file.size)}
                </Typography>
              </Stack>
            ) : (
              <Stack alignItems="center" gap={1}>
                <CloudUpload sx={{ fontSize: 48, color: "var(--text3)" }} />
                <Typography fontWeight={600} color="var(--text2)">
                  Click to browse
                </Typography>
                <Typography fontSize="12px" color="var(--text3)">
                  Max file size: {formatFileSize(MAX_FILE_SIZE)}
                </Typography>
              </Stack>
            )}
          </Box>

          <TextField
            fullWidth
            placeholder="File Title"
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
                  variant={progressVariant}
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
          disabled={uploading || !file}
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
