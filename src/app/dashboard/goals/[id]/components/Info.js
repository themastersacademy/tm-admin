"use client";
import { useState, useEffect } from "react";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import MarkdownEditor from "@/src/components/MarkdownEditor/MarkdownEditor";
import MDPreview from "@/src/components/MarkdownPreview/MarkdownPreview";
import { apiFetch } from "@/src/lib/apiFetch";
import {
  Add,
  Close,
  Delete,
  East,
  Edit,
  PushPin,
  Visibility,
} from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  DialogContent,
  IconButton,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";

export default function Info({ goal }) {
  const [infoList, setInfoList] = useState(goal.blogList || []);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // dialogMode can be "create", "update", "preview", or null (closed)
  const [dialogMode, setDialogMode] = useState(null);
  // currentIndex holds the index for update mode (or preview)
  const [currentIndex, setCurrentIndex] = useState(null);
  // dialogContent holds title & description for both create/update and preview
  const [dialogContent, setDialogContent] = useState({
    title: "",
    description: "",
  });

  // Fetch content from the backend
  const fetchContent = async () => {
    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/content/get?goalID=${goal.goalID}`
      );
      if (response.success) {
        setInfoList(response.data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching content:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Combined save handler for create and update operations
  const onSaveDialogContent = async () => {
    if (!dialogContent.title || !dialogContent.description) return;
    setIsSaving(true);
    try {
      let endpoint, body;
      if (dialogMode === "create") {
        endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/content/create`;
        body = { goalID: goal.goalID, content: dialogContent };
      } else if (dialogMode === "update") {
        endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/content/update`;
        body = {
          goalID: goal.goalID,
          contentIndex: currentIndex,
          content: dialogContent,
        };
      }
      const response = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (response.success) {
        fetchContent();
        closeDialog();
      }
      setIsSaving(false);
    } catch (error) {
      console.error("Save error:", error);
      setIsSaving(false);
    }
  };

  // Delete content
  const onDeleteContent = async (index) => {
    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/content/delete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goalID: goal.goalID, contentIndex: index }),
        }
      );
      if (response.success) {
        fetchContent();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Open dialog for a specific mode and optionally set the index and content.
  const openDialog = (
    mode,
    index = null,
    content = { title: "", description: "" }
  ) => {
    setDialogMode(mode);
    setCurrentIndex(index);
    setDialogContent(content);
  };

  const closeDialog = () => {
    setDialogMode(null);
    setCurrentIndex(null);
    setDialogContent({ title: "", description: "" });
    setIsSaving(false);
  };

  // Render dialog content based on dialogMode.
  const renderDialogContent = () => {
    if (dialogMode === "preview") {
      return (
        <DialogContent>
          <Stack gap="15px">
            <MDPreview value={dialogContent.description} />
          </Stack>
        </DialogContent>
      );
    } else if (dialogMode === "create" || dialogMode === "update") {
      return (
        <DialogContent>
          <Stack gap="15px">
            <Typography>Title</Typography>
            <StyledTextField
              value={dialogContent.title}
              placeholder="Enter title"
              onChange={(e) =>
                setDialogContent((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <Typography>Description</Typography>
            <MarkdownEditor
              value={dialogContent.description}
              onChange={(val) =>
                setDialogContent((prev) => ({ ...prev, description: val }))
              }
            />
          </Stack>
        </DialogContent>
      );
    }
    return null;
  };

  return (
    <Stack
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        padding: "20px",
        gap: "20px",
        minHeight: "100vh",
      }}
    >
      <Stack flexDirection="row" justifyContent="space-between">
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "16px",
            fontWeight: "700",
            color: "var(--text3)",
          }}
        >
          Contents
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => openDialog("create")}
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
          }}
          disableElevation
        >
          Create
        </Button>
      </Stack>

      {dialogMode && (
        <DialogBox
          isOpen={Boolean(dialogMode)}
          title={
            dialogMode === "preview"
              ? dialogContent.title
              : dialogMode === "create"
              ? "Create Content"
              : "Update Content"
          }
          icon={
            <IconButton
              sx={{ borderRadius: "5px", padding: "2px" }}
              onClick={closeDialog}
            >
              <Close />
            </IconButton>
          }
          actionButton={
            (dialogMode === "create" || dialogMode === "update") && (
              <Button
                variant="text"
                endIcon={<East />}
                onClick={onSaveDialogContent}
                disabled={isSaving}
                sx={{ textTransform: "none", color: "var(--primary-color)" }}
              >
                {isSaving ? (
                  <CircularProgress size={20} color="var(--primary)" />
                ) : dialogMode === "create" ? (
                  "Save"
                ) : (
                  "Update"
                )}
              </Button>
            )
          }
        >
          {renderDialogContent()}
        </DialogBox>
      )}

      <Stack flexWrap="wrap" flexDirection="row" rowGap="20px" columnGap="50px">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <SecondaryCardSkeleton key={idx} />
          ))
        ) : infoList.length > 0 ? (
          infoList.map((item, idx) => (
            <SecondaryCard
              key={idx}
              icon={
                <PushPin
                  sx={{ color: "var(--sec-color)", transform: "rotate(45deg)" }}
                />
              }
              title={item.title}
              options={[
                <MenuItem
                  key="view"
                  onClick={() => openDialog("preview", idx, item)}
                  sx={{
                    gap: "8px",
                    padding: "5px 8px",
                    fontSize: "13px",
                    minWidth: "60px",
                    borderRadius: "4px",
                  }}
                >
                  <Visibility sx={{ fontSize: "16px" }} /> View
                </MenuItem>,
                <MenuItem
                  key="edit"
                  onClick={() => openDialog("update", idx, item)}
                  sx={{
                    gap: "8px",
                    padding: "5px 8px",
                    fontSize: "13px",
                    minWidth: "60px",
                    borderRadius: "4px",
                  }}
                >
                  <Edit sx={{ fontSize: "16px" }} /> Edit
                </MenuItem>,
                <MenuItem
                  key="delete"
                  onClick={() => onDeleteContent(idx)}
                  sx={{
                    gap: "8px",
                    padding: "5px 8px",
                    fontSize: "13px",
                    color: "var(--delete-color)",
                    borderRadius: "4px",
                  }}
                >
                  <Delete sx={{ fontSize: "16px" }} /> Delete
                </MenuItem>,
              ]}
              cardWidth="350px"
            />
          ))
        ) : (
          <Stack width="100%" height={400} justifyContent="center">
            <NoDataFound info="No blog contents are available, create the blog using create button" />
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
