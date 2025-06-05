"use client";
import { useCallback, useMemo } from "react";
import { Button, Stack } from "@mui/material";
import MarkdownEditor from "@/src/components/MarkdownEditor/MarkdownEditor";
import StyledSelect from "@/src/components/StyledSelect/StyledSelect";

const questionTypes = [
  { label: "Multiple Choice (MCQ)", value: "MCQ" },
  { label: "Multiple Select (MSQ)", value: "MSQ" },
  { label: "Fill in the blanks (FIB)", value: "FIB" },
];

const difficultyLevels = ["Easy", "Medium", "Hard"];

export default function BasicStepper({
  questionData,
  setQuestionData,
  allSubjects,
}) {
  // Update difficulty level (always stored in lower-case)
  const handleLevel = useCallback(
    (selectedLevel) => {
      setQuestionData((prev) => ({
        ...prev,
        question: { ...prev.question, difficulty: selectedLevel.toLowerCase() },
      }));
    },
    [setQuestionData]
  );

  // When question type changes, reset related fields.
  const handleQuestionTypeChange = useCallback(
    (e) => {
      const newType = e.target.value;
      setQuestionData((prev) => ({
        ...prev,
        question: {
          ...prev.question,
          type: newType,
          noOfBlanks: 0,
          options: [],
          correctAnswers: {},
        },
      }));
    },
    [setQuestionData]
  );

  // Update subject ID.
  const handleSubjectChange = useCallback(
    (e) => {
      setQuestionData((prev) => ({ ...prev, subjectID: e.target.value }));
    },
    [setQuestionData]
  );

  // Update question title.
  const handleTitleChange = useCallback(
    (content) => {
      setQuestionData((prev) => ({
        ...prev,
        question: { ...prev.question, title: content },
      }));
    },
    [setQuestionData]
  );

  // Memoize the difficulty buttons to avoid re-rendering them unnecessarily.
  const memoizedDifficultyButtons = useMemo(() => {
    return difficultyLevels.map((level) => {
      const isSelected =
        questionData.question.difficulty === level.toLowerCase();
      return (
        <Button
          key={level}
          variant={isSelected ? "contained" : "outlined"}
          sx={{
            width: "170px",
            textTransform: "none",
            border: isSelected ? "none" : "1px solid var(--border-color)",
            backgroundColor: isSelected
              ? "var(--primary-color)"
              : "transparent",
            color: isSelected ? "white" : "inherit",
          }}
          onClick={() => handleLevel(level)}
          disableElevation
        >
          {level}
        </Button>
      );
    });
  }, [questionData.question.difficulty, handleLevel]);

  return (
    <Stack gap="25px">
      <StyledSelect
        title="Question type"
        value={questionData.question.type}
        options={questionTypes}
        getLabel={(ques) => ques.label}
        getValue={(ques) => ques.value}
        onChange={handleQuestionTypeChange}
      />
      <StyledSelect
        title="Subject"
        value={questionData.subjectID}
        onChange={handleSubjectChange}
        options={allSubjects}
        getLabel={(sub) => sub.title}
        getValue={(sub) => sub.subjectID}
      />
      <Stack flexDirection="row" justifyContent="space-between">
        {memoizedDifficultyButtons}
      </Stack>
      <MarkdownEditor
        questionData={questionData}
        setQuestionData={setQuestionData}
        value={questionData.question.title}
        onChange={handleTitleChange}
        placeholder="Type question"
      />
    </Stack>
  );
}
