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
} from "@mui/material";
import { useState } from "react";
import FilterQuestions from "./FilterQuestions";

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
}) {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isPreviewDialog, setIsPreviewDialog] = useState(false);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const { showSnackbar } = useSnackbar();

  const previewDialogOpen = (question) => {
    setSelectedQuestions(question);
    setIsPreviewDialog(true);
  };
  const previewDialogClose = () => {
    setIsPreviewDialog(false);
  };

  const handleSelectQuestion = (question) => {
    setSelectedQuestions((prevSelected) =>
      Array.isArray(prevSelected)
        ? prevSelected.some((q) => q.id === question.id)
          ? prevSelected.filter((q) => q.id !== question.id)
          : [...prevSelected, question]
        : [question]
    );
  };

  const handleAddQuestions = () => {
    if (!selectedQuestions.length) {
      showSnackbar("Please select at least one question", "error", "", "3000");
      return;
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
        setSelectedQuestions((prevSelected) => {
          return prevSelected;
        });
        showSnackbar(data.message, "success", "", "3000");
        handleDialogClose();
        fetchQuestions();
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
    });
  };

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
                (isFilterApplied ? filteredQuestions : questionList).map(
                  (item, index) => (
                    <QuestionCard
                      key={index}
                      questionNumber={`Q${index + 1}`}
                      questionType={item.type || ""}
                      Subject={item.subjectTitle || "Unknown"}
                      question={<MDPreview value={item.title || ""} />}
                      difficulty={item.difficultyLevel}
                      preview={
                        <Chip
                          icon={<Visibility sx={{ fontSize: "small" }} />}
                          label="Preview"
                          onClick={() => previewDialogOpen(item)}
                          sx={{
                            fontSize: "10px",
                            fontFamily: "Lato",
                            fontWeight: "700",
                            height: "20px",
                            backgroundColor: "var(--border-color)",
                            color: "var(--text3)",
                          }}
                        />
                      }
                      check={
                        <Checkbox
                          checked={
                            Array.isArray(selectedQuestions) &&
                            selectedQuestions.some((q) => q.id === item.id)
                          }
                          onChange={() => handleSelectQuestion(item)}
                          sx={{
                            color: "var(--sec-color)",
                            "&.Mui-checked": { color: "var(--sec-color)" },
                            "&.MuiCheckbox-root": {
                              padding: "0px",
                            },
                          }}
                        />
                      }
                      isSelected={
                        Array.isArray(selectedQuestions) &&
                        selectedQuestions.some((q) => q.id === item.id)
                      }
                      onSelect={() => handleSelectQuestion(item)}
                      subjectID={item.subjectID}
                    />
                  )
                )
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
