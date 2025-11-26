"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  Divider,
  Chip,
} from "@mui/material";
import { Add, Close, Article } from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import { apiFetch } from "@/src/lib/apiFetch";

import BlogCard from "@/src/components/BlogCard/BlogCard";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import MarkdownEditor from "@/src/components/MarkdownEditor/MarkdownEditor";
import MDPreview from "@/src/components/MarkdownPreview/MarkdownPreview";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import { getWordCount } from "@/src/utils/blogHelpers";

const EMPTY_CONTENT = { title: "", description: "" };

export default function Info({ goal }) {
  // States
  const [infoList, setInfoList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [dialogMode, setDialogMode] = useState(null); // "create" | "update" | "preview" | null
  const [dialogContent, setDialogContent] = useState(EMPTY_CONTENT);
  const [currentIndex, setCurrentIndex] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  // Fetch content list
  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/content/get?goalID=${goal.goalID}`
      );
      if (res.success) {
        setInfoList(res.data || []);
      } else {
        setInfoList([]);
        enqueueSnackbar("Error fetching content", { variant: "error" });
      }
    } catch {
      setInfoList([]);
      enqueueSnackbar("Error fetching content", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [goal.goalID]);

  useEffect(() => {
    if (goal?.goalID) {
      fetchContent();
    }
  }, [fetchContent, goal?.goalID]);

  // Open dialog in a given mode
  const openDialog = (mode, index = null, content = EMPTY_CONTENT) => {
    setDialogMode(mode);
    setCurrentIndex(index);
    setDialogContent(content);
  };

  const closeDialog = () => {
    setDialogMode(null);
    setCurrentIndex(null);
    setDialogContent(EMPTY_CONTENT);
    setIsSaving(false);
  };

  // Save (create/update)
  const handleSave = async () => {
    const { title, description } = dialogContent;
    if (!title.trim() || !description.trim()) {
      enqueueSnackbar("Please fill in all fields", { variant: "warning" });
      return;
    }

    setIsSaving(true);
    const endpoint =
      dialogMode === "create"
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/content/create`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/content/update`;
    const payload = {
      goalID: goal.goalID,
      ...(dialogMode === "update" && { contentIndex: currentIndex }),
      content: dialogContent,
    };
    try {
      const res = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.success) {
        enqueueSnackbar(
          dialogMode === "create"
            ? "Blog created successfully"
            : "Blog updated successfully",
          { variant: "success" }
        );
        fetchContent();
        closeDialog();
      } else {
        enqueueSnackbar("Failed to save content", { variant: "error" });
      }
    } catch {
      enqueueSnackbar("Failed to save content", { variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/content/delete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goalID: goal.goalID,
            contentIndex: deleteIndex,
          }),
        }
      );
      if (res.success) {
        enqueueSnackbar("Blog deleted successfully", { variant: "success" });
        fetchContent();
        setDeleteDialogOpen(false);
      } else {
        enqueueSnackbar("Failed to delete content", { variant: "error" });
      }
    } catch {
      enqueueSnackbar("Failed to delete content", { variant: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const wordCount = useMemo(
    () => getWordCount(dialogContent.description),
    [dialogContent.description]
  );

  return (
    <Stack
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "24px",
        gap: "24px",
      }}
    >
      {/* Delete Confirmation */}
      <DeleteDialogBox
        isOpen={deleteDialogOpen}
        name="Content"
        title="Blog"
        warning="This action cannot be undone"
        actionButton={
          <Stack
            direction="row"
            justifyContent="center"
            gap="12px"
            width="100%"
          >
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="outlined"
              sx={{
                textTransform: "none",
                borderRadius: "8px",
                borderColor: "var(--border-color)",
                color: "var(--text2)",
                width: 130,
                "&:hover": {
                  borderColor: "var(--text3)",
                  backgroundColor: "transparent",
                },
              }}
              disableElevation
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              sx={{
                textTransform: "none",
                backgroundColor: "var(--delete-color)",
                borderRadius: "8px",
                width: 130,
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#D32F2F",
                  boxShadow: "none",
                },
              }}
              disableElevation
              disabled={isDeleting}
            >
              {isDeleting ? (
                <CircularProgress size={20} sx={{ color: "white" }} />
              ) : (
                "Delete"
              )}
            </Button>
          </Stack>
        }
      />

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack gap="4px">
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text1)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Article sx={{ color: "var(--primary-color)" }} /> Blog Content
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "var(--text3)" }}>
            Create and manage blog posts for this goal
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" gap="12px">
          {!isLoading && infoList.length > 0 && (
            <Chip
              label={`${infoList.length} ${
                infoList.length === 1 ? "Blog" : "Blogs"
              }`}
              sx={{
                backgroundColor: "rgba(var(--primary-rgb), 0.1)",
                color: "var(--primary-color)",
                fontWeight: 600,
                fontSize: "12px",
              }}
            />
          )}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => openDialog("create")}
            sx={{
              textTransform: "none",
              backgroundColor: "var(--primary-color)",
              borderRadius: "8px",
              padding: "8px 24px",
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "var(--primary-color-dark)",
                boxShadow: "none",
              },
            }}
            disableElevation
          >
            Create Blog
          </Button>
        </Stack>
      </Stack>

      <Divider />

      {/* Dialog */}
      {dialogMode && (
        <Dialog
          open={true}
          onClose={closeDialog}
          maxWidth={dialogMode === "preview" ? "md" : "lg"}
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "16px",
              height: dialogMode === "preview" ? "auto" : "90vh",
            },
          }}
        >
          {/* Dialog Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            padding="20px 24px"
            sx={{ borderBottom: "1px solid var(--border-color)" }}
          >
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--text1)",
              }}
            >
              {dialogMode === "preview"
                ? dialogContent.title
                : dialogMode === "create"
                ? "Create Blog Post"
                : "Edit Blog Post"}
            </Typography>
            <IconButton onClick={closeDialog} size="small">
              <Close />
            </IconButton>
          </Stack>

          {/* Dialog Content */}
          <DialogContent sx={{ padding: "0", height: "100%" }}>
            {dialogMode === "preview" ? (
              <Stack padding="24px" gap="16px">
                <MDPreview value={dialogContent.description} />
              </Stack>
            ) : (
              <Stack direction={{ xs: "column", md: "row" }} height="100%">
                {/* Left: Form */}
                <Stack
                  flex={1}
                  padding="24px"
                  gap="20px"
                  sx={{
                    borderRight: { md: "1px solid var(--border-color)" },
                    overflowY: "auto",
                  }}
                >
                  <Stack gap="8px">
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--text2)",
                      }}
                    >
                      Title
                    </Typography>
                    <StyledTextField
                      value={dialogContent.title}
                      placeholder="Enter blog title..."
                      onChange={(e) =>
                        setDialogContent((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />
                  </Stack>

                  <Stack gap="8px" flex={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        sx={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "var(--text2)",
                        }}
                      >
                        Content (Markdown)
                      </Typography>
                      <Typography
                        sx={{ fontSize: "12px", color: "var(--text3)" }}
                      >
                        {wordCount} words
                      </Typography>
                    </Stack>
                    <MarkdownEditor
                      value={dialogContent.description}
                      onChange={(val) =>
                        setDialogContent((prev) => ({
                          ...prev,
                          description: val,
                        }))
                      }
                    />
                  </Stack>
                </Stack>

                {/* Right: Preview */}
                <Stack
                  flex={1}
                  padding="24px"
                  gap="16px"
                  sx={{
                    backgroundColor: "#F8F9FA",
                    overflowY: "auto",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--text3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Live Preview
                  </Typography>
                  {dialogContent.description ? (
                    <MDPreview value={dialogContent.description} />
                  ) : (
                    <Stack
                      justifyContent="center"
                      alignItems="center"
                      flex={1}
                      sx={{ opacity: 0.5 }}
                    >
                      <Typography
                        sx={{ fontSize: "13px", color: "var(--text3)" }}
                      >
                        Start typing to see preview...
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            )}
          </DialogContent>

          {/* Dialog Footer */}
          {dialogMode !== "preview" && (
            <>
              <Divider />
              <Stack
                direction="row"
                justifyContent="flex-end"
                gap="12px"
                padding="16px 24px"
              >
                <Button
                  onClick={closeDialog}
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    padding: "8px 24px",
                    fontWeight: 600,
                    borderColor: "var(--border-color)",
                    color: "var(--text2)",
                    "&:hover": {
                      borderColor: "var(--text3)",
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  variant="contained"
                  disabled={
                    isSaving ||
                    !dialogContent.title.trim() ||
                    !dialogContent.description.trim()
                  }
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    padding: "8px 24px",
                    fontWeight: 600,
                    backgroundColor: "var(--primary-color)",
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor: "var(--primary-color-dark)",
                      boxShadow: "0 4px 12px rgba(var(--primary-rgb), 0.3)",
                    },
                    "&:disabled": {
                      backgroundColor: "var(--text3)",
                      color: "var(--white)",
                      opacity: 0.5,
                    },
                  }}
                >
                  {isSaving ? (
                    <CircularProgress size={20} sx={{ color: "white" }} />
                  ) : dialogMode === "create" ? (
                    "Create Blog"
                  ) : (
                    "Update Blog"
                  )}
                </Button>
              </Stack>
            </>
          )}
        </Dialog>
      )}

      {/* Content Cards */}
      <Stack
        direction="row"
        flexWrap="wrap"
        gap="20px"
        sx={{
          "& > *": {
            flexBasis: {
              xs: "100%",
              sm: "calc(50% - 10px)",
              md: "calc(33.333% - 14px)",
            },
          },
        }}
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <SecondaryCardSkeleton key={idx} />
          ))
        ) : Array.isArray(infoList) && infoList.length > 0 ? (
          infoList.map((item, idx) => (
            <BlogCard
              key={idx}
              title={item.title}
              description={item.description}
              createdAt={item.createdAt || Date.now()}
              onView={() => openDialog("preview", idx, item)}
              onEdit={() => openDialog("update", idx, item)}
              onDelete={() => {
                setDeleteIndex(idx);
                setDeleteDialogOpen(true);
              }}
            />
          ))
        ) : (
          <Stack
            width="100%"
            minHeight="400px"
            justifyContent="center"
            alignItems="center"
          >
            <NoDataFound
              info="No blog posts yet"
              subInfo="Click 'Create Blog' to write your first post"
            />
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
