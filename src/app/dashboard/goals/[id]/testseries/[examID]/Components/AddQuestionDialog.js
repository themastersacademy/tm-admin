"use client";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import PreviewStepper from "@/src/app/dashboard/library/allQuestions/addQuestion/Components/PreviewStepper";
import QuestionCard from "@/src/components/QuestionCard/QuestionCard";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import LongDialogBox from "@/src/components/LongDialogBox/LongDialogBox";
import MDPreview from "@/src/components/MarkdownPreview/MarkdownPreview";
import { apiFetch } from "@/src/lib/apiFetch";
import { Close, Visibility } from "@mui/icons-material";
import {
  Checkbox,
  Chip,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import FilterQuestions from "./FilterQuestions";

// Memoized Row Component to prevent unnecessary re-renders
const QuestionRow = ({
  item,
  index,
  isSelected,
  isAlreadyAdded,
  onSelect,
  onPreview,
}) => {
  return (
    <QuestionCard
      questionNumber={`Q${index + 1}`}
      questionType={item.type || ""}
      Subject={item.subjectTitle || "Unknown"}
      question={<MDPreview value={item.title || ""} />}
      difficulty={item.difficultyLevel}
      preview={
        <Stack flexDirection="row" gap="8px" alignItems="center">
          {isAlreadyAdded && (
            <Chip
              label="Already Added"
              size="small"
              sx={{
                height: "22px",
                fontSize: "10px",
                fontWeight: 700,
                backgroundColor: "rgba(255, 152, 0, 0.12)",
                color: "#FF9800",
                border: "1px solid rgba(255, 152, 0, 0.3)",
              }}
            />
          )}
          <Chip
            icon={<Visibility sx={{ fontSize: "14px" }} />}
            label="Preview"
            onClick={() => onPreview(item)}
            sx={{
              fontSize: "11px",
              fontFamily: "Lato",
              fontWeight: 600,
              height: "24px",
              backgroundColor: "transparent",
              color: "var(--text2)",
              border: "1px solid var(--border-color)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "rgba(255, 152, 0, 0.08)",
                borderColor: "#FF9800",
                color: "#FF9800",
              },
            }}
          />
        </Stack>
      }
      check={
        <Checkbox
          checked={isSelected}
          onChange={() => onSelect(item)}
          disabled={isAlreadyAdded}
          sx={{
            color: "#FF9800",
            "&.Mui-checked": {
              color: "#FF9800",
            },
            "&.MuiCheckbox-root": {
              padding: "0px",
            },
            "&.Mui-disabled": {
              color: "var(--text3)",
            },
          }}
        />
      }
      isSelected={isSelected}
      onSelect={() => onSelect(item)}
      subjectID={item.subjectID}
    />
  );
};

// Custom comparison function for React.memo
const arePropsEqual = (prevProps, nextProps) => {
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isAlreadyAdded === nextProps.isAlreadyAdded &&
    prevProps.item.id === nextProps.item.id &&
    prevProps.index === nextProps.index
  );
};

const MemoizedQuestionRow = React.memo(QuestionRow, arePropsEqual);

