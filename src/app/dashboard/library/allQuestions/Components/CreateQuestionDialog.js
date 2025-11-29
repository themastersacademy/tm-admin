import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import QuestionStepper from "../addQuestion/Components/QuestionStepper";
import { apiFetch } from "@/src/lib/apiFetch";

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

export default function CreateQuestionDialog({
  open,
  onClose,
  onSuccess,
  initialData,
}) {
  const steps = useMemo(
    () => ["Basic Info", "Details", "Solution", "Preview"],
    []
  );

  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState(defaultQuestionData);
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const [allSubjects, setAllSubjects] = useState([]);

  // Initialize data when dialog opens or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setData(initialData);
      } else {
        setData(defaultQuestionData);
      }
      setActiveStep(0);
    }
  }, [open, initialData]);

  const validateStep = useCallback(() => {
    if (activeStep === 0) return validateBasicStep(data);
    if (activeStep === 1) return validateAdditionalStep(data);
    // steps 2 & 3 (solution & preview) are always valid if we got here
    return true;
  }, [activeStep, data]);

  useEffect(() => {
    setIsNextDisabled(!validateStep());
  }, [validateStep]);

  // load subjects for dropdown
  useEffect(() => {
    if (open) {
      apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/subjects/get-all-subjects`
      )
        .then((res) => setAllSubjects(res.success ? res.data.subjects : []))
        .catch(() => setAllSubjects([]));
    }
  }, [open]);

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

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSuccess = () => {
    resetForm();
    onSuccess();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          minHeight: "85vh",
          maxWidth: "900px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* Modern Header with Orange Gradient */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          padding: "24px 32px",
          background:
            "linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(245, 124, 0, 0.02) 100%)",
          borderBottom: "1px solid rgba(255, 152, 0, 0.15)",
        }}
      >
        <Stack gap="4px">
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text1)",
              fontFamily: "Lato",
            }}
          >
            {initialData ? "Edit Question" : "Create New Question"}
          </Typography>
          <Typography
            sx={{
              fontSize: "13px",
              color: "var(--text3)",
              fontFamily: "Lato",
            }}
          >
            {initialData
              ? "Update the details of the question"
              : "Follow the steps to create a new question"}
          </Typography>
        </Stack>
        <IconButton
          onClick={handleClose}
          sx={{
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--white)",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(255, 152, 0, 0.08)",
              borderColor: "#FF9800",
              color: "#FF9800",
            },
          }}
        >
          <Close />
        </IconButton>
      </Stack>

      <DialogContent sx={{ padding: "32px", backgroundColor: "#FAFAFA" }}>
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
          onSuccess={handleSuccess}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
}
