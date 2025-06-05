"use client";
import React, { memo, useMemo } from "react";
import MDPreview from "@/src/components/MarkdownPreview/MarkdownPreview";
import { Chip, Radio, RadioGroup, Stack, Typography } from "@mui/material";

// Memoized sub-component for rendering each option
const OptionPreview = memo(function OptionPreview({
  option,
  type,
  correctAnswer,
  index,
}) {
  const borderColor = useMemo(() => {
    if (type === "FIB") return "var(--primary-color)";
    return option.isCorrect ? "var(--primary-color)" : "var(--border-color)";
  }, [option.isCorrect, type]);

  return (
    <Stack alignItems="center" justifyContent="center" flexDirection="row">
      <Stack
        flexDirection="row"
        sx={{
          border: `2px solid ${borderColor}`,
          borderRadius: "5px",
          minWidth: "280px",
          minHeight: "60px",
          padding: "15px",
          alignItems: "center",
        }}
      >
        {type !== "FIB" ? (
          <Stack flexDirection="row" gap="10px">
            <RadioGroup>
              <Radio
                checked={!!option.isCorrect}
                sx={{
                  color: "var(--text4)",
                  "&.Mui-checked": {
                    color: option.isCorrect
                      ? "var(--primary-color)"
                      : "var(--text4)",
                  },
                }}
                disabled
                disableRipple
              />
            </RadioGroup>
            <MDPreview value={option.title || "No option text"} />
          </Stack>
        ) : (
          <Typography>
            {`Blank ${index + 1}:`}&emsp;
            {correctAnswer}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
});

const PreviewStepper = memo(function PreviewStepper({
  questionData,
  subjectTitle,
}) {
  // Destructure properties from questionData
  const { title, type, difficulty, options = [], solution } = questionData;

  // Memoize difficulty chip style based on its value
  const difficultyChipStyle = useMemo(() => {
    switch (difficulty) {
      case "easy":
        return {
          backgroundColor: "var(--primary-color-acc-2)",
          color: "var(--primary-color)",
        };
      case "medium":
        return {
          backgroundColor: "var(--sec-color-acc-1)",
          color: "var(--sec-color)",
        };
      case "hard":
        return { backgroundColor: "#D6454555", color: "var(--delete-color)" };
      default:
        return {
          backgroundColor: "var(--primary-color-acc-2)",
          color: "var(--primary-color)",
        };
    }
  }, [difficulty]);

  // Memoize rendered options
  const renderedOptions = useMemo(() => {
    if (options.length === 0)
      return <Typography>No options available</Typography>;
    return options.map((option, index) => (
      <OptionPreview key={index} option={option} type={type} index={index} />
    ));
  }, [options, type]);

  return (
    <Stack sx={{ padding: "10px", width: "100%", gap: "10px" }}>
      <Stack gap="15px">
        <Stack flexDirection="row" gap="20px">
          <Chip
            label={type || ""}
            sx={{
              fontSize: "12px",
              fontFamily: "Lato",
              fontWeight: "700",
              width: "70px",
              height: "22px",
              backgroundColor: "var(--sec-color-acc-1)",
              color: "var(--sec-color)",
              borderRadius: "4px",
            }}
          />
          <Chip
            label={subjectTitle || questionData.subjectTitle}
            sx={{
              fontSize: "12px",
              fontFamily: "Lato",
              fontWeight: "700",
              width: "70px",
              height: "22px",
              backgroundColor: "var(--primary-color-acc-2)",
              color: "var(--primary-color)",
              borderRadius: "4px",
            }}
          />
          <Chip
            label={difficulty || ""}
            sx={{
              fontSize: "12px",
              fontFamily: "Lato",
              fontWeight: "700",
              width: "70px",
              height: "22px",
              textTransform: "capitalize",
              backgroundColor: difficultyChipStyle.backgroundColor,
              color: difficultyChipStyle.color,
              borderRadius: "4px",
            }}
          />
        </Stack>
        <Stack gap="20px">
          <MDPreview value={title || "No title provided"} />
        </Stack>
        <Stack gap="20px">
          <Stack flexDirection="row" flexWrap="wrap" gap="20px">
            {renderedOptions}
          </Stack>
        </Stack>
        <Stack gap="20px">
          <Typography sx={{ fontWeight: "700" }}>Solution</Typography>
          <MDPreview value={solution || "No solution provided"} />
        </Stack>
      </Stack>
    </Stack>
  );
});

export default PreviewStepper;
