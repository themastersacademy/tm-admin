"use client";
import { useState, useEffect, useCallback } from "react";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { apiFetch } from "@/src/lib/apiFetch";
import { Button, CircularProgress, Stack } from "@mui/material";
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
    <Stack mt="20px" gap="20px">
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Button
          variant="contained"
          onClick={onAddLesson}
          sx={{
            backgroundColor: "var(--sec-color-acc-1)",
            color: "var(--sec-color)",
            textTransform: "none",
            height: "30px",
            ml: "auto",
          }}
          disableElevation
        >
          Add Component
        </Button>
      </Stack>
      <Stack gap="10px">
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
              <NoDataFound info="No lesson created" />
            )
          ) : (
            Array.from({ length: 4 }, (_, index) => (
              <LessonCardSkeleton key={index} />
            ))
          )}
        </DndProvider>
      </Stack>
    </Stack>
  );
}
