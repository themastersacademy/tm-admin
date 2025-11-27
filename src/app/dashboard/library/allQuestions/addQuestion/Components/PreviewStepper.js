"use client";
import React, { memo, useMemo, useContext, useEffect } from "react";
import MDPreview from "@/src/components/MarkdownPreview/MarkdownPreview";
import {
  Chip,
  Radio,
  RadioGroup,
  Stack,
  Typography,
  Box,
  Divider,
  Paper,
} from "@mui/material";
import SubjectContext from "@/src/app/context/SubjectContext";
import {
  CheckCircle,
  Lightbulb,
  CalendarToday,
  Subject,
  Category,
  SignalCellularAlt,
  RadioButtonUnchecked,
} from "@mui/icons-material";

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Renders a single option or blank preview
const OptionPreview = memo(function OptionPreview({
  index,
  type,
  option,
  isCorrect,
  blankAnswer,
}) {
  const label = String.fromCharCode(65 + index); // A, B, C, D...

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        p: 2,
        border: "1px solid",
        borderColor: isCorrect ? "var(--success-color)" : "var(--border-color)",
        backgroundColor: isCorrect ? "rgba(76, 175, 80, 0.04)" : "var(--white)",
        borderRadius: "12px",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          borderColor: isCorrect
            ? "var(--success-color)"
            : "var(--primary-color)",
          backgroundColor: isCorrect
            ? "rgba(76, 175, 80, 0.08)"
            : "rgba(102, 126, 234, 0.02)",
        },
      }}
    >
      {isCorrect && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "4px",
            backgroundColor: "var(--success-color)",
          }}
        />
      )}
      <Stack direction="row" alignItems="center" gap={2}>
        {type !== "FIB" ? (
          <>
            <Box
              sx={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: isCorrect
                  ? "var(--success-color)"
                  : "var(--bg-color)",
                color: isCorrect ? "white" : "var(--text2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "14px",
                flexShrink: 0,
              }}
            >
              {isCorrect ? <CheckCircle sx={{ fontSize: "20px" }} /> : label}
            </Box>
            <Box sx={{ flex: 1 }}>
              <MDPreview value={option.text || "No option text"} />
            </Box>
          </>
        ) : (
          <Stack direction="row" alignItems="center" gap={2} width="100%">
            <Typography
              sx={{
                fontWeight: "600",
                color: "var(--text2)",
                minWidth: "80px",
              }}
            >
              Blank {index + 1}:
            </Typography>
            <Box
              sx={{
                p: "8px 16px",
                backgroundColor: "var(--white)",
                border: "1px dashed var(--border-color)",
                borderRadius: "6px",
                flex: 1,
                fontWeight: "500",
                color: "var(--text1)",
              }}
            >
              {blankAnswer || ""}
            </Box>
            <CheckCircle sx={{ color: "var(--success-color)" }} />
          </Stack>
        )}
      </Stack>
    </Paper>
  );
});

const difficultyLabels = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
};

