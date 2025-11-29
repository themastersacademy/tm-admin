"use client";
import React, { memo } from "react";
import RemoveCircleRoundedIcon from "@mui/icons-material/RemoveCircleRounded";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
  Typography,
  Button,
} from "@mui/material";

function DeleteDialogBox({
  isOpen,
  onClose,
  onDelete,
  loading,
  actionButton,
  name,
  title,
  warning,
  isError,
  children,
}) {
  const displayWarning = warning || "This action cannot be undone";

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      TransitionComponent={Slide}
      PaperProps={{ sx: { borderRadius: "16px", padding: "12px" } }}
      disableScrollLock
      sx={{
        "& .MuiDialog-paper": { width: "400px", maxWidth: "90%" },
      }}
    >
      <DialogTitle sx={{ padding: "16px 24px 0 24px" }}>
        <Stack alignItems="center" gap="16px">
          <Stack
            sx={{
              color: "#D32F2F",
              backgroundColor: "#FFEBEE",
              padding: "16px",
              borderRadius: "50%",
              width: "64px",
              height: "64px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RemoveCircleRoundedIcon sx={{ fontSize: "32px" }} />
          </Stack>
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text1)",
              fontFamily: "Lato",
            }}
          >
            Delete {title || "Item"}?
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ padding: "12px 24px 24px 24px" }}>
        {children ? (
          children
        ) : (
          <Stack gap="8px">
            {name && (
              <Typography
                sx={{
                  textAlign: "center",
                  fontFamily: "Lato",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "var(--text1)",
                }}
              >
                {name}
              </Typography>
            )}
            <Typography
              sx={{
                textAlign: "center",
                fontFamily: "Lato",
                fontSize: "14px",
                color: isError ? "#D32F2F" : "var(--text3)",
                lineHeight: 1.5,
              }}
            >
              {displayWarning}
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          padding: "0 24px 24px 24px",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        {actionButton ? (
          actionButton
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={loading}
              sx={{
                flex: 1,
                textTransform: "none",
                borderRadius: "10px",
                padding: "10px 0",
                fontWeight: 600,
                fontSize: "14px",
                borderColor: "var(--border-color)",
                color: "var(--text2)",
                "&:hover": {
                  borderColor: "var(--text3)",
                  backgroundColor: "rgba(0,0,0,0.02)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={onDelete}
              disabled={loading}
              sx={{
                flex: 1,
                background: "linear-gradient(135deg, #FF5252 0%, #D32F2F 100%)",
                color: "#FFFFFF",
                textTransform: "none",
                borderRadius: "10px",
                padding: "10px 0",
                fontWeight: 600,
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(211, 47, 47, 0.25)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #FF1744 0%, #C62828 100%)",
                  boxShadow: "0 6px 16px rgba(211, 47, 47, 0.35)",
                },
                "&:disabled": {
                  backgroundColor: "var(--text3)",
                  color: "var(--white)",
                  opacity: 0.5,
                },
              }}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default memo(DeleteDialogBox);
