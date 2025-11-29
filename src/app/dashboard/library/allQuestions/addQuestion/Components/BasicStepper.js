"use client";
import { useCallback, useMemo } from "react";
import { Button, Stack, Typography } from "@mui/material";
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
    <Stack gap={4}>
      {/* Question Type */}
      <Stack gap="12px">
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--text1)",
            letterSpacing: "0.2px",
          }}
        >
          Question Type
        </Typography>
        <StyledSelect
          title="Select question type"
          value={questionData.type}
          options={questionTypes}
          getLabel={(opt) => opt.label}
          getValue={(opt) => opt.value}
          onChange={handleQuestionTypeChange}
        />
      </Stack>

      {/* Subject */}
      <Stack gap="12px">
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--text1)",
            letterSpacing: "0.2px",
          }}
        >
          Subject
        </Typography>
        <StyledSelect
          title="Select subject"
          value={questionData.subjectID}
          options={allSubjects}
          getLabel={(sub) => sub.title}
          getValue={(sub) => sub.subjectID}
          onChange={handleSubjectChange}
        />
      </Stack>

      {/* Difficulty Level */}
      <Stack gap="12px">
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--text1)",
            letterSpacing: "0.2px",
          }}
        >
          Difficulty Level
        </Typography>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          {difficultyLevels.map(({ label, value }) => {
            const isSelected = questionData.difficultyLevel === value;
            return (
              <Button
                key={value}
                variant={isSelected ? "contained" : "outlined"}
                onClick={() => handleLevel(value)}
                sx={{
                  flex: 1,
                  textTransform: "none",
                  borderRadius: "10px",
                  padding: "12px 20px",
                  fontWeight: isSelected ? 700 : 600,
                  fontSize: "14px",
                  background: isSelected
                    ? "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)"
                    : "transparent",
                  color: isSelected ? "#FFFFFF" : "var(--text2)",
                  borderColor: isSelected ? "#FF9800" : "var(--border-color)",
                  boxShadow: isSelected
                    ? "0 4px 12px rgba(255, 152, 0, 0.25)"
                    : "none",
                  "&:hover": {
                    background: isSelected
                      ? "linear-gradient(135deg, #F57C00 0%, #E65100 100%)"
                      : "rgba(255, 152, 0, 0.08)",
                    borderColor: "#FF9800",
                    color: isSelected ? "#FFFFFF" : "#FF9800",
                    boxShadow: isSelected
                      ? "0 6px 16px rgba(255, 152, 0, 0.35)"
                      : "none",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.3s ease",
                }}
                disableElevation
              >
                {label}
              </Button>
            );
          })}
        </Stack>
      </Stack>

      {/* Question Content */}
      <Stack gap="12px">
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--text1)",
            letterSpacing: "0.2px",
          }}
        >
          Question Content
        </Typography>
        <MarkdownEditor
          value={questionData.title}
          onChange={handleTitleChange}
          placeholder="Type your question here..."
        />
      </Stack>
    </Stack>
  );
}
