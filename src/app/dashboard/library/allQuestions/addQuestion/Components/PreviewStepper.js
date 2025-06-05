"use client";
import React, { memo, useMemo, useContext, useEffect } from "react";
import MDPreview from "@/src/components/MarkdownPreview/MarkdownPreview";
import { Chip, Radio, RadioGroup, Stack, Typography } from "@mui/material";
import SubjectContext from "@/src/app/context/SubjectContext";

// Renders a single option or blank preview
const OptionPreview = memo(function OptionPreview({
  index,
  type,
  option,
  isCorrect,
  blankAnswer,
}) {
  const borderColor = useMemo(() => {
    if (type === "FIB") return "var(--primary-color)";
    return isCorrect ? "var(--primary-color)" : "var(--border-color)";
  }, [isCorrect, type]);

  return (
    <Stack alignItems="center" justifyContent="center">
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          border: `2px solid ${borderColor}`,
          borderRadius: 1,
          p: 2,
          minWidth: 280,
          maxWidth: "280px",
        }}
      >
        {type !== "FIB" ? (
          <Stack
            flexDirection="row"
            gap="10px"
            width="100%"
            alignItems="center"
          >
            <RadioGroup>
              <Radio
                checked={isCorrect}
                sx={{
                  color: "var(--text4)",
                  "&.Mui-checked": {
                    color: isCorrect ? "var(--primary-color)" : "var(--text4)",
                  },
                }}
                disabled
                disableRipple
              />
            </RadioGroup>
            <MDPreview value={option.text || "No option text"} />
          </Stack>
        ) : (
          <Typography sx={{ width: "100px" }}>
            {`Blank ${index + 1}: ${blankAnswer || ""}`}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
});

const difficultyLabels = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
};

// Color mapping for difficulty levels
const difficultyStyles = {
  Easy: {
    backgroundColor: "var(--primary-color-acc-2)",
    color: "var(--primary-color)",
  },
  Medium: {
    backgroundColor: "var(--sec-color-acc-1)",
    color: "var(--sec-color)",
  },
  Hard: { backgroundColor: "#D6454555", color: "var(--delete-color)" },
};

const PreviewStepper = memo(function PreviewStepper({ questionData }) {
  const { subjectList, fetchSubject } = useContext(SubjectContext);
  const {
    title,
    type,
    difficultyLevel,
    options = [],
    answerKey = [],
    blanks = [],
    solution,
    subjectID,
  } = questionData;

  useEffect(() => {
    fetchSubject();
  }, [fetchSubject]);

  // Find the subject title using subjectID
  const subjectTitle = React.useMemo(() => {
    const subject = subjectList.find(
      (subject) => subject.subjectID === subjectID
    );
    return subject ? subject.title : "Unknown";
  }, [subjectList, subjectID]);

  // Derive difficulty label
  const diffLabel = difficultyLabels[difficultyLevel] || "";
  const diffStyle = difficultyStyles[diffLabel] || {};

  // Render either blanks or options
  const items = useMemo(() => {
    if (type === "FIB") {
      return blanks.map((b, idx) => (
        <OptionPreview
          key={idx}
          index={idx}
          type={type}
          isCorrect={true}
          blankAnswer={b.correctAnswers[0]}
          weight={b.weight}
          correctAnswers={b.correctAnswers}
        />
      ));
    } else if (options.length === 0) {
      return <Typography>No options available</Typography>;
    }
    return options.map((opt, idx) => (
      <OptionPreview
        key={idx}
        index={idx}
        type={type}
        option={opt}
        isCorrect={answerKey.includes(idx)}
        correctAnswers={opt.correctAnswers}
        weight={opt.weight}
      />
    ));
  }, [type, options, answerKey, blanks]);

  return (
    <Stack p={2} spacing={2} width="100%">
      <Stack direction="row" spacing={1}>
        <Chip
          label={type || ""}
          size="small"
          sx={{
            fontSize: "12px",
            fontFamily: "Lato",
            fontWeight: "700",
            width: "70px",
            height: "24px",
            backgroundColor: "var(--sec-color-acc-1)",
            color: "var(--sec-color)",
            borderRadius: "4px",
          }}
        />
        <Chip
          label={subjectTitle}
          size="small"
          sx={{
            fontSize: "12px",
            fontFamily: "Lato",
            fontWeight: "700",
            width: "70px",
            height: "24px",
            backgroundColor: "var(--primary-color-acc-2)",
            color: "var(--primary-color)",
            borderRadius: "4px",
          }}
        />
        <Chip
          label={diffLabel || ""}
          size="small"
          sx={{
            fontSize: "12px",
            fontFamily: "Lato",
            fontWeight: "700",
            width: "70px",
            height: "24px",
            textTransform: "capitalize",
            backgroundColor: diffStyle.backgroundColor,
            color: diffStyle.color,
            borderRadius: "4px",
          }}
        />
      </Stack>

      <Stack gap="20px">
        <MDPreview value={title || "No title provided"} />
      </Stack>

      <Stack gap="20px">
        <Stack flexDirection="row" flexWrap="wrap" gap="20px">
          {items}
        </Stack>
      </Stack>

      <Stack spacing={2} pt={2}>
        <Typography fontWeight="700">Solution</Typography>
        <MDPreview value={solution || "No solution provided"} />
      </Stack>
    </Stack>
  );
});

export default PreviewStepper;