export default function AddQuestionDialog({
  isDialogOpen,
  handleDialogClose,
  questionList,
  examID,
  goalID,
  sectionIndex,
  tempTitle,
  fetchQuestions,
  type,
  allSections,
}) {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isPreviewDialog, setIsPreviewDialog] = useState(false);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(20); // Initial load count
  const observerTarget = useRef(null);
  const { showSnackbar } = useSnackbar();

  const previewDialogOpen = useCallback((question) => {
    setSelectedQuestions(question);
    setIsPreviewDialog(true);
  }, []);

  const previewDialogClose = () => {
    setIsPreviewDialog(false);
  };

  const handleSelectQuestion = useCallback((question) => {
    setSelectedQuestions((prevSelected) =>
      Array.isArray(prevSelected)
        ? prevSelected.some((q) => q.id === question.id)
          ? prevSelected.filter((q) => q.id !== question.id)
          : [...prevSelected, question]
        : [question]
    );
  }, []);

  const handleAddQuestions = () => {
    if (!selectedQuestions.length) {
      showSnackbar("Please select at least one question", "error", "", "3000");
      return;
    }

    // Check for duplicate questions in other sections
    if (allSections && allSections.length > 0) {
      const existingQuestionIds = new Set();
      allSections.forEach((section, idx) => {
        if (idx !== sectionIndex && section.questions) {
          section.questions.forEach((q) => {
            existingQuestionIds.add(q.questionID || q.id);
          });
        }
      });

      const duplicates = selectedQuestions.filter((q) =>
        existingQuestionIds.has(q.id)
      );

      if (duplicates.length > 0) {
        showSnackbar(
          `${duplicates.length} question(s) already exist in another section. Please deselect them.`,
          "error",
          "",
          "5000"
        );
        return;
      }
    }

    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/add-questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goalID: goalID,
        examID: examID,
        type: type,
        sectionIndex: sectionIndex,
        questions: selectedQuestions.map((q) => ({
          questionID: q.id,
          subjectID: q.subjectID,
        })),
      }),
    }).then((data) => {
      if (data.success) {
        setSelectedQuestions([]);
        showSnackbar(data.message, "success", "", "3000");
        handleDialogClose();
        fetchQuestions();
      } else {
        // Check if this is a duplicate question error
        if (
          data.message?.includes("duplicate") ||
          data.message?.includes("already exists")
        ) {
          showSnackbar(
            "One or more questions already exist in another section",
            "error",
            "",
            "5000"
          );
        } else {
          showSnackbar(data.message, "error", "", "3000");
        }
      }
    });
  };

  const questionsInOtherSections = useMemo(() => {
    const ids = new Set();
    if (allSections && allSections.length > 0) {
      allSections.forEach((section, idx) => {
        if (idx !== sectionIndex && section.questions) {
          section.questions.forEach((q) => {
            ids.add(q.questionID || q.id);
          });
        }
      });
    }
    return ids;
  }, [allSections, sectionIndex]);

  // Auto-deselect questions that are already in other sections
  useEffect(() => {
    if (questionsInOtherSections.size > 0 && selectedQuestions.length > 0) {
      const filtered = selectedQuestions.filter(
        (q) => !questionsInOtherSections.has(q.id)
      );
      if (filtered.length !== selectedQuestions.length) {
        setSelectedQuestions(filtered);
      }
    }
  }, [questionsInOtherSections, selectedQuestions]);

  // Reset displayed count when filters or list changes
  useEffect(() => {
    setDisplayedCount(20);
  }, [isFilterApplied, filteredQuestions, questionList]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayedCount((prev) => prev + 20);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [filteredQuestions, questionList]);

  const currentList = isFilterApplied ? filteredQuestions : questionList;
  const visibleQuestions = currentList.slice(0, displayedCount);

  // Create a Set of selected IDs for O(1) lookup
  const selectedIds = useMemo(() => {
    if (!Array.isArray(selectedQuestions)) return new Set();
    return new Set(selectedQuestions.map((q) => q.id));
  }, [selectedQuestions]);

  return (
    <Stack>
      <LongDialogBox
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        title={`Add to ${tempTitle}`}
      >
        <DialogContent>
          <Stack gap="20px">
            <FilterQuestions
              handleAddQuestions={handleAddQuestions}
              questionList={questionList}
              selectedQuestions={selectedQuestions}
              onFilteredQuestions={(filtered) => {
                setFilteredQuestions(filtered);
                setIsFilterApplied(true);
              }}
              setSelectedQuestions={setSelectedQuestions}
            />
            <Stack gap="15px">
              {isFilterApplied && filteredQuestions.length === 0 ? (
                <Typography
                  sx={{
                    marginTop: "20px",
                  }}
                  textAlign="center"
                >
                  No questions found for selected filters.
                </Typography>
              ) : (
                <>
                  {visibleQuestions.map((item, index) => (
                    <MemoizedQuestionRow
                      key={item.id || index}
                      item={item}
                      index={index}
                      isSelected={selectedIds.has(item.id)}
                      isAlreadyAdded={questionsInOtherSections.has(item.id)}
                      onSelect={handleSelectQuestion}
                      onPreview={previewDialogOpen}
                    />
                  ))}
                  {/* Sentinel element for infinite scroll */}
                  {visibleQuestions.length < currentList.length && (
                    <div
                      ref={observerTarget}
                      style={{ height: "20px", margin: "10px 0" }}
                    />
                  )}
                </>
              )}
            </Stack>
          </Stack>
        </DialogContent>
      </LongDialogBox>
      {/* {preview dialog} */}
      <DialogBox
        title="Preview"
        isOpen={isPreviewDialog}
        icon={
          <IconButton
            sx={{ borderRadius: "4px", padding: "3px", marginLeft: "auto" }}
            onClick={previewDialogClose}
          >
            <Close sx={{ color: "var(--text2)" }} />
          </IconButton>
        }
      >
        <Stack sx={{ width: "100%" }}>
          {<PreviewStepper questionData={selectedQuestions} />}
        </Stack>
      </DialogBox>
    </Stack>
  );
}
