"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Button,
  CircularProgress,
  DialogContent,
  IconButton,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import {
  Add,
  Close,
  Delete,
  East,
  Edit,
  PushPin,
  Visibility,
} from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import { apiFetch } from "@/src/lib/apiFetch";

import DialogBox from "@/src/components/DialogBox/DialogBox";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import MarkdownEditor from "@/src/components/MarkdownEditor/MarkdownEditor";
import MDPreview from "@/src/components/MarkdownPreview/MarkdownPreview";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";

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
    if (!title.trim() || !description.trim()) return;

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

  // Dialog title
  const dialogTitle = useMemo(() => {
    if (dialogMode === "preview") return dialogContent.title;
    if (dialogMode === "create") return "Create Content";
    if (dialogMode === "update") return "Update Content";
    return "";
  }, [dialogMode, dialogContent]);

  // Render dialog body
  const renderDialogBody = () => {
    if (dialogMode === "preview") {
      return (
        <DialogContent>
          <Stack gap={2}>
            <MDPreview value={dialogContent.description} />
          </Stack>
        </DialogContent>
      );
    }
    // create or update
    return (
      <DialogContent>
        <Stack gap={2}>
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
  };

  // Options for each card
  const renderCardOptions = (item, idx) => [
    <MenuItem key="view" onClick={() => openDialog("preview", idx, item)}>
      <Visibility sx={{ fontSize: 16 }} /> View
    </MenuItem>,
    <MenuItem key="edit" onClick={() => openDialog("update", idx, item)}>
      <Edit sx={{ fontSize: 16 }} /> Edit
    </MenuItem>,
    <MenuItem
      key="delete"
      sx={{ color: "var(--delete-color)" }}
      onClick={() => {
        setDeleteIndex(idx);
        setDeleteDialogOpen(true);
      }}
    >
      <Delete sx={{ fontSize: 16 }} /> Delete
    </MenuItem>,
  ];

  return (
    <Stack
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        borderRadius: 2,
        p: 2,
        gap: 2,
        minHeight: "100vh",
      }}
    >
      {/* Delete Confirmation */}
      <DeleteDialogBox
        isOpen={deleteDialogOpen}
        name="Content"
        title="Blog"
        warning="This action cannot be undone"
        actionButton={
          <Stack direction="row" justifyContent="center" gap={2} width="100%">
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="contained"
              sx={{
                textTransform: "none",
                backgroundColor: "white",
                color: "var(--text2)",
                border: "1px solid var(--border-color)",
                borderRadius: 1,
                width: 130,
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
                borderRadius: 1,
                width: 130,
              }}
              disableElevation
              disabled={isDeleting}
            >
              {isDeleting ? <CircularProgress size={20} /> : "Delete"}
            </Button>
          </Stack>
        }
      />

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: 16,
            fontWeight: 700,
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
            textTransform: "none",
            backgroundColor: "var(--primary-color)",
          }}
          disableElevation
        >
          Create
        </Button>
      </Stack>

      {/* Dialog */}
      {dialogMode && (
        <DialogBox
          isOpen
          title={dialogTitle}
          icon={
            <IconButton onClick={closeDialog} sx={{ borderRadius: 1, p: 0.5 }}>
              <Close />
            </IconButton>
          }
          actionButton={
            (dialogMode === "create" || dialogMode === "update") && (
              <Button
                onClick={handleSave}
                variant="text"
                endIcon={<East />}
                disabled={isSaving}
                sx={{ textTransform: "none", color: "var(--primary-color)" }}
              >
                {isSaving ? (
                  <CircularProgress size={20} color="primary" />
                ) : dialogMode === "create" ? (
                  "Save"
                ) : (
                  "Update"
                )}
              </Button>
            )
          }
        >
          {renderDialogBody()}
        </DialogBox>
      )}

      {/* Content Cards */}
      <Stack flexWrap="wrap" direction="row" rowGap={2} columnGap={4}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <SecondaryCardSkeleton key={idx} />
          ))
        ) : Array.isArray(infoList) && infoList.length > 0 ? (
          infoList.map((item, idx) => (
            <SecondaryCard
              key={idx}
              icon={
                <PushPin
                  sx={{ color: "var(--sec-color)", transform: "rotate(45deg)" }}
                />
              }
              title={item.title}
              options={renderCardOptions(item, idx)}
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
