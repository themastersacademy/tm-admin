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

const difficultyLevels = [
  { label: "Easy", value: 1 },
  { label: "Medium", value: 2 },
  { label: "Hard", value: 3 },
];

export default function BasicStepper({
  questionData,
  setQuestionData,
  allSubjects,
}) {
  // Update difficulty level (numeric)
  const handleLevel = useCallback(
    (value) => {
      setQuestionData((prev) => ({
        ...prev,
        difficultyLevel: value,
      }));
    },
    [setQuestionData]
  );

  // Reset relevant fields on type change
  const handleQuestionTypeChange = useCallback(
    (e) => {
      const newType = e.target.value;
      setQuestionData((prev) => ({
        ...prev,
        type: newType,
        options: [],
        answerKey: [],
        blanks: [],
      }));
    },
    [setQuestionData]
  );

  // Update subjectID
  const handleSubjectChange = useCallback(
    (e) => {
      setQuestionData((prev) => ({
        ...prev,
        subjectID: e.target.value,
      }));
    },
    [setQuestionData]
  );

  // Update question title
  const handleTitleChange = useCallback(
    (content) => {
      setQuestionData((prev) => ({
        ...prev,
        title: content,
      }));
    },
    [setQuestionData]
  );

  return (
    <Stack gap={3}>
      <StyledSelect
        title="Question type"
        value={questionData.type}
        options={questionTypes}
        getLabel={(opt) => opt.label}
        getValue={(opt) => opt.value}
        onChange={handleQuestionTypeChange}
      />

      <StyledSelect
        title="Subject"
        value={questionData.subjectID}
        options={allSubjects}
        getLabel={(sub) => sub.title}
        getValue={(sub) => sub.subjectID}
        onChange={handleSubjectChange}
      />

      <Stack direction="row" justifyContent="space-between" spacing={1}>
        {difficultyLevels.map(({ label, value }) => {
          const isSelected = questionData.difficultyLevel === value;
          return (
            <Button
              key={value}
              variant={isSelected ? "contained" : "outlined"}
              sx={{
                width: "160px",
                textTransform: "none",
                backgroundColor: isSelected
                  ? "var(--primary-color)"
                  : "transparent",
                color: isSelected ? "var(--white)" : "var(--text2)",
                borderColor: "var(--border-color)",
              }}
              onClick={() => handleLevel(value)}
            >
              {label}
            </Button>
          );
        })}
      </Stack>

      <MarkdownEditor
        value={questionData.title}
        onChange={handleTitleChange}
        placeholder="Type question"
      />
    </Stack>
  );
}
