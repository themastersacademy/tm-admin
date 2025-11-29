"use client";
import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Checkbox,
  CircularProgress,
  Stack,
  Step,
  StepConnector,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { East, SaveAlt, West } from "@mui/icons-material";
import BasicStepper from "./BasicStepper";
import AdditionalStepper from "./AdditionalStepper";
import ExplanationStepper from "./ExplanationStepper";
import PreviewStepper from "./PreviewStepper";
import checkQuestionFormat from "@/src/lib/checkQuestionFormat";
import { apiFetch } from "@/src/lib/apiFetch";

export default function QuestionStepper({
  steps,
  activeStep,
  questionData,
  setQuestionData,
  allSubjects,
  isNextDisabled,
  handleNext,
  handleBack,
  setInitState,
  onSuccess,
  initialData,
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [addNewQuestion, setAddNewQuestion] = useState(false);

  // derive subject title
  const subjectTitle = useMemo(() => {
    const subj = allSubjects.find(
      (s) => s.subjectID === questionData.subjectID
    );
    return subj?.title || "";
  }, [allSubjects, questionData.subjectID]);

  const handleSave = useCallback(async () => {
    console.log(questionData);
    setIsLoading(true);
    // Validate entire questionData shape
    if (!checkQuestionFormat(questionData)) {
      setIsLoading(false);
      console.log("format");
      return;
    }

    try {
      const isEdit = !!questionData.id;
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/questions/update`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/api/questions/add`;

      const body = isEdit
        ? {
            ...questionData,
            questionID: questionData.id,
            oldSubjectID: initialData?.subjectID,
          }
        : questionData;

      const res = await apiFetch(url, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (res.success) {
        if (addNewQuestion && !isEdit) {
          await setInitState();
        } else {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push("/dashboard/library/allQuestions");
          }
        }
      } else {
        console.error("Save failed:", res);
      }
    } catch (err) {
      console.error("Error saving question:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    questionData,
    addNewQuestion,
    router,
    setInitState,
    onSuccess,
    initialData,
  ]);

  const toggleAddNewQuestion = useCallback(() => {
    setAddNewQuestion((prev) => !prev);
  }, []);

  return (
    <Stack width="100%" alignItems="center">
      <Stack
        sx={{
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          backgroundColor: "var(--white)",
          minHeight: "65vh",
          width: "100%",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        {/* Stepper */}
        <Stack sx={{ padding: "32px 32px 24px 32px" }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            connector={
              <StepConnector
                sx={{
                  "& .MuiStepConnector-line": {
                    borderWidth: 3,
                    borderRadius: "50px",
                    margin: "0px 10px",
                    borderColor: "rgba(255, 152, 0, 0.2)",
                  },
                  "&.Mui-active .MuiStepConnector-line": {
                    borderColor: "#FF9800 !important",
                  },
                  "&.Mui-completed .MuiStepConnector-line": {
                    borderColor: "#FF9800 !important",
                  },
                }}
              />
            }
          >
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    "& .MuiStepIcon-root": {
                      color: "rgba(255, 152, 0, 0.2)",
                      width: "36px",
                      height: "36px",
                      border: "2px solid rgba(255, 152, 0, 0.3)",
                      borderRadius: "50%",
                    },
                    "& .Mui-active .MuiStepIcon-root": {
                      color: "#FF9800",
                      border: "2px solid #FF9800",
                    },
                    "& .Mui-completed .MuiStepIcon-root": {
                      color: "#FF9800",
                      border: "2px solid #FF9800",
                    },
                    "& .MuiStepLabel-label": {
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--text3)",
                      marginTop: "8px",
                    },
                    "& .Mui-active .MuiStepLabel-label": {
                      color: "#FF9800",
                      fontWeight: 700,
                    },
                    "& .Mui-completed .MuiStepLabel-label": {
                      color: "var(--text2)",
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Stack>

        {/* Step Content */}
        <Stack sx={{ padding: "0 32px 24px 32px", flex: 1 }}>
          {activeStep === 0 && (
            <BasicStepper
              questionData={questionData}
              setQuestionData={setQuestionData}
              allSubjects={allSubjects}
            />
          )}
          {activeStep === 1 && (
            <AdditionalStepper
              questionData={questionData}
              setQuestionData={setQuestionData}
            />
          )}
          {activeStep === 2 && (
            <ExplanationStepper
              questionData={questionData}
              setQuestionData={setQuestionData}
            />
          )}
          {activeStep === 3 && (
            <PreviewStepper
              questionData={questionData}
              subjectTitle={subjectTitle}
            />
          )}
        </Stack>

        {/* "Save & add new" checkbox on final step - Only for new questions */}
        {activeStep === steps.length - 1 && !questionData.id && (
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{
              padding: "0 32px 16px 32px",
            }}
          >
            <Checkbox
              checked={addNewQuestion}
              onChange={toggleAddNewQuestion}
              sx={{
                color: "#FF9800",
                "&.Mui-checked": { color: "#FF9800" },
                padding: "4px",
              }}
            />
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--text2)",
              }}
            >
              Save and add new question
            </Typography>
          </Stack>
        )}

        {/* Navigation Buttons */}
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{
            padding: "20px 32px",
            borderTop: "1px solid var(--border-color)",
            backgroundColor: "#FAFAFA",
            borderBottomLeftRadius: "16px",
            borderBottomRightRadius: "16px",
          }}
        >
          {activeStep > 0 ? (
            <Button
              variant="outlined"
              startIcon={<West />}
              onClick={handleBack}
              sx={{
                textTransform: "none",
                minWidth: 120,
                borderRadius: "8px",
                padding: "10px 20px",
                fontWeight: 600,
                fontSize: "14px",
                borderColor: "var(--border-color)",
                color: "var(--text2)",
                "&:hover": {
                  borderColor: "#FF9800",
                  backgroundColor: "rgba(255, 152, 0, 0.04)",
                  color: "#FF9800",
                },
              }}
            >
              Previous
            </Button>
          ) : (
            <div />
          )}

          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              endIcon={<East />}
              onClick={handleNext}
              disabled={isNextDisabled}
              sx={{
                textTransform: "none",
                minWidth: 120,
                borderRadius: "8px",
                padding: "10px 20px",
                fontWeight: 700,
                fontSize: "14px",
                background: isNextDisabled
                  ? "var(--border-color)"
                  : "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
                color: isNextDisabled ? "var(--text3)" : "#FFFFFF",
                boxShadow: isNextDisabled
                  ? "none"
                  : "0 4px 12px rgba(255, 152, 0, 0.25)",
                "&:hover": {
                  background: isNextDisabled
                    ? "var(--border-color)"
                    : "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
                  boxShadow: isNextDisabled
                    ? "none"
                    : "0 6px 16px rgba(255, 152, 0, 0.35)",
                  transform: isNextDisabled ? "none" : "translateY(-1px)",
                },
                "&.Mui-disabled": {
                  background: "var(--border-color)",
                  color: "var(--text3)",
                },
                transition: "all 0.3s ease",
              }}
              disableElevation
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<SaveAlt />}
              onClick={handleSave}
              disabled={isLoading}
              sx={{
                textTransform: "none",
                minWidth: 140,
                borderRadius: "8px",
                padding: "10px 24px",
                fontWeight: 700,
                fontSize: "14px",
                background: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
                color: "#FFFFFF",
                boxShadow: "0 4px 12px rgba(76, 175, 80, 0.25)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #388E3C 0%, #2E7D32 100%)",
                  boxShadow: "0 6px 16px rgba(76, 175, 80, 0.35)",
                  transform: "translateY(-1px)",
                },
                "&.Mui-disabled": {
                  background: "var(--border-color)",
                  color: "var(--text3)",
                },
                transition: "all 0.3s ease",
              }}
              disableElevation
            >
              {isLoading ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              ) : questionData.id ? (
                "Update Question"
              ) : (
                "Save Question"
              )}
            </Button>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
