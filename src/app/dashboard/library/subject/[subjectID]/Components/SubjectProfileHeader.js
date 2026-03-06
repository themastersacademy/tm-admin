"use client";
import {
  Stack,
  Typography,
  Button,
  Chip,
  IconButton,
  Skeleton,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { ArrowBack, Delete, Edit, Book } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function SubjectProfileHeader({
  subject,
  isLoading,
  onRename,
  onDelete,
  isDeleting,
}) {
  const router = useRouter();
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(subject?.title || "");

  const handleRenameClick = () => {
    setNewTitle(subject?.title || "");
    setIsRenameDialogOpen(true);
  };

  const handleRenameSubmit = () => {
    onRename(newTitle);
    setIsRenameDialogOpen(false);
  };

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          backgroundColor: "var(--white)",
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          padding: "12px 16px",
        }}
      >
        {/* Left: Back + Subject Info */}
        <Stack direction="row" alignItems="center" gap="10px">
          <IconButton
            onClick={() => router.back()}
            size="small"
            sx={{
              width: "30px",
              height: "30px",
              border: "1px solid var(--border-color)",
              "&:hover": {
                backgroundColor: "var(--bg-color)",
                borderColor: "var(--primary-color)",
              },
            }}
          >
            <ArrowBack sx={{ fontSize: "16px", color: "var(--text3)" }} />
          </IconButton>
          <Stack
            sx={{
              width: "32px",
              height: "32px",
              backgroundColor: "rgba(24, 113, 99, 0.08)",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Book sx={{ fontSize: "17px", color: "var(--primary-color)" }} />
          </Stack>
          {isLoading ? (
            <Skeleton variant="text" width={160} height={22} />
          ) : (
            <>
              <Typography
                sx={{ fontSize: "15px", fontWeight: 700, color: "var(--text1)" }}
              >
                {subject?.title || "Subject Title"}
              </Typography>
              <Chip
                label={`ID: ${subject?.id?.slice(0, 8) || "N/A"}`}
                size="small"
                sx={{
                  backgroundColor: "var(--bg-color)",
                  color: "var(--text4)",
                  fontWeight: 600,
                  fontSize: "10px",
                  height: "20px",
                  borderRadius: "4px",
                }}
              />
            </>
          )}
        </Stack>

        {/* Right: Actions */}
        <Stack direction="row" gap="8px">
          <Button
            variant="outlined"
            startIcon={<Edit sx={{ fontSize: "14px" }} />}
            onClick={handleRenameClick}
            disableElevation
            sx={{
              border: "1px solid var(--border-color)",
              color: "var(--text2)",
              textTransform: "none",
              borderRadius: "8px",
              padding: "5px 14px",
              fontWeight: 600,
              fontSize: "12px",
              height: "34px",
              "&:hover": {
                borderColor: "var(--primary-color)",
                backgroundColor: "rgba(24, 113, 99, 0.04)",
              },
            }}
          >
            Rename
          </Button>
          <Button
            variant="contained"
            startIcon={<Delete sx={{ fontSize: "14px" }} />}
            onClick={() => setIsDeleteDialogOpen(true)}
            disableElevation
            sx={{
              backgroundColor: "var(--delete-color)",
              color: "#fff",
              textTransform: "none",
              borderRadius: "8px",
              padding: "5px 14px",
              fontWeight: 600,
              fontSize: "12px",
              height: "34px",
              "&:hover": { backgroundColor: "#d32f2f" },
            }}
          >
            Delete
          </Button>
        </Stack>
      </Stack>

      {/* Rename Dialog */}
      <Dialog
        open={isRenameDialogOpen}
        onClose={() => setIsRenameDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "14px" } }}
      >
        <DialogContent sx={{ padding: "20px" }}>
          <Stack gap="14px">
            <Typography
              sx={{ fontSize: "15px", fontWeight: 700, color: "var(--text1)" }}
            >
              Rename Subject
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter new subject title"
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
        </DialogContent>
        <DialogActions sx={{ padding: "0 20px 16px", gap: "8px" }}>
          <Button
            onClick={() => setIsRenameDialogOpen(false)}
            fullWidth
            sx={{
              textTransform: "none",
              color: "var(--text2)",
              fontWeight: 600,
              height: "36px",
              borderRadius: "8px",
              fontSize: "13px",
              backgroundColor: "var(--bg-color)",
              "&:hover": { backgroundColor: "var(--border-color)" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRenameSubmit}
            variant="contained"
            fullWidth
            disableElevation
            sx={{
              textTransform: "none",
              backgroundColor: "var(--primary-color)",
              fontWeight: 600,
              height: "36px",
              borderRadius: "8px",
              fontSize: "13px",
              "&:hover": { backgroundColor: "var(--primary-color-dark)" },
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => !isDeleting && setIsDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "14px" } }}
      >
        <DialogContent sx={{ padding: "20px" }}>
          <Stack gap="12px">
            <Typography
              sx={{ fontSize: "15px", fontWeight: 700, color: "var(--text1)" }}
            >
              Delete Subject?
            </Typography>
            <Typography
              sx={{ fontSize: "13px", color: "var(--text3)", lineHeight: 1.5 }}
            >
              Are you sure you want to permanently delete{" "}
              <strong>{subject?.title}</strong>? This action cannot be undone.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ padding: "0 20px 16px", gap: "8px" }}>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isDeleting}
            fullWidth
            sx={{
              textTransform: "none",
              color: "var(--text2)",
              fontWeight: 600,
              height: "36px",
              borderRadius: "8px",
              fontSize: "13px",
              backgroundColor: "var(--bg-color)",
              "&:hover": { backgroundColor: "var(--border-color)" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={onDelete}
            disabled={isDeleting}
            variant="contained"
            fullWidth
            disableElevation
            sx={{
              textTransform: "none",
              backgroundColor: "var(--delete-color)",
              fontWeight: 600,
              height: "36px",
              borderRadius: "8px",
              fontSize: "13px",
              "&:hover": { backgroundColor: "#d32f2f" },
            }}
          >
            {isDeleting ? "Deleting..." : "Delete Subject"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
