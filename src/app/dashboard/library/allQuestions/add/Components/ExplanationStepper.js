"use client";
import React, { useCallback } from "react";
import MarkdownEditor from "@/src/components/MarkdownEditor/MarkdownEditor";
import { Stack } from "@mui/material";

const ExplanationStepper = ({ questionData, setQuestionData }) => {
  const handleSolutionChange = useCallback(
    (content) => {
      setQuestionData((prev) => ({
        ...prev,
        question: { ...prev.question, solution: content },
      }));
    },
    [setQuestionData]
  );

  return (
    <Stack>
      <MarkdownEditor
        questionData={questionData}
        setQuestionData={setQuestionData}
        value={questionData.question.solution}
        onChange={handleSolutionChange}
        placeholder="Write explanation here..."
      />
    </Stack>
  );
};

export default React.memo(ExplanationStepper);
