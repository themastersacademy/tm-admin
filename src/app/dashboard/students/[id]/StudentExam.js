"use client";
import {
  Stack,
  Typography,
  Box,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  LinearProgress,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import {
  Search,
  Assignment,
  CheckCircle,
  TrendingUp,
  AccessTime,
  ArrowForward,
  Cancel,
  Lightbulb,
  Close,
  EmojiEvents,
  FileDownload,
} from "@mui/icons-material";
import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useParams } from "next/navigation";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import React from "react";
import { exportExamToPDF } from "@/src/utils/exportExamPDF";
import QuestionPreview from "./QuestionPreview";

export default function StudentExam({ student }) {
  const [examAttempts, setExamAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedExam, setSelectedExam] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const params = useParams();

  useEffect(() => {
    const fetchExamAttempts = async () => {
      setIsLoading(true);
      try {
        const response = await apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${params.id}/all-exam-attempts`
        );
        setExamAttempts(response.data || []);
      } catch (error) {
        console.error("Failed to fetch exams", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (params.id) {
      fetchExamAttempts();
    }
  }, [params.id]);

  const handleViewDetails = (exam) => {
    setSelectedExam(exam);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailDialogOpen(false);
    setSelectedExam(null);
  };

  // Calculate Stats
  const stats = useMemo(() => {
    if (!examAttempts.length)
      return { total: 0, avg: 0, passed: 0, passRate: 0, best: 0 };
    const total = examAttempts.length;
    const totalScore = examAttempts.reduce(
      (acc, curr) => acc + (curr.obtainedMarks / curr.totalMarks) * 100,
      0
    );
    const passed = examAttempts.filter(
      (e) => (e.obtainedMarks / e.totalMarks) * 100 >= 40
    ).length;
    const best = Math.max(
      ...examAttempts.map((e) =>
        Math.round((e.obtainedMarks / e.totalMarks) * 100)
      )
    );
    return {
      total,
      avg: Math.round(totalScore / total),
      passed,
      passRate: Math.round((passed / total) * 100),
      best,
    };
  }, [examAttempts]);

  // Filter Exams
  const filteredExams = useMemo(() => {
    return examAttempts.filter((exam) => {
      const matchesSearch = exam.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const percentage = (exam.obtainedMarks / exam.totalMarks) * 100;
      const isPassed = percentage >= 40;

      if (filterStatus === "passed") return matchesSearch && isPassed;
      if (filterStatus === "failed") return matchesSearch && !isPassed;
      return matchesSearch;
    });
  }, [examAttempts, searchQuery, filterStatus]);

  return (
    <Stack gap="24px" padding="24px">
      {/* Compact Stats Header */}
      <Stack
        sx={{
          backgroundColor: "var(--white)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {/* Stats Row */}
        <Stack
          direction="row"
          gap="1px"
          sx={{
            backgroundColor: "var(--border-color)",
          }}
        >
          <StatBox
            label="Total Attempts"
            value={stats.total}
            icon={<Assignment />}
            color="#2196F3"
            flex={1}
          />
          <StatBox
            label="Average Score"
            value={`${stats.avg}%`}
            icon={<TrendingUp />}
            color="#4CAF50"
            flex={1}
          />
          <StatBox
            label="Pass Rate"
            value={`${stats.passRate}%`}
            icon={<CheckCircle />}
            color="#FF9800"
            flex={1}
          />
          <StatBox
            label="Best Score"
            value={`${stats.best}%`}
            icon={<EmojiEvents />}
            color="#9C27B0"
            flex={1}
          />
        </Stack>
      </Stack>

      {/* Filters & Search Bar */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap="16px"
        flexWrap="wrap"
      >
        <Typography
          sx={{
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--text1)",
            fontFamily: "Lato",
          }}
        >
          Exam History ({filteredExams.length})
        </Typography>
        <Stack direction="row" gap="12px">
          <TextField
            placeholder="Search exams..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "var(--text3)", fontSize: "20px" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: "240px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "var(--white)",
              },
            }}
          />
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            size="small"
            sx={{
              width: "130px",
              borderRadius: "8px",
              backgroundColor: "var(--white)",
            }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="passed">Passed</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </Select>
        </Stack>
      </Stack>

      {/* Exam List - Table Style */}
      {isLoading ? (
        <Stack
          alignItems="center"
          justifyContent="center"
          minHeight="300px"
          sx={{
            backgroundColor: "var(--white)",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
          }}
        >
          <CircularProgress />
        </Stack>
      ) : filteredExams.length > 0 ? (
        <Stack
          sx={{
            backgroundColor: "var(--white)",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
            overflow: "hidden",
          }}
        >
          {/* Table Header */}
          <Stack
            direction="row"
            padding="16px 24px"
            sx={{
              backgroundColor: "var(--bg-color)",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text2)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                flex: 3,
              }}
            >
              Exam Name
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text2)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                flex: 1.5,
                textAlign: "center",
              }}
            >
              Date
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text2)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                flex: 1,
                textAlign: "center",
              }}
            >
              Grade
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text2)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                flex: 1.5,
                textAlign: "center",
              }}
            >
              Score
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text2)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                flex: 2,
                textAlign: "center",
              }}
            >
              Performance
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text2)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                flex: 1,
                textAlign: "center",
              }}
            >
              Status
            </Typography>
            <Box sx={{ width: "60px" }} />
          </Stack>

          {/* Table Rows */}
          <Stack>
            {filteredExams.map((exam, index) => (
              <ExamRow
                key={index}
                exam={exam}
                onViewDetails={handleViewDetails}
              />
            ))}
          </Stack>
        </Stack>
      ) : (
        <Stack
          minHeight="300px"
          justifyContent="center"
          alignItems="center"
          sx={{
            backgroundColor: "var(--white)",
            borderRadius: "12px",
            border: "1px dashed var(--border-color)",
          }}
        >
          <NoDataFound info="No exams found matching your criteria" />
        </Stack>
      )}

      <ExamDetailDialog
        open={isDetailDialogOpen}
        onClose={handleCloseDetails}
        attemptID={selectedExam?.pKey}
        userID={params.id}
        student={student}
      />
    </Stack>
  );
}

// Sub-components
const StatBox = ({ label, value, icon, color, flex }) => (
  <Stack
    direction="row"
    alignItems="center"
    gap="12px"
    padding="20px"
    sx={{
      backgroundColor: "var(--white)",
      flex: flex || 1,
    }}
  >
    <Stack
      sx={{
        width: "44px",
        height: "44px",
        borderRadius: "10px",
        backgroundColor: `${color}12`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: `1.5px solid ${color}30`,
      }}
    >
      {React.cloneElement(icon, {
        sx: { fontSize: "22px", color: color },
      })}
    </Stack>
    <Stack gap="2px">
      <Typography
        sx={{
          fontSize: "22px",
          fontWeight: 800,
          color: "var(--text1)",
          fontFamily: "Lato",
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
      <Typography
        sx={{
          fontSize: "12px",
          color: "var(--text3)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.3px",
        }}
      >
        {label}
      </Typography>
    </Stack>
  </Stack>
);

const ExamRow = ({ exam, onViewDetails }) => {
  const percentage = Math.round((exam.obtainedMarks / exam.totalMarks) * 100);
  const isPassed = percentage >= 40;
  const date = new Date(exam.startTimeStamp).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Get grade and color based on percentage
  const getGrade = () => {
    if (percentage >= 90) return { grade: "A+", color: "#4CAF50" };
    if (percentage >= 80) return { grade: "A", color: "#66BB6A" };
    if (percentage >= 70) return { grade: "B+", color: "#2196F3" };
    if (percentage >= 60) return { grade: "B", color: "#FF9800" };
    if (percentage >= 40) return { grade: "C", color: "#FFA726" };
    return { grade: "F", color: "#F44336" };
  };

  const gradeInfo = getGrade();

  return (
    <Stack
      direction="row"
      alignItems="center"
      padding="16px 24px"
      sx={{
        borderBottom: "1px solid var(--border-color)",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: "var(--bg-color)",
        },
        "&:last-child": {
          borderBottom: "none",
        },
      }}
    >
      {/* Exam Name */}
      <Stack flex={3} gap="4px">
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--text1)",
            fontFamily: "Lato",
          }}
        >
          {exam.title}
        </Typography>
        <Stack direction="row" gap="8px" alignItems="center">
          <Chip
            label={exam.type || "Practice"}
            size="small"
            sx={{
              height: "20px",
              fontSize: "11px",
              fontWeight: 600,
              backgroundColor: `${gradeInfo.color}15`,
              color: gradeInfo.color,
              border: `1px solid ${gradeInfo.color}30`,
            }}
          />
        </Stack>
      </Stack>

      {/* Date */}
      <Stack flex={1.5} alignItems="center">
        <Stack direction="row" gap="4px" alignItems="center">
          <AccessTime sx={{ fontSize: "14px", color: "var(--text3)" }} />
          <Typography
            sx={{
              fontSize: "13px",
              color: "var(--text2)",
              fontWeight: 500,
            }}
          >
            {date}
          </Typography>
        </Stack>
      </Stack>

      {/* Grade */}
      <Stack flex={1} alignItems="center">
        <Stack
          sx={{
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            background: `linear-gradient(135deg, ${gradeInfo.color} 0%, ${gradeInfo.color}CC 100%)`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: `0 2px 8px ${gradeInfo.color}40`,
          }}
        >
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 800,
              color: "#fff",
              fontFamily: "Lato",
            }}
          >
            {gradeInfo.grade}
          </Typography>
        </Stack>
      </Stack>

      {/* Score */}
      <Stack flex={1.5} alignItems="center" gap="2px">
        <Typography
          sx={{
            fontSize: "20px",
            fontWeight: 800,
            color: gradeInfo.color,
            fontFamily: "Lato",
            lineHeight: 1,
          }}
        >
          {percentage}%
        </Typography>
        <Typography
          sx={{
            fontSize: "12px",
            color: "var(--text3)",
            fontWeight: 500,
          }}
        >
          {exam.obtainedMarks}/{exam.totalMarks}
        </Typography>
      </Stack>

      {/* Performance Bar */}
      <Stack flex={2} padding="0 16px">
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: "var(--border-color)",
            "& .MuiLinearProgress-bar": {
              background: `linear-gradient(90deg, ${gradeInfo.color} 0%, ${gradeInfo.color}CC 100%)`,
              borderRadius: 3,
            },
          }}
        />
      </Stack>

      {/* Status */}
      <Stack flex={1} alignItems="center">
        <Chip
          icon={isPassed ? <CheckCircle /> : <Cancel />}
          label={isPassed ? "Passed" : "Failed"}
          size="small"
          sx={{
            height: "28px",
            fontWeight: 700,
            fontSize: "12px",
            backgroundColor: isPassed
              ? "rgba(76, 175, 80, 0.12)"
              : "rgba(244, 67, 54, 0.12)",
            color: isPassed ? "#2E7D32" : "#C62828",
            border: isPassed
              ? "1px solid rgba(76, 175, 80, 0.3)"
              : "1px solid rgba(244, 67, 54, 0.3)",
            "& .MuiChip-icon": {
              color: "inherit",
              fontSize: "16px",
            },
          }}
        />
      </Stack>

      {/* Action */}
      <Stack alignItems="center" sx={{ width: "60px" }}>
        <IconButton
          size="small"
          onClick={() => onViewDetails(exam)}
          sx={{
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            border: `1.5px solid ${gradeInfo.color}`,
            color: gradeInfo.color,
            "&:hover": {
              backgroundColor: `${gradeInfo.color}15`,
            },
          }}
        >
          <ArrowForward sx={{ fontSize: "16px" }} />
        </IconButton>
      </Stack>
    </Stack>
  );
};

const ExamDetailDialog = ({ open, onClose, attemptID, userID, student }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && attemptID) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const encodedID = encodeURIComponent(attemptID);
          const response = await apiFetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userID}/exam-attempt/${encodedID}`
          );
          setDetails(response.data);
        } catch (error) {
          console.error("Failed to fetch details", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    } else {
      setDetails(null);
    }
  }, [open, attemptID, userID]);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          height: "80vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: "18px", fontWeight: 700 }}>
          Exam Details
        </Typography>
        <Stack direction="row" gap="8px">
          {details && (
            <Button
              onClick={() =>
                exportExamToPDF(details, details.answerList, student)
              }
              variant="contained"
              startIcon={<FileDownload />}
              sx={{
                backgroundColor: "var(--primary-color)",
                color: "var(--white)",
                textTransform: "none",
                fontSize: "13px",
                fontWeight: 600,
                padding: "6px 16px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(102, 126, 234, 0.25)",
                "&:hover": {
                  backgroundColor: "var(--primary-color)",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.35)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease",
              }}
            >
              Download PDF
            </Button>
          )}
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ padding: "0" }}>
        {loading ? (
          <Stack
            height="100%"
            justifyContent="center"
            alignItems="center"
            gap="16px"
          >
            <CircularProgress />
            <Typography sx={{ color: "var(--text3)", fontSize: "14px" }}>
              Loading exam details...
            </Typography>
          </Stack>
        ) : details ? (
          <Stack padding="24px" gap="24px">
            {/* Header Info */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                backgroundColor: "var(--bg-color)",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
              }}
            >
              <Stack gap="4px">
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--text1)",
                  }}
                >
                  {details.title}
                </Typography>
                <Typography sx={{ fontSize: "13px", color: "var(--text3)" }}>
                  {new Date(details.startTimeStamp).toLocaleString()}
                </Typography>
              </Stack>
              <Stack alignItems="flex-end" gap="4px">
                <Typography
                  sx={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "var(--primary)",
                  }}
                >
                  {Math.round(
                    (details.obtainedMarks / details.totalMarks) * 100
                  )}
                  %
                </Typography>
                <Typography sx={{ fontSize: "13px", color: "var(--text3)" }}>
                  Score: {details.obtainedMarks}/{details.totalMarks}
                </Typography>
              </Stack>
            </Stack>

            {/* Overview Section */}
            <Stack gap="16px">
              <Typography
                sx={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "var(--text1)",
                }}
              >
                Overview
              </Typography>
              <Stack
                direction="row"
                flexWrap="wrap"
                gap="16px"
                sx={{
                  padding: "16px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "12px",
                  backgroundColor: "var(--white)",
                }}
              >
                {(() => {
                  const totalQuestions = details.questions?.length || 0;

                  let totalCorrect = 0;
                  let totalIncorrect = 0;
                  let totalSkipped = 0;
                  let totalUnattempted = 0;

                  details.questions?.forEach((q) => {
                    const ua = q.userAnswer;
                    if (!ua) {
                      totalUnattempted++;
                      return;
                    }

                    // Check if skipped
                    const isSkippedMCQMSQ =
                      (q.type === "MCQ" || q.type === "MSQ") &&
                      ua.selectedOptions?.length === 0;
                    const isSkippedFIB =
                      q.type === "FIB" &&
                      (ua.blankAnswers?.length === 0 ||
                        ua.blankAnswers?.every((a) => a.trim() === ""));

                    if (isSkippedMCQMSQ || isSkippedFIB) {
                      totalSkipped++;
                      return;
                    }

                    // Check correctness
                    // Use the isCorrect flag from the user answer if available
                    if (ua.isCorrect) {
                      totalCorrect++;
                    } else {
                      totalIncorrect++;
                    }
                  });

                  return (
                    <>
                      <StatBox
                        label="Total Questions"
                        value={totalQuestions}
                        icon={<Assignment />}
                        color="#2196F3"
                      />
                      <StatBox
                        label="Correct"
                        value={totalCorrect}
                        icon={<CheckCircle />}
                        color="#4CAF50"
                      />
                      <StatBox
                        label="Incorrect"
                        value={totalIncorrect}
                        icon={<Cancel />}
                        color="#F44336"
                      />
                      <StatBox
                        label="Skipped"
                        value={totalSkipped}
                        icon={<TrendingUp />}
                        color="#FF9800"
                      />
                      <StatBox
                        label="Unattempted"
                        value={totalUnattempted}
                        icon={<Lightbulb />}
                        color="#9C27B0"
                      />
                    </>
                  );
                })()}
              </Stack>
            </Stack>

            {/* Questions List */}
            <Stack gap="16px">
              <Typography
                sx={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "var(--text1)",
                }}
              >
                Question Analysis
              </Typography>
              {details.questions?.map((q, index) => (
                <QuestionPreview
                  key={index}
                  qNum={index + 1}
                  question={q}
                  answerList={details.answerList}
                />
              ))}
            </Stack>
          </Stack>
        ) : (
          <Stack height="100%" justifyContent="center" alignItems="center">
            <Typography>No details available</Typography>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};
