"use client";
import { Suspense, useContext } from "react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/src/components/Header/Header";
import { Stack, CircularProgress } from "@mui/material";
import SubjectContext from "@/src/app/context/SubjectContext";
import QuestionStepper from "./Components/QuestionStepper";

const defaultQuestionData = {
  subjectID: "",
  title: "",
  type: "", // "MCQ" | "MSQ" | "FIB"
  difficultyLevel: "", // 1=easy, 2=medium, 3=hard
  options: [], // { id: number, text: string, weight: number }[]
  answerKey: [], // number[] for MCQ/MSQ
  blanks: [], // { id: number, correctAnswers: string[] }[] for FIB
  solution: "",
};

function validateBasicStep(data) {
  return (
    data.subjectID.trim() !== "" &&
    data.title.trim() !== "" &&
    ["MCQ", "MSQ", "FIB"].includes(data.type) &&
    [1, 2, 3].includes(Number(data.difficultyLevel))
  );
}

function validateAdditionalStep(data) {
  const { type, options, answerKey, blanks } = data;

  // MCQ: exactly one correct; options ≥2; weights sum 100
  if (type === "MCQ") {
    if (options.length < 2) return false;
    if (answerKey.length !== 1) return false;
    if (!options.every((o) => typeof o.id === "number" && o.text.trim() !== ""))
      return false;
    const total = options.reduce((s, o) => s + (Number(o.weight) || 0), 0);
    if (total !== 100) return false;
    if (!answerKey.every((id) => options.some((o) => o.id === id)))
      return false;
  }

  // MSQ: ≥2 correct; options ≥2; weights sum 100
  if (type === "MSQ") {
    if (options.length < 2) return false;
    if (answerKey.length < 2) return false;
    if (!options.every((o) => typeof o.id === "number" && o.text.trim() !== ""))
      return false;
    const total = options.reduce((s, o) => s + (Number(o.weight) || 0), 0);
    if (total !== 100) return false;
    if (!answerKey.every((id) => options.some((o) => o.id === id)))
      return false;
  }

  if (type === "FIB") {
    if (!Array.isArray(blanks) || blanks.length < 1) return false;
    // ensure blank IDs are 0..n-1
    const ids = blanks.map((b) => b.id).sort((a, b) => a - b);
    if (ids.some((id, i) => id !== i)) return false;
    // each blank must have ≥1 non-empty correct answer
    if (
      blanks.some(
        (b) => !Array.isArray(b.correctAnswers) || b.correctAnswers.length === 0
      )
    )
      return false;
    if (blanks.some((b) => b.correctAnswers.some((ans) => ans.trim() === "")))
      return false;
    if (!blanks.every((b) => typeof b.weight === "number" && b.weight >= 0))
      return false;
    const totalWeight = blanks.reduce(
      (sum, b) => sum + (Number(b.weight) || 0),
      0
    );
    if (totalWeight !== 100) return false;
  }

  return true;
}

function AddQuestionContent() {
  const searchParams = useSearchParams();
  const prefillSubjectID = searchParams.get("subjectID");

  const steps = useMemo(
    () => ["Basic Info", "Details", "Solution", "Preview"],
    []
  );

  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState({
    ...defaultQuestionData,
    subjectID: prefillSubjectID || "",
  });
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const { subjectList: allSubjects, fetchSubject } = useContext(SubjectContext);

  const validateStep = useCallback(() => {
    if (activeStep === 0) return validateBasicStep(data);
    if (activeStep === 1) return validateAdditionalStep(data);
    // steps 2 & 3 (solution & preview) are always valid if we got here
    return true;
  }, [activeStep, data]);

  useEffect(() => {
    setIsNextDisabled(!validateStep());
  }, [validateStep]);

  // Ensure subjects are loaded
  useEffect(() => {
    if (allSubjects.length === 0) fetchSubject();
  }, [allSubjects, fetchSubject]);

  // Update data if prefillSubjectID changes (though usually it's static on mount)
  useEffect(() => {
    if (prefillSubjectID) {
      setData((prev) => ({ ...prev, subjectID: prefillSubjectID }));
    }
  }, [prefillSubjectID]);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((s) => s + 1);
    }
  };
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((s) => s - 1);
    }
  };
  const resetForm = () => {
    setData(defaultQuestionData);
    setActiveStep(0);
  };
  const setInitState = () => {
    setData(defaultQuestionData);
    setActiveStep(0);
  };

  return (
    <Stack p={2} spacing={2}>
      <Header title="Back" back />
      <QuestionStepper
        questionData={data}
        setQuestionData={setData}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        steps={steps}
        allSubjects={allSubjects}
        isNextDisabled={isNextDisabled}
        handleNext={handleNext}
        handleBack={handleBack}
        resetForm={resetForm}
        setInitState={setInitState}
      />
    </Stack>
  );
}

export default function AddQuestion() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <AddQuestionContent />
    </Suspense>
  );
}
