"use client";
import React, { memo, useCallback } from "react";
import { Stack } from "@mui/material";
import MarkdownEditor from "@/src/components/MarkdownEditor/MarkdownEditor";

/**
 * Renders the solution/explanation editor for a question.
 * Expects questionData.solution and writes back to top-level solution field.
 */
function ExplanationStepper({ questionData, setQuestionData }) {
  // Update the 'solution' field on change
  const handleSolutionChange = useCallback(
    (content) => {
      setQuestionData((prev) => ({
        ...prev,
        solution: content,
      }));
    },
    [setQuestionData]
  );

  return (
    <Stack spacing={2} width="100%">
      <MarkdownEditor
        value={questionData.solution || ""}
        onChange={handleSolutionChange}
        placeholder="Write explanation here..."
      />
    </Stack>
  );
}

export default memo(ExplanationStepper);