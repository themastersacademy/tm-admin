"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import Header from "@/src/components/Header/Header";
import { Stack } from "@mui/material";
import { apiFetch } from "@/src/lib/apiFetch";
import QuestionStepper from "./Components/QuestionStepper";

const defaultQuestionData = {
  subjectID: "",
  question: {
    title: "",
    difficulty: "",
    type: "",
    options: [],
    correctAnswers: {},
    solution: "",
    noOfBlanks: 0,
  },
};

function validateBasicStep(questionData) {
  const { question, subjectID } = questionData;
  return (
    question.type !== "" &&
    question.title !== "" &&
    question.difficulty !== "" &&
    subjectID !== ""
  );
}

function validateAdditionalStep(questionData) {
  const { question } = questionData;
  const { type, options, noOfBlanks } = question;

  if (type === "MCQ") {
    if (options.length < 2) return false;
    const correctCount = options.filter((option) => option.isCorrect).length;
    if (correctCount !== 1) return false;
    const totalWeight = options.reduce(
      (sum, option) => sum + (option.weightage || 0),
      0
    );
    if (totalWeight !== 100) return false;
    if (options.some((option) => !option.title)) return false;
  }

  if (type === "MSQ") {
    if (options.length < 2) return false;
    const correctCount = options.filter((option) => option.isCorrect).length;
    if (correctCount < 2) return false;
    const totalWeight = options.reduce(
      (sum, option) => sum + (option.weightage || 0),
      0
    );
    if (totalWeight !== 100) return false;
    if (options.some((option) => !option.title)) return false;
  }

  if (type === "FIB") {
    if (typeof noOfBlanks !== "number" || noOfBlanks <= 0) return false;
    if (options.length !== noOfBlanks) return false;
    const correctAnswers = question.correctAnswers;
    for (let i = 1; i <= noOfBlanks; i++) {
      const answer = correctAnswers["blank" + i];
      if (!answer || answer.trim() === "") return false;
    }
    const totalWeight = options.reduce(
      (sum, option) => sum + (option.weightage || 0),
      0
    );
    if (totalWeight !== 100) return false;
  }

  return true;
}

export default function AddQuestion() {
  const steps = useMemo(
    () => ["Basic Info", "Additional Info", "Explanation", "Preview"],
    []
  );
  const [activeStep, setActiveStep] = useState(0);
  const [questionData, setQuestionData] = useState(defaultQuestionData);
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [allSubjects, setAllSubjects] = useState([]);

  // Validate current step and update the "Next" button state.
  const validateStep = useCallback(() => {
    if (activeStep === 0) return validateBasicStep(questionData);
    if (activeStep === 1) return validateAdditionalStep(questionData);
    // For other steps, assume it's valid.
    return true;
  }, [activeStep, questionData]);

  useEffect(() => {
    setIsNextDisabled(!validateStep());
  }, [questionData, activeStep, validateStep]);

  const fetchAllSubjects = useCallback(async () => {
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/subjects/get-all-subjects`
      );
      setAllSubjects(data.success ? data.data.subjects : []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setAllSubjects([]);
    }
  }, []);

  useEffect(() => {
    fetchAllSubjects();
  }, [fetchAllSubjects]);

  const handleNext = useCallback(() => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
      setIsNextDisabled(true);
    }
  }, [activeStep, steps.length]);

  const handleBack = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
      setIsNextDisabled(false);
    }
  }, [activeStep]);

  const setInitState = useCallback(() => {
    setQuestionData(defaultQuestionData);
    setActiveStep(0);
  }, []);

  return (
    <Stack padding="20px" gap="20px">
      <Header title="Back" back />
      <QuestionStepper
        questionData={questionData}
        setQuestionData={setQuestionData}
        activeStep={activeStep}
        steps={steps}
        allSubjects={allSubjects}
        isNextDisabled={isNextDisabled}
        handleNext={handleNext}
        handleBack={handleBack}
        setInitState={setInitState}
      />
    </Stack>
  );
}
