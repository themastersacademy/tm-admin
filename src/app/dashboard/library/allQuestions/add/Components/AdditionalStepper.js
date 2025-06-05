"use client";
import { useCallback } from "react";
import { Add, DeleteForever } from "@mui/icons-material";
import { Button, Checkbox, IconButton, Stack, Typography } from "@mui/material";
import MarkdownEditor from "@/src/components/MarkdownEditor/MarkdownEditor";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";

export default function AdditionalStepper({ questionData, setQuestionData }) {
  // Helper to update state immutably
  const updateQuestionData = useCallback(
    (updateFn) => {
      setQuestionData((prev) => ({
        ...prev,
        question: updateFn(prev.question),
      }));
    },
    [setQuestionData]
  );

  // Handler to add an option or blank
  const handleAddOption = useCallback(() => {
    updateQuestionData((q) => {
      if (q.type === "FIB") {
        const newOptions = [...q.options, { weightage: 100 }];
        // Recalculate equal weightage for blanks
        const weight = 100 / newOptions.length;
        const recalculatedOptions = newOptions.map((opt) => ({
          ...opt,
          weightage: weight,
        }));
        return {
          ...q,
          noOfBlanks: q.noOfBlanks + 1,
          options: recalculatedOptions,
          correctAnswers: {
            ...q.correctAnswers,
            ["blank" + newOptions.length]: "",
          },
        };
      } else {
        const newOptions = [
          ...q.options,
          { title: "", isCorrect: false, weightage: 0 },
        ];
        return {
          ...q,
          options: newOptions,
          correctAnswers: {
            ...q.correctAnswers,
            ["option" + newOptions.length]: false,
          },
        };
      }
    });
  }, [updateQuestionData]);

  // Handler to remove an option/blank at index and re-index correctAnswers accordingly
  const handleRemoveOption = useCallback(
    (index) => {
      updateQuestionData((q) => {
        const { type, options, correctAnswers } = q;
        const newOptions = options.filter((_, i) => i !== index);
        let newCorrectAnswers = {};

        if (type === "FIB") {
          // Re-index blank keys
          for (let i = 0; i < newOptions.length; i++) {
            newCorrectAnswers["blank" + (i + 1)] =
              q.correctAnswers["blank" + (i + 1)] || "";
          }
          return {
            ...q,
            options: newOptions,
            noOfBlanks: newOptions.length,
            correctAnswers: newCorrectAnswers,
          };
        } else {
          newOptions.forEach((opt, i) => {
            newCorrectAnswers["option" + (i + 1)] = opt.isCorrect;
          });
          return {
            ...q,
            options: newOptions,
            correctAnswers: newCorrectAnswers,
          };
        }
      });
    },
    [updateQuestionData]
  );

  // Handler for checkboxes in MCQ and MSQ
  const handleCheckBox = useCallback(
    (checked, index) => {
      updateQuestionData((q) => {
        const newOptions = q.options.map((option, i) => {
          if (q.type === "MCQ") {
            // For MCQ: Only one option may be correct.
            return i === index
              ? { ...option, isCorrect: checked, weightage: checked ? 100 : 0 }
              : { ...option, isCorrect: false, weightage: 0 };
          } else if (q.type === "MSQ") {
            // For MSQ: Toggle the option and recalc weightage.
            const updated =
              i === index ? { ...option, isCorrect: checked } : option;
            return updated;
          }
          return option;
        });

        let newCorrectAnswers = {};
        if (q.type === "MCQ") {
          newOptions.forEach((option, i) => {
            newCorrectAnswers["option" + (i + 1)] = option.isCorrect;
          });
        } else if (q.type === "MSQ") {
          newOptions.forEach((option, i) => {
            newCorrectAnswers["option" + (i + 1)] = option.isCorrect;
          });
          const totalCorrect = newOptions.filter((opt) => opt.isCorrect).length;
          newOptions.forEach((option, i) => {
            newOptions[i].weightage =
              option.isCorrect && totalCorrect > 0 ? 100 / totalCorrect : 0;
          });
        }
        return { ...q, options: newOptions, correctAnswers: newCorrectAnswers };
      });
    },
    [updateQuestionData]
  );

  // Handler for changing text in the blank (for FIB) or option title (for others)
  const handleTextChange = useCallback(
    (content, index, isFib) => {
      if (content.length > 100) return;
      updateQuestionData((q) => {
        if (isFib) {
          return {
            ...q,
            correctAnswers: {
              ...q.correctAnswers,
              ["blank" + (index + 1)]: content,
            },
          };
        } else {
          const newOptions = q.options.map((option, i) =>
            i === index ? { ...option, title: content } : option
          );
          // For non-FIB, we assume that setting the option title means marking it as correct.
          return {
            ...q,
            options: newOptions,
            correctAnswers: {
              ...q.correctAnswers,
              ["option" + (index + 1)]: true,
            },
          };
        }
      });
    },
    [updateQuestionData]
  );

  return (
    <Stack gap="20px" width="100%">
      {questionData?.question?.options.map((option, index) => (
        <Stack
          key={index}
          alignItems="center"
          justifyContent="center"
          padding="10px 30px"
          border="1px solid var(--border-color)"
          borderRadius="10px"
        >
          <Stack
            flexDirection="row"
            alignItems="center"
            gap="25px"
            sx={{ width: "100%" }}
            mb={1}
          >
            <Typography>
              {questionData?.question?.type === "FIB"
                ? `Blank ${index + 1}`
                : `Option ${index + 1}`}
            </Typography>

            {questionData?.question?.type !== "FIB" && (
              <Stack flexDirection="row" alignItems="center" gap="5px">
                <Checkbox
                  checked={option.isCorrect}
                  onChange={(e) => handleCheckBox(e.target.checked, index)}
                  sx={{
                    color: "var(--sec-color)",
                    padding: "0px",
                    "&.Mui-checked": { color: "var(--sec-color)" },
                  }}
                  disableRipple
                />
                <Typography>Correct answer</Typography>
              </Stack>
            )}

            <Stack flexDirection="row" alignItems="center" gap="10px">
              <Typography>Weightage</Typography>
              <StyledTextField
                size="small"
                disabled={
                  questionData?.question?.type === "MCQ"
                    ? true
                    : questionData?.question?.type === "MSQ"
                    ? !option.isCorrect
                    : false
                }
                value={option.weightage}
                onChange={(e) => {
                  let weightage = parseInt(e.target.value, 10);
                  if (isNaN(weightage)) weightage = 0;
                  weightage = weightage > 100 ? 100 : weightage;
                  updateQuestionData((q) => {
                    const newOptions = q.options.map((opt, i) =>
                      i === index ? { ...opt, weightage } : opt
                    );
                    return { ...q, options: newOptions };
                  });
                }}
                sx={{ width: "60px" }}
              />
            </Stack>

            <IconButton
              onClick={() => handleRemoveOption(index)}
              sx={{ marginLeft: "auto" }}
            >
              <DeleteForever sx={{ color: "var(--sec-color)" }} />
            </IconButton>
          </Stack>

          {questionData?.question?.type === "FIB" ? (
            <StyledTextField
              placeholder="Type here..."
              value={
                questionData?.question?.correctAnswers["blank" + (index + 1)] ||
                ""
              }
              onChange={(e) => handleTextChange(e.target.value, index, true)}
            />
          ) : (
            <MarkdownEditor
              questionData={questionData}
              setQuestionData={setQuestionData}
              value={option.title}
              onChange={(content) => handleTextChange(content, index, false)}
              placeholder="Type option"
            />
          )}
        </Stack>
      ))}

      <Stack width="100%" alignItems="center">
        <Button
          variant="contained"
          endIcon={<Add />}
          onClick={handleAddOption}
          sx={{
            width: "150px",
            backgroundColor: "var(--sec-color)",
            textTransform: "none",
            fontSize: "16px",
          }}
          disableElevation
        >
          {questionData?.question?.type === "FIB" ? "Add Blank" : "Add Option"}
        </Button>
      </Stack>
    </Stack>
  ); 
}
