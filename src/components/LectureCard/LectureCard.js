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
import LinkDialog from "@/src/app/dashboard/goals/[id]/courses/Components/LinkDialog";
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
          height: "60px",
          borderRadius: "3px",
          backgroundColor: isDragging
            ? "var(--sec-color-acc-1)"
            : "var(--sec-color-acc-2)",
          padding: "10px",
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="row" gap="10px">
            <IconButton disableRipple>
              <Menu />
            </IconButton>
            <Stack sx={{ minWidth: "280px" }}>
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
              />
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center">
            <Stack direction="row" alignItems="center">
              <Typography
                sx={{
                  fontFamily: "Lato",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "var(--text3)",
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
            {lesson.isLinked &&
              (lesson.type === "VIDEO" ? (
                <Tooltip title="Play Video">
                  <IconButton
                    onClick={() => {
                      playVideo({ videoID: lesson.resourceID });
                      videoPlayerOpen();
                    }}
                    disableRipple
                  >
                    <PlayCircleRounded sx={{ color: "var(--sec-color)" }} />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Download File">
                  <IconButton
                    onClick={() => downloadFile({ path: lesson.path })}
                    disableRipple
                  >
                    <SaveAlt sx={{ color: "var(--sec-color)" }} />
                  </IconButton>
                </Tooltip>
              ))}
            <IconButton
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
              disableRipple
            >
              {isUnlinkLoading ? (
                <CircularProgress
                  size={20}
                  sx={{ color: "var(--secondary)" }}
                />
              ) : lesson.isLinked ? (
                <Tooltip title="Unlink">
                  <LinkOff sx={{ color: "var(--sec-color)" }} />
                </Tooltip>
              ) : (
                <Tooltip title="Link">
                  <Link sx={{ color: "var(--sec-color)" }} />
                </Tooltip>
              )}
            </IconButton>
            <Tooltip title="Delete">
              <IconButton onClick={openDeleteDialog} disableRipple>
                <Delete sx={{ color: "var(--delete-color)" }} />
              </IconButton>
            </Tooltip>
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
                  borderRadius: "5px",
                  width: "130px",
                }}
                disableElevation
              >
                {loading ? (
                  <CircularProgress
                    size={24}
                    sx={{ color: "var(--white)", fontSize: "10px" }}
                  />
                ) : (
                  "Delete"
                )}
              </Button>
              <Button
                variant="contained"
                onClick={closeDeleteDialog}
                sx={{
                  textTransform: "none",
                  borderRadius: "5px",
                  backgroundColor: "white",
                  color: "var(--text2)",
                  border: "1px solid var(--border-color)",
                  width: "130px",
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
