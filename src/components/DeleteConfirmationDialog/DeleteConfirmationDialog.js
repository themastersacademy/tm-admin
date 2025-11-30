import React from "react";
import {
  Dialog,
  DialogContent,
  Stack,
  Typography,
  Button,
  IconButton,
  Fade,
  CircularProgress,
  Box,
} from "@mui/material";
import { Close, WarningAmber, DeleteOutline } from "@mui/icons-material";

export default function DeleteConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title = "Delete Item",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  isLoading,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 24px 48px rgba(0,0,0,0.1)",
        },
      }}
      TransitionComponent={Fade}
      transitionDuration={400}
    >
      <Box
        sx={{
          background: "linear-gradient(135deg, #FFEBEE 0%, #FFFFFF 100%)",
          padding: "24px",
          borderBottom: "1px solid rgba(244, 67, 54, 0.1)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: "16px",
            top: "16px",
            color: "var(--text3)",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
          }}
        >
          <Close />
        </IconButton>

        <Stack
          sx={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "#FFEBEE",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <WarningAmber sx={{ fontSize: "32px", color: "#D32F2F" }} />
        </Stack>

        <Stack alignItems="center" gap="8px">
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#D32F2F",
              fontFamily: "Lato",
              textAlign: "center",
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              color: "var(--text3)",
              textAlign: "center",
              maxWidth: "280px",
            }}
          >
            {description}
          </Typography>
        </Stack>
      </Box>

      <DialogContent sx={{ padding: "24px" }}>
        <Stack direction="row" gap="12px">
          <Button
            fullWidth
            onClick={onClose}
            sx={{
              height: "48px",
              borderRadius: "12px",
              color: "var(--text2)",
              fontWeight: 600,
              fontSize: "15px",
              textTransform: "none",
              backgroundColor: "var(--bg-color)",
              "&:hover": { backgroundColor: "var(--border-color)" },
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={onConfirm}
            disabled={isLoading}
            sx={{
              height: "48px",
              borderRadius: "12px",
              background: "#D32F2F",
              fontWeight: 700,
              fontSize: "15px",
              textTransform: "none",
              boxShadow: "0 8px 20px rgba(211, 47, 47, 0.25)",
              "&:hover": {
                background: "#C62828",
                boxShadow: "0 12px 24px rgba(211, 47, 47, 0.35)",
              },
              "&.Mui-disabled": {
                background: "#e0e0e0",
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              <Stack direction="row" alignItems="center" gap="8px">
                <span>Delete</span>
                <DeleteOutline sx={{ fontSize: "20px" }} />
              </Stack>
            )}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
