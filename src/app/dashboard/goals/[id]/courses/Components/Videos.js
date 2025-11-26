"use client";
import { useState, useEffect, useCallback } from "react";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { apiFetch } from "@/src/lib/apiFetch";
import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import LectureCard from "@/src/components/LectureCard/LectureCard";
import LessonCardSkeleton from "@/src/components/LessonCardSkeleton/LessonCardSkeleton";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function Videos({ course }) {
  const { showSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);
  const [lessons, setLessons] = useState([]);

  const moveCard = useCallback((fromIndex, toIndex) => {
    setLessons((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  }, []);

  const fetchLesson = useCallback(async () => {
    try {
      const data = await apiFetch(`${BASE_URL}/api/goals/courses/lesson/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseID: course.id }),
      });
      if (data.success) {
        setLessons(data.data);
      }
    } catch (error) {
      console.error("Fetch lesson error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [course.id]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  const reorderLessons = useCallback(
    async ({ updatedLessons }) => {
      try {
        const res = await apiFetch(
          `${BASE_URL}/api/goals/courses/lesson/reorder`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              courseID: course.id,
              goalID: course.goalID,
              lessonIDs: updatedLessons.map((l) => l.id),
            }),
          }
        );
        showSnackbar(
          res.message,
          res.success ? "success" : "error",
          "",
          "3000"
        );
      } catch (error) {
        console.error("Reorder lessons error:", error);
      }
    },
    [course.id, course.goalID, showSnackbar]
  );

  const handleLessonUpdate = useCallback(
    async (e, id, courseID, params = {}) => {
      showSnackbar(
        "Syncing",
        "",
        <CircularProgress size={20} sx={{ color: "var(--primary-color)" }} />,
        ""
      );
      try {
        const res = await apiFetch(
          `${BASE_URL}/api/goals/courses/lesson/update`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lessonID: id, courseID, ...params }),
          }
        );
        if (res && res.success) {
          await fetchLesson();
          showSnackbar("Synced", "success", "", "3000");
        } else {
          showSnackbar(res?.message || "Update failed", "error", "", "3000");
        }
      } catch (error) {
        console.error("Update lesson error:", error);
        showSnackbar("Update failed", "error", "", "3000");
      }
    },
    [fetchLesson, showSnackbar]
  );

  const handleUnlink = useCallback(
    async (setIsUnlinkLoading, lessonID, courseID, resourceID) => {
      try {
        const res = await apiFetch(
          `${BASE_URL}/api/goals/courses/lesson/unlink`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lessonID, courseID, resourceID }),
          }
        );
        if (res.success) {
          setIsUnlinkLoading(false);
          showSnackbar(res.message, "success", "", "3000");
          fetchLesson();
        } else {
          showSnackbar(res.message, "error", "", "3000");
        }
      } catch (error) {
        console.error("Error unlinking lesson:", error);
        showSnackbar("Failed to unlink resource", "error", "", "3000");
      }
    },
    [fetchLesson, showSnackbar]
  );

  const onAddLesson = useCallback(async () => {
    setLessons((prev) => [...prev, { id: "", isLoading: true }]);
    try {
      const res = await apiFetch(
        `${BASE_URL}/api/goals/courses/lesson/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseID: course.id }),
        }
      );
      if (res.success) {
        await fetchLesson();
      } else {
        showSnackbar(res.message, "error", "", "3000");
      }
    } catch (error) {
      console.error("Error adding lesson:", error);
      showSnackbar("Failed to add lesson", "error", "", "3000");
    }
  }, [course.id, fetchLesson, showSnackbar]);

  const deleteLesson = useCallback(
    async ({ lessonID, goalID, setLoading, deleteDialogClose }) => {
      setLoading(true);
      try {
        const res = await apiFetch(
          `${BASE_URL}/api/goals/courses/lesson/delete`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ courseID: course.id, lessonID, goalID }),
          }
        );
        if (res.success) {
          showSnackbar(res.message, "success", "", "3000");
          deleteDialogClose();
          await fetchLesson();
        } else {
          showSnackbar(res.message, "error", "", "3000");
        }
      } catch (error) {
        console.error("Error deleting lesson:", error);
        showSnackbar("Failed to delete lesson", "error", "", "3000");
      } finally {
        setLoading(false);
      }
    },
    [course.id, fetchLesson, showSnackbar]
  );

  return (
    <Stack gap="24px" sx={{ position: "relative" }}>
      {/* Sticky Header Section */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(8px)",
          padding: "16px 0",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <Stack gap="4px">
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text1)",
            }}
          >
            Course Content
          </Typography>
          <Typography
            sx={{ fontFamily: "Lato", fontSize: "14px", color: "var(--text3)" }}
          >
            Manage your course lessons and structure
          </Typography>
        </Stack>
        <Button
          variant="contained"
          onClick={onAddLesson}
          startIcon={<Add />}
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
            borderRadius: "8px",
            padding: "8px 24px",
            fontWeight: 600,
            fontFamily: "Lato",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
          disableElevation
        >
          Add Lesson
        </Button>
      </Stack>

      {/* Stats Bar */}
      <Stack
        direction="row"
        gap="24px"
        sx={{
          padding: "16px",
          backgroundColor: "var(--bg-color)",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
        }}
      >
        <Stack direction="row" gap="12px" alignItems="center">
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--text3)",
            }}
          >
            Total Lessons:
          </Typography>
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "16px",
              fontWeight: 800,
              color: "var(--text1)",
            }}
          >
            {lessons?.length || 0}
          </Typography>
        </Stack>
        <Stack direction="row" gap="12px" alignItems="center">
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--text3)",
            }}
          >
            Total Duration:
          </Typography>
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "16px",
              fontWeight: 800,
              color: "var(--text1)",
            }}
          >
            {/* Calculate duration if available, otherwise placeholder or course duration */}
            {course.duration ? `${course.duration} Hours` : "N/A"}
          </Typography>
        </Stack>
      </Stack>

      {/* Lessons List */}
      <Stack gap="16px" sx={{ minHeight: "300px" }}>
        <DndProvider backend={HTML5Backend}>
          {!isLoading ? (
            lessons?.length ? (
              lessons.map((item, index) =>
                item.isLoading ? (
                  <LessonCardSkeleton key={index} />
                ) : (
                  <LectureCard
                    key={index}
                    index={index}
                    lesson={item}
                    course={course}
                    handleLessonUpdate={handleLessonUpdate}
                    handleUnlink={handleUnlink}
                    deleteLesson={deleteLesson}
                    moveCard={moveCard}
                    reorderLessons={reorderLessons}
                    lessons={lessons}
                    setLessons={setLessons}
                  />
                )
              )
            ) : (
              <NoDataFound
                info="No lessons created yet"
                subInfo="Click 'Add Lesson' to start building your course content."
              />
            )
          ) : (
            Array.from({ length: 3 }, (_, index) => (
              <LessonCardSkeleton key={index} />
            ))
          )}
        </DndProvider>
      </Stack>
    </Stack>
  );
}
