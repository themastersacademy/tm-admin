"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { apiFetch } from "@/src/lib/apiFetch";
import {
  Button,
  Collapse,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add,
  CreateNewFolder,
  Delete,
  DragIndicator,
  Edit,
  ExpandLess,
  ExpandMore,
  Check,
  Close,
} from "@mui/icons-material";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import LectureCard from "@/src/components/LectureCard/LectureCard";
import LessonCardSkeleton from "@/src/components/LessonCardSkeleton/LessonCardSkeleton";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const SECTION_DND_TYPE = "SECTION";

// Draggable Section Component (needs to be a real component for hooks)
function DraggableSection({
  section,
  sectionIndex,
  isCollapsed,
  isEditing,
  editingSectionTitle,
  setEditingSectionTitle,
  onToggle,
  onStartEdit,
  onRename,
  onCancelEdit,
  onDelete,
  onAddLesson,
  onMoveSection,
  onDropSection,
  lessonsById,
  renderLessonCard,
}) {
  const ref = useRef(null);

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    type: SECTION_DND_TYPE,
    item: { sectionIndex, id: section.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [{ isOver }, dropRef] = useDrop({
    accept: SECTION_DND_TYPE,
    hover: (draggedItem) => {
      if (draggedItem.sectionIndex !== sectionIndex) {
        onMoveSection(draggedItem.sectionIndex, sectionIndex);
        draggedItem.sectionIndex = sectionIndex;
      }
    },
    drop: (draggedItem) => {
      onDropSection();
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  previewRef(dropRef(ref));

  const sectionLessons = (section.lessonIDs || [])
    .map((id) => lessonsById[id])
    .filter(Boolean);

  return (
    <Stack
      ref={ref}
      sx={{
        border: isOver
          ? "1px solid var(--primary-color)"
          : "1px solid var(--border-color)",
        borderRadius: "8px",
        backgroundColor: "var(--white)",
        overflow: "hidden",
        opacity: isDragging ? 0.5 : 1,
        transition: "border-color 0.15s ease",
      }}
    >
      {/* Section Header */}
      <Stack
        direction="row"
        alignItems="center"
        gap="6px"
        sx={{
          padding: "8px 12px",
          backgroundColor: "rgba(24, 113, 99, 0.03)",
          borderBottom: isCollapsed
            ? "none"
            : "1px solid var(--border-color)",
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "rgba(24, 113, 99, 0.06)",
          },
        }}
        onClick={() => !isEditing && onToggle()}
      >
        {/* Drag Handle */}
        <IconButton
          ref={dragRef}
          disableRipple
          size="small"
          onClick={(e) => e.stopPropagation()}
          sx={{
            width: 22,
            height: 22,
            cursor: "grab",
            color: "var(--text4)",
            "&:hover": { color: "var(--text2)" },
          }}
        >
          <DragIndicator sx={{ fontSize: "14px" }} />
        </IconButton>

        <IconButton
          size="small"
          sx={{ width: 22, height: 22, color: "var(--text3)" }}
        >
          {isCollapsed ? (
            <ExpandMore sx={{ fontSize: "16px" }} />
          ) : (
            <ExpandLess sx={{ fontSize: "16px" }} />
          )}
        </IconButton>

        {isEditing ? (
          <Stack
            direction="row"
            alignItems="center"
            gap="4px"
            flex={1}
            onClick={(e) => e.stopPropagation()}
          >
            <TextField
              value={editingSectionTitle}
              onChange={(e) => setEditingSectionTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onRename();
                else if (e.key === "Escape") onCancelEdit();
              }}
              autoFocus
              size="small"
              sx={{
                flex: 1,
                "& .MuiInputBase-input": {
                  fontSize: "13px",
                  fontWeight: 600,
                  padding: "4px 8px",
                },
                "& .MuiOutlinedInput-root": {
                  height: "28px",
                  borderRadius: "6px",
                },
              }}
            />
            <IconButton
              size="small"
              onClick={onRename}
              sx={{ width: 22, height: 22, color: "var(--primary-color)" }}
            >
              <Check sx={{ fontSize: "14px" }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={onCancelEdit}
              sx={{ width: 22, height: 22, color: "var(--text4)" }}
            >
              <Close sx={{ fontSize: "14px" }} />
            </IconButton>
          </Stack>
        ) : (
          <>
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--text1)",
                flex: 1,
              }}
            >
              {section.title}
            </Typography>
            <Typography
              sx={{
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--text4)",
                backgroundColor: "var(--bg-color)",
                padding: "1px 6px",
                borderRadius: "4px",
                border: "1px solid var(--border-color)",
              }}
            >
              {sectionLessons.length} lessons
            </Typography>
          </>
        )}

        {!isEditing && (
          <Stack
            direction="row"
            gap="2px"
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton
              size="small"
              onClick={onStartEdit}
              sx={{
                width: 24,
                height: 24,
                color: "var(--text4)",
                "&:hover": { color: "var(--primary-color)" },
              }}
            >
              <Edit sx={{ fontSize: "13px" }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onAddLesson(section.id)}
              sx={{
                width: 24,
                height: 24,
                color: "var(--text4)",
                "&:hover": { color: "var(--primary-color)" },
              }}
            >
              <Add sx={{ fontSize: "14px" }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={onDelete}
              sx={{
                width: 24,
                height: 24,
                color: "var(--text4)",
                "&:hover": { color: "#f44336" },
              }}
            >
              <Delete sx={{ fontSize: "13px" }} />
            </IconButton>
          </Stack>
        )}
      </Stack>

      {/* Section Lessons */}
      <Collapse in={!isCollapsed}>
        <Stack gap="4px" sx={{ padding: "6px 8px" }}>
          {sectionLessons.length > 0 ? (
            sectionLessons.map((lesson, index) =>
              renderLessonCard(lesson, index, section.id)
            )
          ) : (
            <Typography
              sx={{
                fontSize: "12px",
                color: "var(--text4)",
                padding: "12px",
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              No lessons in this section. Click + to add one.
            </Typography>
          )}
          {(section.lessonIDs || []).includes("__loading__") && (
            <LessonCardSkeleton />
          )}
        </Stack>
      </Collapse>
    </Stack>
  );
}

export default function Videos({ course }) {
  const { showSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);
  const [lessons, setLessons] = useState([]);
  const [sections, setSections] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [editingSectionID, setEditingSectionID] = useState(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");

  const hasSections = sections.length > 0;

  // Build a lookup map for lessons
  const lessonsById = {};
  lessons.forEach((l) => {
    lessonsById[l.id] = l;
  });

  // Get lessons not in any section (backward compat)
  const sectionedIDs = new Set(sections.flatMap((s) => s.lessonIDs || []));
  const unsectionedLessons = lessons.filter((l) => !sectionedIDs.has(l.id));

  const fetchLesson = useCallback(async () => {
    try {
      const data = await apiFetch(`${BASE_URL}/api/goals/courses/lesson/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseID: course.id }),
      });
      if (data.success) {
        setLessons(data.data);
        setSections(data.sections || []);
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

  // Section API helper
  const sectionAction = useCallback(
    async (action, payload) => {
      try {
        const res = await apiFetch(
          `${BASE_URL}/api/goals/courses/section/update`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              courseID: course.id,
              goalID: course.goalID,
              action,
              payload,
            }),
          }
        );
        if (res.success) {
          setSections(res.sections);
        } else {
          showSnackbar(res.message || "Failed", "error", "", "3000");
        }
        return res;
      } catch (error) {
        console.error("Section action error:", error);
        showSnackbar("Failed to update section", "error", "", "3000");
      }
    },
    [course.id, course.goalID, showSnackbar]
  );

  const onAddSection = useCallback(async () => {
    if (!hasSections && lessons.length > 0) {
      await sectionAction("INIT_SECTIONS", {});
    }
    await sectionAction("CREATE_SECTION", { title: "New Section" });
  }, [hasSections, lessons.length, sectionAction]);

  const onRenameSection = useCallback(
    async (sectionID, title) => {
      if (!title.trim()) return;
      await sectionAction("RENAME_SECTION", { sectionID, title: title.trim() });
      setEditingSectionID(null);
    },
    [sectionAction]
  );

  const onDeleteSection = useCallback(
    async (sectionID) => {
      showSnackbar("Deleting section...", "loading", "", "");
      const res = await sectionAction("DELETE_SECTION", { sectionID });
      if (res?.success) {
        showSnackbar("Section deleted", "success", "", "3000");
        await fetchLesson();
      }
    },
    [sectionAction, showSnackbar, fetchLesson]
  );

  const toggleSection = useCallback((sectionID) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionID]: !prev[sectionID],
    }));
  }, []);

  // Section drag reorder (local state, persisted on drop)
  const moveSection = useCallback((fromIndex, toIndex) => {
    setSections((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  }, []);

  const persistSectionOrder = useCallback(async () => {
    try {
      await sectionAction("REORDER_SECTIONS", {
        sectionIDs: sections.map((s) => s.id),
      });
    } catch (error) {
      console.error("Error reordering sections:", error);
    }
  }, [sectionAction, sections]);

  // Move lesson between sections
  const onMoveLesson = useCallback(
    async (lessonID, fromSectionID, toSectionID) => {
      if (fromSectionID === toSectionID) return;
      showSnackbar("Moving...", "loading", "", "");
      const res = await sectionAction("MOVE_LESSON", {
        lessonID,
        fromSectionID,
        toSectionID,
      });
      if (res?.success) {
        showSnackbar("Moved", "success", "", "3000");
      }
    },
    [sectionAction, showSnackbar]
  );

  // Lesson operations
  const moveCard = useCallback((fromIndex, toIndex, sectionID) => {
    if (sectionID) {
      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== sectionID) return s;
          const updated = [...s.lessonIDs];
          const [moved] = updated.splice(fromIndex, 1);
          updated.splice(toIndex, 0, moved);
          return { ...s, lessonIDs: updated };
        })
      );
    } else {
      setLessons((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        return updated;
      });
    }
  }, []);

  const reorderLessons = useCallback(
    async ({ updatedLessons, sectionID }) => {
      try {
        let newSections = sections;
        let flatIDs;

        if (sectionID) {
          newSections = sections.map((s) =>
            s.id === sectionID
              ? { ...s, lessonIDs: updatedLessons.map((l) => l.id) }
              : s
          );
          flatIDs = newSections.flatMap((s) => s.lessonIDs || []);
        } else {
          flatIDs = updatedLessons.map((l) => l.id);
        }

        const res = await apiFetch(
          `${BASE_URL}/api/goals/courses/lesson/reorder`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              courseID: course.id,
              goalID: course.goalID,
              lessonIDs: flatIDs,
              sections: hasSections ? newSections : undefined,
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
    [course.id, course.goalID, showSnackbar, sections, hasSections]
  );

  const handleLessonUpdate = useCallback(
    async (e, id, courseID, params = {}) => {
      showSnackbar("Syncing...", "loading", "", "");
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

  const onAddLesson = useCallback(
    async (sectionID) => {
      if (sectionID) {
        setSections((prev) =>
          prev.map((s) =>
            s.id === sectionID
              ? { ...s, lessonIDs: [...s.lessonIDs, "__loading__"] }
              : s
          )
        );
      } else {
        setLessons((prev) => [...prev, { id: "", isLoading: true }]);
      }
      try {
        const res = await apiFetch(
          `${BASE_URL}/api/goals/courses/lesson/create`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ courseID: course.id, sectionID }),
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
    },
    [course.id, fetchLesson, showSnackbar]
  );

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

  const renderLessonCard = (lesson, index, sectionID) => {
    if (!lesson || lesson.isLoading) {
      return <LessonCardSkeleton key={`loading-${index}`} />;
    }
    return (
      <LectureCard
        key={lesson.id}
        index={index}
        lesson={lesson}
        course={course}
        handleLessonUpdate={handleLessonUpdate}
        handleUnlink={handleUnlink}
        deleteLesson={deleteLesson}
        moveCard={(from, to) => moveCard(from, to, sectionID)}
        reorderLessons={({ updatedLessons }) =>
          reorderLessons({ updatedLessons, sectionID })
        }
        lessons={
          sectionID
            ? (sections.find((s) => s.id === sectionID)?.lessonIDs || [])
                .map((id) => lessonsById[id])
                .filter(Boolean)
            : lessons
        }
        setLessons={setLessons}
        sectionID={sectionID}
        sections={sections}
        onMoveLesson={onMoveLesson}
      />
    );
  };

  return (
    <Stack gap="16px" sx={{ position: "relative" }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(8px)",
          padding: "10px 0",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <Stack direction="row" alignItems="center" gap="12px">
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--text1)",
            }}
          >
            Lessons
          </Typography>
          <Typography
            sx={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text4)",
              backgroundColor: "var(--bg-color)",
              padding: "2px 8px",
              borderRadius: "4px",
              border: "1px solid var(--border-color)",
            }}
          >
            {lessons?.length || 0} lessons
            {course.duration ? ` · ${course.duration} hrs` : ""}
          </Typography>
        </Stack>
        <Stack direction="row" gap="6px">
          <Button
            variant="outlined"
            onClick={onAddSection}
            startIcon={<CreateNewFolder sx={{ fontSize: "14px" }} />}
            disableElevation
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              padding: "5px 12px",
              fontWeight: 600,
              fontSize: "12px",
              height: "32px",
              borderColor: "var(--border-color)",
              color: "var(--text2)",
              "&:hover": {
                borderColor: "var(--primary-color)",
                color: "var(--primary-color)",
                backgroundColor: "rgba(24, 113, 99, 0.04)",
              },
            }}
          >
            Add Section
          </Button>
          {!hasSections && (
            <Button
              variant="contained"
              onClick={() => onAddLesson()}
              startIcon={<Add sx={{ fontSize: "16px" }} />}
              disableElevation
              sx={{
                backgroundColor: "var(--primary-color)",
                textTransform: "none",
                borderRadius: "8px",
                padding: "5px 16px",
                fontWeight: 600,
                fontSize: "12px",
                height: "32px",
                "&:hover": { backgroundColor: "var(--primary-color-dark)" },
              }}
            >
              Add Lesson
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Content */}
      <Stack gap="8px" sx={{ minHeight: "300px" }}>
        <DndProvider backend={HTML5Backend}>
          {!isLoading ? (
            hasSections ? (
              <>
                {sections.map((section, sectionIndex) => (
                  <DraggableSection
                    key={section.id}
                    section={section}
                    sectionIndex={sectionIndex}
                    isCollapsed={!expandedSections[section.id]}
                    isEditing={editingSectionID === section.id}
                    editingSectionTitle={editingSectionTitle}
                    setEditingSectionTitle={setEditingSectionTitle}
                    onToggle={() => toggleSection(section.id)}
                    onStartEdit={() => {
                      setEditingSectionID(section.id);
                      setEditingSectionTitle(section.title);
                    }}
                    onRename={() =>
                      onRenameSection(section.id, editingSectionTitle)
                    }
                    onCancelEdit={() => setEditingSectionID(null)}
                    onDelete={() => onDeleteSection(section.id)}
                    onAddLesson={onAddLesson}
                    onMoveSection={moveSection}
                    onDropSection={persistSectionOrder}
                    lessonsById={lessonsById}
                    renderLessonCard={renderLessonCard}
                  />
                ))}
                {/* Unsectioned lessons (edge case) */}
                {unsectionedLessons.length > 0 && (
                  <Stack
                    sx={{
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      backgroundColor: "var(--white)",
                      overflow: "hidden",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      gap="8px"
                      sx={{
                        padding: "8px 12px",
                        backgroundColor: "rgba(0, 0, 0, 0.02)",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "var(--text3)",
                          flex: 1,
                        }}
                      >
                        Unsectioned
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "var(--text4)",
                        }}
                      >
                        {unsectionedLessons.length} lessons
                      </Typography>
                    </Stack>
                    <Stack gap="4px" sx={{ padding: "6px 8px" }}>
                      {unsectionedLessons.map((lesson, index) =>
                        renderLessonCard(lesson, index, null)
                      )}
                    </Stack>
                  </Stack>
                )}
              </>
            ) : lessons?.length ? (
              lessons.map((item, index) =>
                item.isLoading ? (
                  <LessonCardSkeleton key={index} />
                ) : (
                  renderLessonCard(item, index, null)
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
