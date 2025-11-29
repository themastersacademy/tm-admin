import MDPreview from "@/src/components/MarkdownPreview/MarkdownPreview";
import {
  ExpandLess,
  ExpandMore,
  CheckCircleOutline,
  CancelOutlined,
  RemoveCircleOutline,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

export default function QuestionPreview({ qNum, question, answerList = [] }) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = (event) => {
    event.stopPropagation();
    setExpanded((prev) => !prev);
  };

  const userAnswer = question.userAnswer;
  const options = question.options || [];

  // Find correct answer info from answerList
  const answerInfo = answerList.find(
    (a) => a.questionID === question.questionID || a.questionID === question.id
  );

  // Determine status
  const isSkippedMCQMSQ =
    (question.type === "MCQ" || question.type === "MSQ") &&
    userAnswer &&
    userAnswer.selectedOptions?.length === 0;

  const isSkippedFIB =
    question.type === "FIB" &&
    userAnswer &&
    (userAnswer.blankAnswers?.length === 0 ||
      userAnswer.blankAnswers.every((ans) => ans.trim() === ""));

  const isUnattempted = !userAnswer;
  const isSkipped = userAnswer && (isSkippedMCQMSQ || isSkippedFIB);
  const isCorrect = userAnswer?.isCorrect;

  // Determine the status color and icon
  let statusColor = "#9e9e9e"; // Gray for unattempted
  let statusBg = "rgba(158, 158, 158, 0.08)";
  let StatusIcon = RemoveCircleOutline;

  if (!isUnattempted && !isSkipped) {
    if (isCorrect) {
      statusColor = "#4caf50";
      statusBg = "rgba(76, 175, 80, 0.08)";
      StatusIcon = CheckCircleOutline;
    } else {
      statusColor = "#f44336";
      statusBg = "rgba(244, 67, 54, 0.08)";
      StatusIcon = CancelOutlined;
    }
  }

  return (
    <Stack
      sx={{
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "16px",
        gap: "12px",
        width: "100%",
        backgroundColor: "var(--white)",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          borderColor: statusColor,
        },
      }}
    >
      {/* Header */}
      <Stack
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        gap="12px"
      >
        <Stack flexDirection="row" alignItems="center" gap="12px">
          {/* Question Number Badge */}
          <Box
            sx={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: statusBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: "700",
                color: statusColor,
              }}
            >
              {qNum}
            </Typography>
          </Box>

          {/* Type Chip */}
          <Chip
            label={question.type}
            size="small"
            sx={{
              fontSize: "11px",
              fontWeight: "600",
              backgroundColor: "rgba(102, 126, 234, 0.08)",
              color: "var(--primary-color)",
              borderRadius: "6px",
              height: "24px",
            }}
          />
        </Stack>

        {/* Status and Marks */}
        <Stack flexDirection="row" alignItems="center" gap="8px">
          {isSkipped && (
            <Chip
              size="small"
              label="Skipped"
              sx={{
                fontSize: "11px",
                fontWeight: "600",
                backgroundColor: "rgba(255, 152, 0, 0.08)",
                color: "#ff9800",
                borderRadius: "6px",
                height: "24px",
              }}
            />
          )}
          {isUnattempted && (
            <Chip
              size="small"
              label="Not Attempted"
              sx={{
                fontSize: "11px",
                fontWeight: "600",
                backgroundColor: "rgba(158, 158, 158, 0.08)",
                color: "#9e9e9e",
                borderRadius: "6px",
                height: "24px",
              }}
            />
          )}

          {/* Marks Display */}
          <Stack flexDirection="row" gap="6px">
            <Chip
              label={`+${userAnswer?.pMarkObtained || 0}`}
              size="small"
              icon={<CheckCircleOutline sx={{ fontSize: "14px !important" }} />}
              sx={{
                fontSize: "11px",
                fontWeight: "600",
                backgroundColor: "rgba(76, 175, 80, 0.08)",
                color: "#4caf50",
                borderRadius: "6px",
                height: "24px",
                "& .MuiChip-icon": { color: "#4caf50", marginLeft: "6px" },
              }}
            />
            <Chip
              label={`-${userAnswer?.nMarkObtained || 0}`}
              size="small"
              icon={<CancelOutlined sx={{ fontSize: "14px !important" }} />}
              sx={{
                fontSize: "11px",
                fontWeight: "600",
                backgroundColor: "rgba(244, 67, 54, 0.08)",
                color: "#f44336",
                borderRadius: "6px",
                height: "24px",
                "& .MuiChip-icon": { color: "#f44336", marginLeft: "6px" },
              }}
            />
          </Stack>
        </Stack>
      </Stack>

      {/* Question Text */}
      <Box sx={{ "& p": { margin: 0, fontSize: "14px", lineHeight: 1.6 } }}>
        <MDPreview value={question.title} />
      </Box>

      {/* Options - MCQ/MSQ */}
      {(question.type === "MCQ" || question.type === "MSQ") && (
        <Stack
          flexDirection="row"
          flexWrap="wrap"
          gap="12px"
          sx={{ marginTop: "8px" }}
        >
          {options.map((option, index) => {
            const isSelected = userAnswer?.selectedOptions?.includes(option.id);

            // Get correct options from answerInfo
            const correctOptionIds =
              answerInfo?.correct?.map((o) => o.id) || [];
            const isOptionCorrect = correctOptionIds.includes(option.id);

            let borderColor = "var(--border-color)";
            let backgroundColor = "var(--white)";
            let textColor = "var(--text1)";
            let badgeColor = "#9e9e9e";
            let badgeBg = "rgba(158, 158, 158, 0.1)";

            if (isSelected && isOptionCorrect) {
              borderColor = "#4caf50";
              backgroundColor = "rgba(76, 175, 80, 0.02)";
              badgeColor = "#4caf50";
              badgeBg = "rgba(76, 175, 80, 0.12)";
            } else if (isSelected && !isOptionCorrect) {
              borderColor = "#f44336";
              backgroundColor = "rgba(244, 67, 54, 0.02)";
              badgeColor = "#f44336";
              badgeBg = "rgba(244, 67, 54, 0.12)";
            } else if (!isSelected && isOptionCorrect) {
              borderColor = "#4caf50";
              backgroundColor = "rgba(76, 175, 80, 0.02)";
              badgeColor = "#4caf50";
              badgeBg = "rgba(76, 175, 80, 0.12)";
            }

            const optionLabel = String.fromCharCode(65 + index); // A, B, C, D

            return (
              <Stack
                key={index}
                flexDirection="row"
                alignItems="center"
                gap="10px"
                sx={{
                  border: `1.5px solid ${borderColor}`,
                  backgroundColor,
                  padding: "10px 12px",
                  width: { xs: "100%", md: "calc(50% - 6px)" },
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Option Letter Badge */}
                <Box
                  sx={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: badgeBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: badgeColor,
                    }}
                  >
                    {optionLabel}
                  </Typography>
                </Box>

                {/* Option Text */}
                <Stack gap="4px" width="100%">
                  <Box sx={{ "& p": { margin: 0, fontSize: "13px" } }}>
                    <MDPreview value={option.text} />
                  </Box>

                  {/* Status Label */}
                  {(isSelected || isOptionCorrect) && (
                    <Stack flexDirection="row" alignItems="center" gap="4px">
                      {isSelected && isOptionCorrect && (
                        <Typography
                          sx={{
                            fontSize: "11px",
                            fontWeight: "600",
                            color: "#4caf50",
                          }}
                        >
                          ✓ Correct Answer
                        </Typography>
                      )}
                      {isSelected && !isOptionCorrect && (
                        <Typography
                          sx={{
                            fontSize: "11px",
                            fontWeight: "600",
                            color: "#f44336",
                          }}
                        >
                          ✗ Incorrect Answer
                        </Typography>
                      )}
                      {!isSelected && isOptionCorrect && (
                        <Typography
                          sx={{
                            fontSize: "11px",
                            fontWeight: "600",
                            color: "#4caf50",
                          }}
                        >
                          ✓ Correct Answer (Missed)
                        </Typography>
                      )}
                    </Stack>
                  )}
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      )}

      {/* Fill in the Blanks */}
      {question.type === "FIB" && (
        <Stack gap="12px" sx={{ marginTop: "8px" }}>
          {(question.blanks || []).map((blank, index) => {
            const userResponse = userAnswer?.blankAnswers?.[index] || "";
            const correctAnswers =
              answerInfo?.blanks?.[index]?.correctAnswers || [];
            const isCorrect = correctAnswers.some(
              (a) =>
                a.trim().toLowerCase() === userResponse.trim().toLowerCase()
            );

            if (!userResponse) return null;

            return (
              <Stack
                key={index}
                gap="8px"
                sx={{
                  border: `1.5px solid ${isCorrect ? "#4caf50" : "#f44336"}`,
                  backgroundColor: isCorrect
                    ? "rgba(76, 175, 80, 0.02)"
                    : "rgba(244, 67, 54, 0.02)",
                  padding: "12px",
                  borderRadius: "8px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: isCorrect ? "#4caf50" : "#f44336",
                  }}
                >
                  {isCorrect ? "✓" : "✗"} Blank {index + 1}
                </Typography>
                <Box sx={{ "& p": { margin: 0, fontSize: "13px" } }}>
                  <MDPreview value={`Your Answer: ${userResponse}`} />
                </Box>
              </Stack>
            );
          })}
        </Stack>
      )}

      {/* Solution Accordion */}
      {(question.solution || answerInfo?.solution) && (
        <Accordion
          expanded={expanded}
          onChange={handleToggle}
          sx={{
            boxShadow: "none",
            border: "1px solid rgba(102, 126, 234, 0.2)",
            borderRadius: "8px !important",
            overflow: "hidden",
            backgroundColor: "rgba(102, 126, 234, 0.02)",
            marginTop: "8px",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            sx={{
              padding: "8px 12px",
              minHeight: "auto !important",
              "& .MuiAccordionSummary-content": {
                margin: "0 !important",
              },
            }}
          >
            <Stack
              flexDirection="row"
              alignItems="center"
              gap="8px"
              width="100%"
            >
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--primary-color)",
                  flex: 1,
                }}
              >
                {expanded ? "Hide Solution" : "View Solution"}
              </Typography>
              {expanded ? (
                <ExpandLess
                  sx={{ fontSize: "20px", color: "var(--primary-color)" }}
                />
              ) : (
                <ExpandMore
                  sx={{ fontSize: "20px", color: "var(--primary-color)" }}
                />
              )}
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: "12px", paddingTop: "0" }}>
            <Box sx={{ "& p": { margin: 0, fontSize: "13px" } }}>
              <MDPreview value={question.solution || answerInfo?.solution} />
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
    </Stack>
  );
}