const difficultyStyles = {
  Easy: {
    bg: "rgba(76, 175, 80, 0.1)",
    color: "#2e7d32",
    border: "1px solid rgba(76, 175, 80, 0.2)",
  },
  Medium: {
    bg: "rgba(237, 108, 2, 0.1)",
    color: "#ed6c02",
    border: "1px solid rgba(237, 108, 2, 0.2)",
  },
  Hard: {
    bg: "rgba(211, 47, 47, 0.1)",
    color: "#d32f2f",
    border: "1px solid rgba(211, 47, 47, 0.2)",
  },
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
    createdAt,
  } = questionData;

  useEffect(() => {
    fetchSubject();
  }, [fetchSubject]);

  const subjectTitle = useMemo(() => {
    const subject = subjectList.find(
      (subject) => subject.subjectID === subjectID
    );
    return subject ? subject.title : "Unknown";
  }, [subjectList, subjectID]);

  const diffLabel = difficultyLabels[difficultyLevel] || "Medium";
  const diffStyle = difficultyStyles[diffLabel] || difficultyStyles.Medium;

  const items = useMemo(() => {
    if (type === "FIB") {
      return blanks.map((b, idx) => (
        <OptionPreview
          key={idx}
          index={idx}
          type={type}
          isCorrect={true}
          blankAnswer={b.correctAnswers[0]}
        />
      ));
    } else if (options.length === 0) {
      return (
        <Typography color="text.secondary" fontStyle="italic">
          No options available
        </Typography>
      );
    }
    return options.map((opt, idx) => (
      <OptionPreview
        key={idx}
        index={idx}
        type={type}
        option={opt}
        isCorrect={answerKey.includes(idx)}
      />
    ));
  }, [type, options, answerKey, blanks]);

  return (
    <Stack spacing={3} width="100%" sx={{ pb: 2 }}>
      {/* Header Section */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{
          p: 2,
          backgroundColor: "var(--bg-color)",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
        }}
      >
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            icon={<Subject sx={{ fontSize: "16px !important" }} />}
            label={subjectTitle}
            sx={{
              height: "28px",
              backgroundColor: "white",
              border: "1px solid var(--border-color)",
              fontWeight: 600,
              "& .MuiChip-icon": { color: "var(--primary-color)" },
            }}
          />
          <Chip
            icon={<Category sx={{ fontSize: "16px !important" }} />}
            label={type}
            sx={{
              height: "28px",
              backgroundColor: "white",
              border: "1px solid var(--border-color)",
              fontWeight: 600,
              "& .MuiChip-icon": { color: "var(--sec-color)" },
            }}
          />
          <Chip
            icon={<SignalCellularAlt sx={{ fontSize: "16px !important" }} />}
            label={diffLabel}
            sx={{
              height: "28px",
              backgroundColor: diffStyle.bg,
              color: diffStyle.color,
              border: diffStyle.border,
              fontWeight: 600,
              "& .MuiChip-icon": { color: "inherit" },
            }}
          />
        </Stack>
        {createdAt && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarToday sx={{ fontSize: "14px", color: "var(--text3)" }} />
            <Typography variant="caption" color="var(--text3)" fontWeight={500}>
              Added on {formatDate(createdAt)}
            </Typography>
          </Stack>
        )}
      </Stack>

      {/* Question Body */}
      <Box sx={{ px: 1 }}>
        <Typography
          variant="subtitle2"
          color="var(--text3)"
          fontWeight={700}
          mb={1}
          textTransform="uppercase"
          fontSize="12px"
        >
          Question
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: "var(--white)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            "& p": {
              fontSize: "16px",
              lineHeight: 1.7,
              color: "var(--text1)",
              margin: 0,
            },
          }}
        >
          <MDPreview value={title || "No question text provided"} />
        </Paper>
      </Box>

      {/* Options Section */}
      <Box sx={{ px: 1 }}>
        <Typography
          variant="subtitle2"
          color="var(--text3)"
          fontWeight={700}
          mb={1}
          textTransform="uppercase"
          fontSize="12px"
        >
          {type === "FIB" ? "Correct Answers" : "Options"}
        </Typography>
        <Stack spacing={1.5}>{items}</Stack>
      </Box>

      {/* Solution Section */}
      <Box sx={{ px: 1 }}>
        <Paper
          elevation={0}
          sx={{
            overflow: "hidden",
            border: "1px solid rgba(102, 126, 234, 0.2)",
            borderRadius: "12px",
            backgroundColor: "rgba(102, 126, 234, 0.02)",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              p: "12px 16px",
              backgroundColor: "rgba(102, 126, 234, 0.08)",
              borderBottom: "1px solid rgba(102, 126, 234, 0.1)",
            }}
          >
            <Lightbulb
              sx={{ color: "var(--primary-color)", fontSize: "20px" }}
            />
            <Typography
              variant="subtitle2"
              sx={{
                color: "var(--primary-color)",
                fontWeight: 700,
              }}
            >
              Solution & Explanation
            </Typography>
          </Stack>
          <Box sx={{ p: 3 }}>
            <MDPreview value={solution || "No solution provided"} />
          </Box>
        </Paper>
      </Box>
    </Stack>
  );
});

export default PreviewStepper;
