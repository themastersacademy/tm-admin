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
      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/questions/add`,
        {
          method: "POST",
          body: JSON.stringify(questionData),
        }
      );
      if (res.success) {
        if (addNewQuestion) {
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
  }, [questionData, addNewQuestion, router, setInitState, onSuccess]);

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
          p: 2,
          gap: 2,
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

        {/* Step Content */}
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

        {/* "Save & add new" checkbox on final step */}
        {activeStep === steps.length - 1 && (
          <Stack direction="row" alignItems="center" gap={1} width="100%">
            <Checkbox
              checked={addNewQuestion}
              onChange={toggleAddNewQuestion}
              sx={{
                color: "var(--sec-color)",
                "&.Mui-checked": { color: "var(--sec-color)" },
              }}
            />
            <Typography>Save and add new question</Typography>
          </Stack>
        )}

        {/* Navigation Buttons */}
        <Stack direction="row" mt="auto" gap={2}>
          {activeStep > 0 && (
            <Button
              variant="text"
              startIcon={<West />}
              onClick={handleBack}
              sx={{
                textTransform: "none",
                width: 100,
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
              onClick={handleNext}
              disabled={isNextDisabled}
              sx={{
                textTransform: "none",
                width: 100,
                color: "var(--primary-color)",
              }}
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
                width: 100,
                backgroundColor: "var(--primary-color)",
              }}
            >
              {isLoading ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
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
