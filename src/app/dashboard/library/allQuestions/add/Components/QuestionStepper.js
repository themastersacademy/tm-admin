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
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [addNewQuestion, setAddNewQuestion] = useState(false);

  // Memoize subject title for PreviewStepper.
  const subjectTitle = useMemo(() => {
    const subject = allSubjects.find(
      (item) => item.subjectID === questionData.subjectID
    );
    return subject ? subject.title : "";
  }, [allSubjects, questionData.subjectID]);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    const { question, subjectID } = questionData;
    console.log(checkQuestionFormat({ question, subjectID }));
    if (!checkQuestionFormat({ question, subjectID })) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/questions/add`,
        {
          method: "POST",
          body: JSON.stringify({ question, subjectID }),
        }
      );
      console.log(data);
      if (data.success) {
        addNewQuestion
          ? setInitState()
          : router.push("/dashboard/library/allQuestions");
      }
    } catch (error) {
      console.error("Error saving question:", error);
    } finally {
      setIsLoading(false);
    }
  }, [questionData, addNewQuestion, router, setInitState]);

  const toggleAddNewQuestion = useCallback(() => {
    setAddNewQuestion((prev) => !prev);
  }, []);

  return (
    <Stack width="100%" alignItems="center">
      <Stack
        alignItems="center"
        sx={{
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          backgroundColor: "var(--white)",
          minHeight: "60vh",
          width: "650px",
          padding: "20px",
          gap: "20px",
        }}
      >
        {/* Stepper */}
        <Stack sx={{ width: "100%" }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            connector={
              <StepConnector
                sx={{
                  "& .MuiStepConnector-line": {
                    borderWidth: 7,
                    borderRadius: "50px",
                    margin: "0px 10px",
                    borderColor: "var(--primary-color-acc-2)",
                  },
                  "&.Mui-active .MuiStepConnector-line": {
                    borderColor: "var(--primary-color) !important",
                  },
                  "&.Mui-completed .MuiStepConnector-line": {
                    borderColor: "var(--primary-color) !important",
                  },
                }}
              />
            }
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    "& .MuiStepIcon-root": {
                      color: "var(--primary-color-acc-1)",
                      width: "30px",
                      height: "30px",
                    },
                    "& .Mui-active .MuiStepIcon-root": {
                      color: "var(--primary-color)",
                    },
                    "& .Mui-completed .MuiStepIcon-root": {
                      color: "var(--primary-color)",
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <hr
            style={{
              border: "1px solid var(--border-color)",
              marginTop: "25px",
            }}
          />
        </Stack>

        {/* Step content */}
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
            questionData={questionData.question}
            setQuestionData={setQuestionData}
            allSubjects={allSubjects}
            subjectTitle={subjectTitle}
          />
        )}

        {/* Save and add new question checkbox (only on final step) */}
        {activeStep === steps.length - 1 && (
          <Stack flexDirection="row" alignItems="center" gap="5px" width="100%">
            <Checkbox
              checked={addNewQuestion}
              onChange={toggleAddNewQuestion}
              sx={{
                color: "var(--sec-color)",
                padding: "0px",
                "&.Mui-checked": { color: "var(--sec-color)" },
              }}
              disableRipple
            />
            <Typography>Save and add new question</Typography>
          </Stack>
        )}

        {/* Navigation Buttons */}
        <Stack flexDirection="row" sx={{ marginTop: "auto", gap: "20px" }}>
          {activeStep > 0 && (
            <Button
              variant="text"
              startIcon={<West />}
              onClick={handleBack}
              sx={{
                textTransform: "none",
                width: "100px",
                color: "var(--primary-color)",
              }}
            >
              Previous
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button
              variant="text"
              endIcon={<East />}
              sx={{
                textTransform: "none",
                width: "100px",
                color: "var(--primary-color)",
              }}
              disabled={isNextDisabled}
              onClick={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<SaveAlt />}
              onClick={handleSave}
              disabled={isLoading}
              sx={{
                textTransform: "none",
                width: "100px",
                backgroundColor: "var(--primary-color)",
              }}
              disableElevation
            >
              {isLoading ? (
                <CircularProgress size={20} sx={{ color: "var(--white)" }} />
              ) : (
                "Save"
              )}
            </Button>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
