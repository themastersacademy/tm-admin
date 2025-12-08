import React from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import { Close, Fullscreen } from "@mui/icons-material";

export default function StreamVideoDialog({
  open,
  onClose,
  videoUrl,
  videoTitle,
  videoDate,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          backgroundColor: "#0a0a0a",
          maxHeight: "95vh",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          background:
            "linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.1) 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Stack gap={1}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              color: "#fff",
              fontFamily: "Lato",
              fontSize: "18px",
            }}
          >
            {videoTitle || "Video Preview"}
          </Typography>
          <Stack direction="row" gap={1} alignItems="center">
            <Chip
              label="Streaming"
              size="small"
              sx={{
                height: "24px",
                fontSize: "11px",
                fontWeight: 600,
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                color: "#ef4444",
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            />
            {videoDate && (
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {new Date(videoDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Typography>
            )}
          </Stack>
        </Stack>
        <IconButton
          onClick={onClose}
          sx={{
            color: "rgba(255,255,255,0.8)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          <Close />
        </IconButton>
      </Stack>

      {/* Video Player */}
      <DialogContent
        sx={{
          padding: 0,
          backgroundColor: "#000",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          position: "relative",
        }}
      >
        {videoUrl ? (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
              minHeight: "60vh",
            }}
          >
            <iframe
              src={videoUrl}
              loading="lazy"
              style={{
                border: "none",
                position: "absolute",
                minHeight: "100%",
                minWidth: "100%",
                objectFit: "cover",
                backgroundColor: "black",
              }}
              allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
              allowFullScreen
            />
          </Box>
        ) : (
          <Typography color="rgba(255,255,255,0.5)">
            No video available
          </Typography>
        )}
      </DialogContent>

      {/* Footer */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          padding: "16px 24px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          background:
            "linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(59,130,246,0.05) 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Stack direction="row" gap={2} alignItems="center">
          <Typography
            sx={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.7)",
              fontWeight: 500,
            }}
          >
            Powered by Bunny.net CDN
          </Typography>
        </Stack>
        <Typography
          sx={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          Press ESC to close
        </Typography>
      </Stack>
    </Dialog>
  );
}
