"use client";
import React, { useState, useCallback, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import {
  Delete,
  Link,
  LinkOff,
  Menu,
  PlayCircleRounded,
  SaveAlt,
} from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  DialogContent,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import LinkDialog from "@/src/app/dashboard/goals/[id]/courses/components/LinkDialog";
import StyledTextField from "../StyledTextField/StyledTextField";
import StyledSwitch from "../StyledSwitch/StyledSwitch";
import DeleteDialogBox from "../DeleteDialogBox/DeleteDialogBox";
import { apiFetch } from "@/src/lib/apiFetch";
import { useRouter } from "next/navigation";
import LongDialogBox from "../LongDialogBox/LongDialogBox";
import VideoPlayer from "../VideoPlayer/VideoPlayer";

const ItemType = {
  CARD: "lectureCard",
};

export default function LectureCard({
  index,
  moveCard,
  course,
  handleLessonUpdate,
  handleUnlink,
  lesson,
  deleteLesson,
  reorderLessons,
  lessons,
  setLessons,
}) {
  const router = useRouter();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUnlinkLoading, setIsUnlinkLoading] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [initialTitle, setInitialTitle] = useState(lesson.title);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const openDeleteDialog = useCallback(() => setIsDeleteDialogOpen(true), []);
  const closeDeleteDialog = useCallback(() => setIsDeleteDialogOpen(false), []);
  const dialogOpen = useCallback(() => setIsDialogOpen(true), []);
  const dialogClose = useCallback(() => setIsDialogOpen(false), []);
  const videoPlayerOpen = useCallback(() => setIsVideoPlayerOpen(true), []);
  const videoPlayerClose = useCallback(() => setIsVideoPlayerOpen(false), []);

  const [{ isDragging }, dragRef] = useDrag({
    type: ItemType.CARD,
    item: { lesson, index, initialIndex: index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [, dropRef] = useDrop({
    accept: ItemType.CARD,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveCard(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
    drop: (draggedItem) => {
      if (draggedItem.initialIndex !== index) {
        reorderLessons({ updatedLessons: lessons });
      }
    },
  });

  const ref = useRef(null);
  const dragDropRef = dragRef(dropRef(ref));

  const downloadFile = useCallback(
    async ({ path }) => {
      try {
        const data = await apiFetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL
          }/api/bank/resource/get-file?path=${encodeURIComponent(path)}`
        );
        if (!data.success || !data.url) return;
        const response = await fetch(data.url);
        if (!response.ok) {
          router.push("/404");
          return;
        }
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const fileDownload = document.createElement("a");
        fileDownload.href = downloadUrl;
        fileDownload.download = "download";
        document.body.appendChild(fileDownload);
        fileDownload.click();
        document.body.removeChild(fileDownload);
        window.URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error("Error downloading file:", error);
        router.push("/404");
      }
    },
    [router]
  );

  const playVideo = useCallback(async ({ videoID }) => {
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/resource/get-video?resourceID=${videoID}`
      );
      if (data) {
        setVideoURL(data.videoURL);
      }
    } catch (error) {
      console.error("Error playing video:", error);
    }
  }, []);

  return (
    <>
      <Stack
        ref={dragDropRef}
        sx={{
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          backgroundColor: isDragging
            ? "var(--sec-color-acc-1)"
            : "var(--white)",
          padding: "16px 24px",
          opacity: isDragging ? 0.5 : 1,
          transition: "all 0.2s ease",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            borderColor: "var(--primary-color)",
          },
        }}
      >
        <Stack direction="row" alignItems="center" gap="16px">
          {/* Drag Handle */}
          <IconButton
            disableRipple
            sx={{
              cursor: "grab",
              color: "var(--text3)",
              "&:hover": { color: "var(--text1)" },
            }}
          >
            <Menu fontSize="small" />
          </IconButton>

          {/* Title Input */}
          <Stack flex={1}>
            <StyledTextField
              placeholder="Enter Lesson Title"
              value={lesson.title}
              onFocus={(e) => {
                setInitialTitle(e.target.value);
                e.target.select();
              }}
              onBlur={(e) => {
                const newTitle = e.target.value;
                if (newTitle !== initialTitle) {
                  handleLessonUpdate(e, lesson.id, lesson.courseID, {
                    title: newTitle,
                  });
                }
              }}
              onChange={(e) => {
                const newTitle = e.target.value;
                setLessons((prev) =>
                  prev.map((l) =>
                    l.id === lesson.id ? { ...l, title: newTitle } : l
                  )
                );
              }}
              sx={{
                "& .MuiInputBase-input": {
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--text1)",
                  padding: "8px 0",
                },
                "& fieldset": { border: "none" },
              }}
            />
          </Stack>

          {/* Actions Group */}
          <Stack direction="row" alignItems="center" gap="16px">
            {/* Preview Toggle */}
            <Stack direction="row" alignItems="center" gap="8px">
              <Typography
                sx={{
                  fontFamily: "Lato",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--text3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Preview
              </Typography>
              <StyledSwitch
                checked={lesson.isPreview}
                onChange={(e) => {
                  const updatePreview = e.target.checked;
                  handleLessonUpdate(e, lesson.id, lesson.courseID, {
                    isPreview: updatePreview,
                  });
                  setLessons((prev) =>
                    prev.map((l) =>
                      l.id === lesson.id
                        ? { ...l, isPreview: updatePreview }
                        : l
                    )
                  );
                }}
              />
            </Stack>

            <div
              style={{
                width: "1px",
                height: "24px",
                backgroundColor: "var(--border-color)",
              }}
            />

            {/* Resource Actions */}
            <Stack direction="row" gap="8px">
              {lesson.isLinked &&
                (lesson.type === "VIDEO" ? (
                  <Button
                    startIcon={<PlayCircleRounded />}
                    onClick={() => {
                      playVideo({ videoID: lesson.resourceID });
                      videoPlayerOpen();
                    }}
                    variant="outlined"
                    size="small"
                    sx={{
                      textTransform: "none",
                      borderColor: "var(--primary-color)",
                      color: "var(--primary-color)",
                      fontWeight: 600,
                      borderRadius: "6px",
                      "&:hover": {
                        backgroundColor: "rgba(var(--primary-rgb), 0.05)",
                        borderColor: "var(--primary-color)",
                      },
                    }}
                  >
                    Play Video
                  </Button>
                ) : (
                  <Button
                    startIcon={<SaveAlt />}
                    onClick={() => downloadFile({ path: lesson.path })}
                    variant="outlined"
                    size="small"
                    sx={{
                      textTransform: "none",
                      borderColor: "var(--primary-color)",
                      color: "var(--primary-color)",
                      fontWeight: 600,
                      borderRadius: "6px",
                      "&:hover": {
                        backgroundColor: "rgba(var(--primary-rgb), 0.05)",
                        borderColor: "var(--primary-color)",
                      },
                    }}
                  >
                    Download
                  </Button>
                ))}

              <Button
                startIcon={lesson.isLinked ? <LinkOff /> : <Link />}
                onClick={() => {
                  if (lesson.isLinked) {
                    setIsUnlinkLoading(true);
                    handleUnlink(
                      setIsUnlinkLoading,
                      lesson.id,
                      lesson.courseID,
                      lesson.resourceID
                    );
                  } else {
                    dialogOpen();
                  }
                }}
                variant={lesson.isLinked ? "outlined" : "contained"}
                size="small"
                sx={{
                  textTransform: "none",
                  backgroundColor: lesson.isLinked
                    ? "transparent"
                    : "var(--sec-color)",
                  borderColor: lesson.isLinked
                    ? "var(--warning-color)"
                    : "transparent",
                  color: lesson.isLinked
                    ? "var(--warning-color)"
                    : "var(--white)",
                  fontWeight: 600,
                  borderRadius: "6px",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: lesson.isLinked
                      ? "rgba(255, 152, 0, 0.05)"
                      : "var(--sec-color-dark)",
                    borderColor: lesson.isLinked
                      ? "var(--warning-color)"
                      : "transparent",
                    boxShadow: "none",
                  },
                }}
                disabled={isUnlinkLoading}
              >
                {isUnlinkLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : lesson.isLinked ? (
                  "Unlink"
                ) : (
                  "Link Resource"
                )}
              </Button>

              <Tooltip title="Delete Lesson">
                <IconButton
                  onClick={openDeleteDialog}
                  size="small"
                  sx={{
                    color: "var(--text3)",
                    marginLeft: "8px",
                    "&:hover": {
                      color: "var(--delete-color)",
                      backgroundColor: "rgba(255, 0, 0, 0.05)",
                    },
                  }}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>

        <LinkDialog
          lesson={lesson}
          isOpen={isDialogOpen}
          onClose={dialogClose}
          setIsUnlinkLoading={setIsUnlinkLoading}
          course={course}
          handleLessonUpdate={handleLessonUpdate}
        />
        <DeleteDialogBox
          title="Lesson"
          isOpen={isDeleteDialogOpen}
          warning={
            lesson.isLinked ? "Unlink the resource before deleting" : null
          }
          actionButton={
            <Stack
              direction="row"
              justifyContent="center"
              sx={{ gap: "20px", width: "100%" }}
            >
              <Button
                variant="contained"
                disabled={lesson.isLinked}
                onClick={() =>
                  deleteLesson({
                    lessonID: lesson.id,
                    goalID: course.goalID,
                    setLoading,
                    deleteDialogClose: closeDeleteDialog,
                  })
                }
                sx={{
                  textTransform: "none",
                  backgroundColor: "var(--delete-color)",
                  borderRadius: "8px",
                  width: "120px",
                  fontWeight: 600,
                }}
                disableElevation
              >
                {loading ? (
                  <CircularProgress size={20} sx={{ color: "var(--white)" }} />
                ) : (
                  "Delete"
                )}
              </Button>
              <Button
                variant="outlined"
                onClick={closeDeleteDialog}
                sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  borderColor: "var(--border-color)",
                  color: "var(--text2)",
                  width: "120px",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "var(--text2)",
                    backgroundColor: "transparent",
                  },
                }}
                disableElevation
              >
                Cancel
              </Button>
            </Stack>
          }
        />
      </Stack>
      <LongDialogBox isOpen={isVideoPlayerOpen} onClose={videoPlayerClose}>
        <DialogContent>
          {videoURL && <VideoPlayer videoURL={videoURL} />}
        </DialogContent>
      </LongDialogBox>
    </>
  );
}
