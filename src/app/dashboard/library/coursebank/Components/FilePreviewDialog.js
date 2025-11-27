import React from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import { Close, Download } from "@mui/icons-material";

export default function FilePreviewDialog({
  open,
  onClose,
  fileUrl,
  fileName,
  filePath,
  onDownload,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          backgroundColor: "var(--bg-color)",
          maxHeight: "90vh",
        },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--border-color)",
          backgroundColor: "var(--white)",
        }}
      >
        <Typography variant="h6" fontWeight={700} noWrap>
          {fileName}
        </Typography>
        <Stack direction="row" gap={1}>
          {onDownload && (
            <IconButton onClick={onDownload}>
              <Download sx={{ color: "var(--text2)" }} />
            </IconButton>
          )}
          <IconButton onClick={onClose}>
            <Close sx={{ color: "var(--text2)" }} />
          </IconButton>
        </Stack>
      </Stack>

      <DialogContent
        sx={{
          padding: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "300px",
          backgroundColor: "#000",
        }}
      >
        {fileUrl ? (
          filePath?.match(/\.(mp4|webm|ogg)$/i) ? (
            <Box
              component="video"
              src={fileUrl}
              controls
              autoPlay
              sx={{
                maxWidth: "100%",
                maxHeight: "80vh",
                outline: "none",
              }}
            />
          ) : (
            <Box
              component="img"
              src={fileUrl}
              alt={fileName}
              sx={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />
          )
        ) : (
          <Typography color="white">No preview available</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
