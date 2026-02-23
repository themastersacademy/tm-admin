"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  Button,
  TextField,
  Typography,
  IconButton,
  Stack,
  CircularProgress,
  Box,
  Grid,
} from "@mui/material";
import {
  Close,
  DriveFileRenameOutline,
  FolderOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { apiFetch } from "@/src/lib/apiFetch";

export default function RenameBankDialog({ open, onClose, bank, fetchCourse }) {
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const [error, setError] = useState("");

  const MAX_LENGTH = 50;

  // Pre-fill with current bank title when dialog opens
  useEffect(() => {
    if (open && bank) {
      setTitle(bank.title || "");
      setError("");
    }
  }, [open, bank]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Folder name is required");
      return;
    }

    if (title.trim() === bank?.title) {
      setError("Please enter a different name");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/rename/${bank.bankID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: title.trim() }),
        },
      );

      if (data.success) {
        showSnackbar(data.message, "success", "", "3000");
        onClose();
        fetchCourse();
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
    } catch (err) {
      showSnackbar("Something went wrong", "error", "", "3000");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setError("");
    onClose();
  };

  const hasChanged = title.trim() !== (bank?.title || "");

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
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
          padding: "24px 28px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5}>
          <DriveFileRenameOutline sx={{ fontSize: "28px" }} />
          <Typography variant="h5" fontWeight={700} fontFamily="Lato">
            Rename Folder
          </Typography>
        </Stack>
        <IconButton
          onClick={handleClose}
          sx={{
            color: "white",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
          }}
        >
          <Close />
        </IconButton>
      </Stack>

      {/* Content */}
      <Grid container>
        {/* Left: Form */}
        <Grid item xs={12} md={7} sx={{ padding: "32px" }}>
          <Stack gap={3}>
            <Stack gap={1}>
              <Typography fontSize="14px" fontWeight={600} color="var(--text1)">
                Folder Name
              </Typography>
              <TextField
                autoFocus
                fullWidth
                placeholder="e.g., Mathematics Course"
                value={title}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_LENGTH) {
                    setTitle(e.target.value);
                    if (error) setError("");
                  }
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !isLoading &&
                    title.trim() &&
                    hasChanged
                  ) {
                    handleSubmit();
                  }
                }}
                error={!!error}
                helperText={error}
                InputProps={{
                  sx: {
                    borderRadius: "12px",
                    backgroundColor: "var(--bg-color)",
                    fontSize: "15px",
                    "& fieldset": {
                      borderColor: "var(--border-color)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#667eea",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#667eea",
                    },
                  },
                }}
              />
              <Stack direction="row" justifyContent="space-between">
                <Typography fontSize="12px" color="var(--text3)">
                  {title.length}/{MAX_LENGTH} characters
                </Typography>
                {title.trim() && hasChanged && (
                  <Typography fontSize="12px" color="var(--success-color)">
                    ✓ New name ready
                  </Typography>
                )}
              </Stack>
            </Stack>

            <Stack
              gap={1.5}
              sx={{
                padding: "16px",
                borderRadius: "12px",
                backgroundColor: "rgba(102, 126, 234, 0.05)",
                border: "1px solid rgba(102, 126, 234, 0.2)",
              }}
            >
              <Stack direction="row" gap={1} alignItems="center">
                <InfoOutlined sx={{ fontSize: "18px", color: "#667eea" }} />
                <Typography fontSize="14px" fontWeight={600} color="#667eea">
                  Current Name
                </Typography>
              </Stack>
              <Typography fontSize="13px" color="var(--text2)" fontWeight={500}>
                {bank?.title || "—"}
              </Typography>
            </Stack>

            <Stack direction="row" gap={2} mt={1}>
              <Button
                onClick={handleClose}
                variant="outlined"
                fullWidth
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  height: "44px",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--text2)",
                  borderColor: "var(--border-color)",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={isLoading || !title.trim() || !hasChanged}
                fullWidth
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  height: "44px",
                  fontSize: "15px",
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5568d3 0%, #6a3f91 100%)",
                    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
                  },
                  "&.Mui-disabled": {
                    background: "var(--border-color)",
                    color: "var(--text3)",
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={20} sx={{ color: "white" }} />
                ) : (
                  "Rename"
                )}
              </Button>
            </Stack>
          </Stack>
        </Grid>

        {/* Right: Preview */}
        <Grid
          item
          xs={12}
          md={5}
          sx={{
            padding: "32px",
            backgroundColor: "#f8f9ff",
            borderLeft: "1px solid var(--border-color)",
          }}
        >
          <Stack gap={2}>
            <Typography fontSize="14px" fontWeight={600} color="var(--text1)">
              Preview
            </Typography>

            {/* Folder Card Preview */}
            <Box
              sx={{
                padding: "20px",
                borderRadius: "16px",
                border: "1px solid var(--border-color)",
                backgroundColor: "white",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
                },
              }}
            >
              <Stack gap={2}>
                <Stack direction="row" gap={2} alignItems="center">
                  <Box
                    sx={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "14px",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "white",
                    }}
                  >
                    <FolderOutlined sx={{ fontSize: "28px" }} />
                  </Box>
                  <Stack flex={1}>
                    <Typography
                      fontSize="15px"
                      fontWeight={600}
                      color="var(--text1)"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {title || bank?.title || "Folder Name"}
                    </Typography>
                    <Typography fontSize="12px" color="var(--text3)">
                      {bank?.createdAt
                        ? new Date(bank.createdAt).toLocaleDateString()
                        : new Date().toLocaleDateString()}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Dialog>
  );
}
