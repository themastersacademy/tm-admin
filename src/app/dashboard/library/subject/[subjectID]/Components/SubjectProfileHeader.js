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
import {
  ArrowBack,
  Delete,
  Edit,
  Book,
  CheckCircle,
  Warning,
  ErrorOutline,
  Save,
} from "@mui/icons-material";
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
        sx={{
          backgroundColor: "var(--white)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {/* Top Bar */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          padding="20px 24px"
          sx={{
            borderBottom: "1px solid var(--border-color)",
            background: "linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)",
          }}
        >
          {/* Left: Back Button + Subject Info */}
          <Stack direction="row" alignItems="center" gap="16px">
            <IconButton
              onClick={() => router.back()}
              sx={{
                width: "40px",
                height: "40px",
                border: "1.5px solid var(--border-color)",
                backgroundColor: "var(--white)",
                "&:hover": {
                  backgroundColor: "var(--bg-color)",
                  borderColor: "var(--primary-color)",
                },
              }}
            >
              <ArrowBack sx={{ fontSize: "20px", color: "var(--text2)" }} />
            </IconButton>

            <Stack
              sx={{
                width: "52px",
                height: "52px",
                background:
                  "linear-gradient(135deg, rgba(var(--primary-rgb), 0.12) 0%, rgba(var(--primary-rgb), 0.06) 100%)",
                borderRadius: "14px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                border: "1.5px solid rgba(var(--primary-rgb), 0.25)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <Book sx={{ fontSize: "26px", color: "var(--primary-color)" }} />
            </Stack>

            <Stack gap="6px">
              <Stack direction="row" alignItems="center" gap="12px">
                {isLoading ? (
                  <Skeleton variant="text" width={200} height={28} />
                ) : (
                  <>
                    <Typography
                      sx={{
                        fontFamily: "Lato",
                        fontSize: "22px",
                        fontWeight: 700,
                        color: "var(--text1)",
                      }}
                    >
                      {subject?.title || "Subject Title"}
                    </Typography>
                    <Chip
                      label={`ID: ${subject?.id?.slice(0, 8) || "N/A"}`}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(255, 152, 0, 0.1)",
                        color: "#F57C00",
                        fontWeight: 700,
                        fontSize: "11px",
                        height: "24px",
                        border: "1px solid rgba(255, 152, 0, 0.2)",
                      }}
                    />
                  </>
                )}
              </Stack>
            </Stack>
          </Stack>

          {/* Right: Action Buttons */}
          <Stack direction="row" gap="12px">
            <Button
              variant="outlined"
              startIcon={<Edit sx={{ fontSize: "18px" }} />}
              onClick={handleRenameClick}
              sx={{
                border: "1.5px solid var(--border-color)",
                backgroundColor: "var(--white)",
                color: "var(--text1)",
                textTransform: "none",
                borderRadius: "10px",
                padding: "10px 20px",
                fontWeight: 600,
                fontSize: "14px",
                height: "48px",
                "&:hover": {
                  borderColor: "var(--primary-color)",
                  backgroundColor: "rgba(var(--primary-rgb), 0.08)",
                },
              }}
            >
              Rename
            </Button>
            <Button
              variant="contained"
              startIcon={<Delete sx={{ fontSize: "18px" }} />}
              onClick={() => setIsDeleteDialogOpen(true)}
              sx={{
                background: "linear-gradient(135deg, #F44336 0%, #D32F2F 100%)",
                color: "#FFFFFF",
                textTransform: "none",
                borderRadius: "10px",
                padding: "10px 20px",
                fontWeight: 700,
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(244, 67, 54, 0.25)",
                height: "48px",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #D32F2F 0%, #C62828 100%)",
                  boxShadow: "0 6px 16px rgba(244, 67, 54, 0.35)",
                  transform: "translateY(-1px)",
                },
              }}
              disableElevation
            >
              Delete Subject
            </Button>
          </Stack>
        </Stack>
      </Stack>

      {/* Rename Dialog */}
      <Dialog
        open={isRenameDialogOpen}
        onClose={() => setIsRenameDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "8px",
            maxWidth: "420px",
            width: "100%",
          },
        }}
      >
        <DialogContent sx={{ padding: "32px 24px 24px" }}>
          <Stack gap="20px">
            <Typography
              sx={{
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--text1)",
                fontFamily: "Lato",
              }}
            >
              Rename Subject
            </Typography>
            <TextField
              fullWidth
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter new subject title"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ padding: "0 24px 24px", gap: "12px" }}>
          <Button
            onClick={() => setIsRenameDialogOpen(false)}
            variant="outlined"
            fullWidth
            sx={{
              textTransform: "none",
              borderColor: "var(--border-color)",
              color: "var(--text2)",
              fontWeight: 600,
              height: "44px",
              borderRadius: "10px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRenameSubmit}
            variant="contained"
            fullWidth
            sx={{
              textTransform: "none",
              backgroundColor: "var(--primary-color)",
              color: "#fff",
              fontWeight: 700,
              height: "44px",
              borderRadius: "10px",
            }}
            disableElevation
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => !isDeleting && setIsDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "8px",
            maxWidth: "420px",
            width: "100%",
          },
        }}
      >
        <DialogContent sx={{ padding: "32px 24px 24px" }}>
          <Stack alignItems="center" gap="20px">
            <Stack
              sx={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "rgba(244, 67, 54, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ErrorOutline sx={{ fontSize: "32px", color: "#F44336" }} />
            </Stack>

            <Stack alignItems="center" gap="8px">
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--text1)",
                  fontFamily: "Lato",
                  textAlign: "center",
                }}
              >
                Delete Subject?
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
                  color: "var(--text3)",
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                Are you sure you want to permanently delete{" "}
                <strong>{subject?.title}</strong>?
              </Typography>
              <Typography
                sx={{
                  fontSize: "13px",
                  color: "#F44336",
                  textAlign: "center",
                  fontWeight: 600,
                  marginTop: "8px",
                }}
              >
                ⚠️ This action cannot be undone!
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ padding: "0 24px 24px", gap: "12px" }}>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isDeleting}
            variant="outlined"
            fullWidth
            sx={{
              textTransform: "none",
              borderColor: "var(--border-color)",
              color: "var(--text2)",
              fontWeight: 600,
              height: "44px",
              borderRadius: "10px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={onDelete}
            disabled={isDeleting}
            variant="contained"
            fullWidth
            sx={{
              textTransform: "none",
              background: "linear-gradient(135deg, #F44336 0%, #D32F2F 100%)",
              color: "#FFFFFF",
              fontWeight: 700,
              height: "44px",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(244, 67, 54, 0.25)",
            }}
            disableElevation
          >
            {isDeleting ? "Deleting..." : "Delete Subject"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
