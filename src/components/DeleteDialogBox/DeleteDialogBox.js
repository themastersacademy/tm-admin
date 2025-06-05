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
} from "@mui/material";

function DeleteDialogBox({
  isOpen,
  actionButton,
  name,
  title,
  warning,
  isError,
}) {
  const displayWarning = warning || "This action cannot be undone";

  return (
    <Dialog
      open={isOpen}
      TransitionComponent={Slide}
      PaperProps={{ sx: { borderRadius: "15px", padding: "10px" } }}
      disableScrollLock
      sx={{
        "& .MuiDialog-paper": { width: "350px" },
      }}
    >
      <DialogTitle>
        <Stack alignItems="center" gap="10px">
          <Stack
            sx={{
              color: "var(--delete-color)",
              backgroundColor: "#FBF3F3",
              padding: "15px",
              borderRadius: "50px",
            }}
          >
            <RemoveCircleRoundedIcon />
          </Stack>
          <Typography sx={{ fontSize: "14px" }}>Delete {title}</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Typography
          sx={{
            textAlign: "center",
            fontFamily: "Lato",
            fontSize: "12px",
            fontWeight: "700",
            color: "var(--text4)",
          }}
        >
          {name}
        </Typography>
        <Typography
          sx={{
            textAlign: "center",
            fontFamily: "Lato",
            fontSize: "12px",
            mt: "10px",
            color: isError ? "var(--delete-color)" : "var(--text4)",
          }}
        >
          {displayWarning}
        </Typography>
      </DialogContent>
      <DialogActions>{actionButton}</DialogActions>
    </Dialog>
  );
}

export default memo(DeleteDialogBox);
