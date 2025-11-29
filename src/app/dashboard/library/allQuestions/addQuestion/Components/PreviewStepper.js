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
        p: 2.5,
        border: "2px solid",
        borderColor: isCorrect ? "#4CAF50" : "var(--border-color)",
        backgroundColor: isCorrect
          ? "linear-gradient(135deg, rgba(76, 175, 80, 0.12) 0%, rgba(56, 142, 60, 0.08) 100%)"
          : "var(--white)",
        background: isCorrect
          ? "linear-gradient(135deg, rgba(76, 175, 80, 0.12) 0%, rgba(56, 142, 60, 0.08) 100%)"
          : "var(--white)",
        borderRadius: "12px",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
        boxShadow: isCorrect ? "0 4px 12px rgba(76, 175, 80, 0.15)" : "none",
        "&:hover": {
          borderColor: isCorrect ? "#388E3C" : "#FF9800",
          backgroundColor: isCorrect
            ? "rgba(76, 175, 80, 0.18)"
            : "rgba(255, 152, 0, 0.04)",
          transform: "translateY(-2px)",
          boxShadow: isCorrect
            ? "0 6px 16px rgba(76, 175, 80, 0.2)"
            : "0 4px 12px rgba(255, 152, 0, 0.1)",
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
            width: "5px",
            background: "linear-gradient(180deg, #4CAF50 0%, #388E3C 100%)",
          }}
        />
      )}
      <Stack direction="row" alignItems="center" gap={2}>
        {type !== "FIB" ? (
          <>
            <Box
              sx={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: isCorrect
                  ? "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)"
                  : "#FAFAFA",
                color: isCorrect ? "#FFFFFF" : "var(--text2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "15px",
                flexShrink: 0,
                border: isCorrect ? "none" : "2px solid var(--border-color)",
                boxShadow: isCorrect
                  ? "0 4px 12px rgba(76, 175, 80, 0.3)"
                  : "none",
                transition: "all 0.3s ease",
              }}
            >
              {isCorrect ? <CheckCircle sx={{ fontSize: "24px" }} /> : label}
            </Box>
            <Box
              sx={{
                flex: 1,
                "& .wmde-markdown": {
                  background: "transparent !important",
                  backgroundColor: "transparent !important",
                },
                "& p, & span, & div, & code, & pre": {
                  color: "var(--text1) !important",
                },
                "& *": {
                  color: "inherit",
                },
              }}
            >
              <MDPreview value={option.text || "No option text"} />
            </Box>
            {isCorrect && (
              <Chip
                label="Correct Answer"
                sx={{
                  height: "26px",
                  fontSize: "11px",
                  fontWeight: 700,
                  background:
                    "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
                  color: "#FFFFFF",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(76, 175, 80, 0.25)",
                }}
              />
            )}
          </>
        ) : (
          <Stack direction="row" alignItems="center" gap={2} width="100%">
            <Typography
              sx={{
                fontWeight: "700",
                color: "#4CAF50",
                minWidth: "80px",
                fontSize: "14px",
              }}
            >
              Blank {index + 1}:
            </Typography>
            <Box
              sx={{
                p: "10px 16px",
                backgroundColor: "#FFFFFF",
                border: "2px solid #4CAF50",
                borderRadius: "8px",
                flex: 1,
                fontWeight: "600",
                color: "#4CAF50",
                fontSize: "14px",
              }}
            >
              {blankAnswer || ""}
            </Box>
            <CheckCircle
              sx={{
                color: "#4CAF50",
                fontSize: "28px",
                filter: "drop-shadow(0 2px 4px rgba(76, 175, 80, 0.3))",
              }}
            />
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
