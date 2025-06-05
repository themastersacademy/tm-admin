import { Stack, Checkbox, Typography, Chip, IconButton } from "@mui/material";
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

  const selectAllQuestions = (ids) => {
    setSelectedQuestions(ids);
  };

  const deselectAllQuestions = () => {
    setSelectedQuestions([]);
  };

  const toggleQuestionSelection = (id, checked) => {
    if (checked) {
      setSelectedQuestions((prev) => [...prev, id]);
    } else {
      setSelectedQuestions((prev) => prev.filter((qid) => qid !== id));
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
    selectedQuestions.length === questions.length && questions.length > 0;
  const isIndeterminate =
    selectedQuestions.length > 0 && selectedQuestions.length < questions.length;

  return (
    <Stack gap="15px">
      <Stack flexDirection="row" alignItems="center" gap="8px">
        <Checkbox
          checked={allSelected}
          indeterminate={isIndeterminate}
          onChange={(event) => {
            event.target.checked
              ? selectAllQuestions(questions.map((q) => q.id))
              : deselectAllQuestions(questions.map((q) => q.id));
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
      ) : questions.length ? (
        questions.map((item, index) => (
          <QuestionCard
            key={index}
            questionNumber={`Q${index + 1}`}
            questionType={item.type || "MCQ"}
            Subject={item.subjectTitle || "Unknown"}
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
                  selectedQuestions.includes(item.id)
                }
                onChange={(event) =>
                  toggleQuestionSelection(item.id, event.target.checked)
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
        ))
      ) : (
        <Typography sx={titleStyles} textAlign="center">
          No questions added yet.
        </Typography>
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
