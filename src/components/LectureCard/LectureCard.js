"use client";
import React, { useState, useCallback, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import {
  Delete,
  DriveFileMove,
  Link,
  LinkOff,
  Menu as MenuIcon,
  PlayCircleRounded,
  SaveAlt,
} from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  DialogContent,
  IconButton,
  Menu,
  MenuItem,
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
  sectionID,
  sections,
  onMoveLesson,
}) {
  const router = useRouter();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUnlinkLoading, setIsUnlinkLoading] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [initialTitle, setInitialTitle] = useState(lesson.title);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [moveAnchorEl, setMoveAnchorEl] = useState(null);

  const openDeleteDialog = useCallback(() => setIsDeleteDialogOpen(true), []);
  const closeDeleteDialog = useCallback(() => setIsDeleteDialogOpen(false), []);
  const dialogOpen = useCallback(() => setIsDialogOpen(true), []);
  const dialogClose = useCallback(() => setIsDialogOpen(false), []);
  const videoPlayerOpen = useCallback(() => setIsVideoPlayerOpen(true), []);
  const videoPlayerClose = useCallback(() => setIsVideoPlayerOpen(false), []);

  const dragType = sectionID ? `${ItemType.CARD}-${sectionID}` : ItemType.CARD;

  const [{ isDragging }, dragRef] = useDrag({
    type: dragType,
    item: { lesson, index, initialIndex: index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [, dropRef] = useDrop({
    accept: dragType,
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
          borderRadius: "8px",
          backgroundColor: isDragging
            ? "var(--sec-color-acc-1)"
            : "var(--white)",
          padding: "8px 12px",
          opacity: isDragging ? 0.5 : 1,
          transition: "all 0.15s ease",
          "&:hover": {
            borderColor: "var(--primary-color)",
            "& .lesson-actions": { opacity: 1 },
          },
        }}
      >
        <Stack direction="row" alignItems="center" gap="8px">
          {/* Drag Handle */}
          <IconButton
            disableRipple
            size="small"
            sx={{
              cursor: "grab",
              color: "var(--text4)",
              width: 24,
              height: 24,
              "&:hover": { color: "var(--text2)" },
            }}
          >
            <MenuIcon sx={{ fontSize: "16px" }} />
          </IconButton>

          {/* Index */}
          <Typography
            sx={{
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--text4)",
              minWidth: "20px",
            }}
          >
            {index + 1}.
          </Typography>

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
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text1)",
                  padding: "4px 0",
                },
                "& fieldset": { border: "none" },
              }}
            />
          </Stack>

          {/* Actions */}
          <Stack direction="row" alignItems="center" gap="6px">
            {/* Preview Toggle */}
            <Stack direction="row" alignItems="center" gap="4px">
              <Typography
                sx={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "var(--text4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
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
                height: "20px",
                backgroundColor: "var(--border-color)",
              }}
            />

            {/* Resource Actions */}
            <Stack direction="row" gap="4px" className="lesson-actions" sx={{ opacity: { xs: 1, md: 0.4 }, transition: "opacity 0.15s" }}>
              {lesson.isLinked &&
                (lesson.type === "VIDEO" ? (
                  <Button
                    startIcon={<PlayCircleRounded sx={{ fontSize: "14px !important" }} />}
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
                      fontSize: "11px",
                      borderRadius: "6px",
                      padding: "2px 10px",
                      height: "26px",
                      minWidth: "unset",
                      "&:hover": {
                        backgroundColor: "rgba(24, 113, 99, 0.04)",
                        borderColor: "var(--primary-color)",
                      },
                    }}
                  >
                    Play
                  </Button>
                ) : (
                  <Button
                    startIcon={<SaveAlt sx={{ fontSize: "14px !important" }} />}
                    onClick={() => downloadFile({ path: lesson.path })}
                    variant="outlined"
                    size="small"
                    sx={{
                      textTransform: "none",
                      borderColor: "var(--primary-color)",
                      color: "var(--primary-color)",
                      fontWeight: 600,
                      fontSize: "11px",
                      borderRadius: "6px",
                      padding: "2px 10px",
                      height: "26px",
                      minWidth: "unset",
                      "&:hover": {
                        backgroundColor: "rgba(24, 113, 99, 0.04)",
                        borderColor: "var(--primary-color)",
                      },
                    }}
                  >
                    Download
                  </Button>
                ))}

              <Button
                startIcon={
                  lesson.isLinked ? (
                    <LinkOff sx={{ fontSize: "14px !important" }} />
                  ) : (
                    <Link sx={{ fontSize: "14px !important" }} />
                  )
                }
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
                    : "var(--primary-color)",
                  borderColor: lesson.isLinked
                    ? "var(--warning-color)"
                    : "var(--primary-color)",
                  color: lesson.isLinked
                    ? "var(--warning-color)"
                    : "var(--white)",
                  fontWeight: 600,
                  fontSize: "11px",
                  borderRadius: "6px",
                  padding: "2px 10px",
                  height: "26px",
                  minWidth: "unset",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: lesson.isLinked
                      ? "rgba(255, 152, 0, 0.05)"
                      : "var(--primary-color-dark)",
                    borderColor: lesson.isLinked
                      ? "var(--warning-color)"
                      : "var(--primary-color-dark)",
                    boxShadow: "none",
                  },
                }}
                disabled={isUnlinkLoading}
              >
                {isUnlinkLoading ? (
                  <CircularProgress size={12} color="inherit" />
                ) : lesson.isLinked ? (
                  "Unlink"
                ) : (
                  "Link"
                )}
              </Button>

              {/* Move to Section */}
              {sectionID && sections?.length > 1 && (
                <>
                  <Tooltip title="Move to Section">
                    <IconButton
                      onClick={(e) => setMoveAnchorEl(e.currentTarget)}
                      size="small"
                      sx={{
                        width: 26,
                        height: 26,
                        color: "var(--text4)",
                        "&:hover": {
                          color: "var(--primary-color)",
                          backgroundColor: "rgba(24, 113, 99, 0.04)",
                        },
                      }}
                    >
                      <DriveFileMove sx={{ fontSize: "14px" }} />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={moveAnchorEl}
                    open={Boolean(moveAnchorEl)}
                    onClose={() => setMoveAnchorEl(null)}
                    PaperProps={{
                      sx: {
                        borderRadius: "8px",
                        minWidth: "160px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "var(--text4)",
                        padding: "4px 12px 2px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Move to
                    </Typography>
                    {sections
                      .filter((s) => s.id !== sectionID)
                      .map((s) => (
                        <MenuItem
                          key={s.id}
                          onClick={() => {
                            setMoveAnchorEl(null);
                            onMoveLesson(lesson.id, sectionID, s.id);
                          }}
                          sx={{
                            fontSize: "12px",
                            fontWeight: 600,
                            padding: "6px 12px",
                            "&:hover": {
                              backgroundColor: "rgba(24, 113, 99, 0.04)",
                              color: "var(--primary-color)",
                            },
                          }}
                        >
                          {s.title}
                        </MenuItem>
                      ))}
                  </Menu>
                </>
              )}

              <Tooltip title="Delete Lesson">
                <IconButton
                  onClick={openDeleteDialog}
                  size="small"
                  sx={{
                    width: 26,
                    height: 26,
                    color: "var(--text4)",
                    "&:hover": {
                      color: "#f44336",
                      backgroundColor: "rgba(244, 67, 54, 0.04)",
                    },
                  }}
                >
                  <Delete sx={{ fontSize: "14px" }} />
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
              sx={{ gap: "12px", width: "100%" }}
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
                  width: "100px",
                  fontWeight: 600,
                  fontSize: "12px",
                  height: "34px",
                }}
                disableElevation
              >
                {loading ? (
                  <CircularProgress size={16} sx={{ color: "var(--white)" }} />
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
                  width: "100px",
                  fontWeight: 600,
                  fontSize: "12px",
                  height: "34px",
                  "&:hover": {
                    borderColor: "var(--text3)",
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
