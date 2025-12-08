import { Stack, Checkbox, Typography, Chip, IconButton } from "@mui/material";
import { useMemo } from "react";
import { Delete, Visibility } from "@mui/icons-material";
import MDPreview from "@/src/components/MarkdownPreview/MarkdownPreview";
import QuestionCard from "@/src/components/QuestionCard/QuestionCard";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import QuestionCardSkeleton from "@/src/components/QuestionCardSkeleton/QuestionCardSkeleton";

const QuestionList = ({
  questions,
  previewDialogOpen,
  goalID,
  examID,
  sectionIndex,
  selectedQuestions,
  setSelectedQuestions,
  fetchQuestions,
  isLoading,
  type,
  isLive,
}) => {
  const { showSnackbar } = useSnackbar();

  // Deduplicate questions to prevent key errors and fix missing questions
  const uniqueQuestions = useMemo(() => {
    const unique = [];
    const seenIds = new Set();

    if (!questions || !questions.length) return [];

    questions.forEach((item, index) => {
      // CRITICAL FIX: Do NOT use item.id as fallback because it is the SubjectID!
      // Only use questionID or sKey (which contains questionID)
      let questionID = item.questionID || item.sKey?.split("#")[1];
      
      // If ID is missing or we've seen it before, generate a unique fallback ID
      if (!questionID || seenIds.has(questionID)) {
        // Use item.id (SubjectID) + index as fallback, or just fallback + index
        const baseID = item.id || "unknown";
        questionID = `${baseID}_${index}`;
      }
      
      seenIds.add(questionID);
      unique.push({ ...item, uniqueID: questionID });
    });
    return unique;
  }, [questions]);

  const selectAllQuestions = (ids) => {
    setSelectedQuestions(ids);
  };

  const deselectAllQuestions = () => {
    setSelectedQuestions([]);
  };

  const toggleQuestionSelection = (questionID, checked) => {
    if (checked) {
      setSelectedQuestions((prev) => [...prev, questionID]);
    } else {
      setSelectedQuestions((prev) => prev.filter((qid) => qid !== questionID));
    }
  };

  const handleDeleteQuestions = async () => {
    if (selectedQuestions.length === 0) {
      showSnackbar("No questions selected!", "error", "", "3000");
      return;
    }

    const formattedQuestionIDs = selectedQuestions;

    const response = await apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/remove-question`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalID: goalID,
          examID: examID,
          type: type,
          sectionIndex: sectionIndex,
          questionIDs: formattedQuestionIDs,
        }),
      }
    );

    if (response.success) {
      setSelectedQuestions([]);
      fetchQuestions();
    }
  };

  const allSelected =
    selectedQuestions.length === uniqueQuestions.length &&
    uniqueQuestions.length > 0;
  const isIndeterminate =
    selectedQuestions.length > 0 &&
    selectedQuestions.length < uniqueQuestions.length;

  return (
    <Stack gap="15px">
      <Stack flexDirection="row" alignItems="center" gap="8px">
        <Checkbox
          checked={allSelected}
          indeterminate={isIndeterminate}
          onChange={(event) => {
            event.target.checked
              ? selectAllQuestions(uniqueQuestions.map((q) => q.uniqueID))
              : deselectAllQuestions();
          }}
          sx={{
            color: "var(--sec-color)",
            padding: "3px",
            "&.Mui-checked": { color: "var(--sec-color)" },
            "&.MuiCheckbox-indeterminate": { color: "var(--sec-color)" },
          }}
          disabled={isLive}
        />
        <Typography sx={titleStyles}>
          Select All (Selected: {selectedQuestions.length})
        </Typography>
        <IconButton
          disabled={!selectedQuestions.length}
          onClick={handleDeleteQuestions}
        >
          <Delete sx={{ color: "var(--delete-color)" }} />
        </IconButton>
      </Stack>
      {isLoading ? (
        <QuestionCardSkeleton />
      ) : uniqueQuestions.length ? (
        uniqueQuestions.map((item, index) => {
          // Robust ID extraction: try questionID, then sKey, then id, then fallback to index
          // We use index in the key to ensure React can always render the list
          const realID = item.questionID || item.sKey?.split("#")[1] || item.id;
          const uniqueKey = realID ? `${realID}_${index}` : `question_${index}`;
          const selectionID = realID || uniqueKey;

          // Extract subjectTitle - check multiple possible locations
          const subjectTitle =
            item.subjectTitle ||
            item.subject?.title ||
            item.subjectName ||
            "Unknown";

          return (
            <QuestionCard
              key={uniqueKey}
              questionNumber={`Q${index + 1}`}
              questionType={item.type || "MCQ"}
              Subject={subjectTitle}
              subjectID={item.subjectID}
              question={<MDPreview value={item.title} />}
              difficulty={item.difficultyLevel}
              preview={
                <Chip
                  icon={<Visibility sx={{ fontSize: "small" }} />}
                  onClick={() => previewDialogOpen(item)}
                  label="Preview"
                  sx={previewChipStyles}
                />
              }
              check={
                <Checkbox
                  checked={
                    Array.isArray(selectedQuestions) &&
                    selectedQuestions.includes(selectionID)
                  }
                  onChange={(event) =>
                    toggleQuestionSelection(
                      selectionID,
                      event.target.checked
                    )
                  }
                  sx={{
                    color: "var(--sec-color)",
                    "&.Mui-checked": { color: "var(--sec-color)" },
                    "&.MuiCheckbox-root": {
                      padding: "0px",
                    },
                  }}
                  disabled={isLive}
                />
              }
              isLive={isLive}
            />
          );
        })
      ) : (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            padding: "40px 20px",
            backgroundColor: "rgba(255, 152, 0, 0.02)",
            borderRadius: "12px",
            border: "1px dashed rgba(255, 152, 0, 0.3)",
            minHeight: "200px",
          }}
        >
          <Stack
            alignItems="center"
            gap="16px"
            sx={{ maxWidth: "400px", textAlign: "center" }}
          >
            {/* Empty State Icon */}
            <Stack
              sx={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(245, 124, 0, 0.05) 100%)",
                border: "2px solid rgba(255, 152, 0, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Visibility
                sx={{ fontSize: "40px", color: "rgba(255, 152, 0, 0.6)" }}
              />
            </Stack>

            {/* Empty State Text */}
            <Stack gap="8px">
              <Typography
                sx={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "var(--text1)",
                  fontFamily: "Lato",
                }}
              >
                No Questions Added Yet
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: "400",
                  color: "var(--text3)",
                  fontFamily: "Lato",
                  lineHeight: 1.5,
                }}
              >
                Click the &quot;Add Questions&quot; button above to start adding
                questions to this section.
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

const titleStyles = {
  fontFamily: "Lato",
  fontSize: "16px",
  fontWeight: "700",
  color: "var(--text3)",
};

const previewChipStyles = {
  fontSize: "10px",
  fontFamily: "Lato",
  fontWeight: "700",
  height: "20px",
  backgroundColor: "var(--border-color)",
  color: "var(--text3)",
};

export default QuestionList;
