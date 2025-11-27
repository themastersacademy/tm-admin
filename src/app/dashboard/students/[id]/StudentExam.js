"use client";
import {
  Stack,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  Grid,
  LinearProgress,
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
} from "@mui/icons-material";
import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useParams } from "next/navigation";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";

export default function StudentExam() {
  const [examAttempts, setExamAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
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
    fetchExamAttempts();
  }, [params.id]);

  // Calculate Stats
  const stats = useMemo(() => {
    if (!examAttempts.length) return { total: 0, avg: 0, passed: 0 };
    const total = examAttempts.length;
    const totalScore = examAttempts.reduce(
      (acc, curr) => acc + (curr.obtainedMarks / curr.totalMarks) * 100,
      0
    );
    const passed = examAttempts.filter(
      (e) => (e.obtainedMarks / e.totalMarks) * 100 >= 40
    ).length;
    return {
      total,
      avg: Math.round(totalScore / total),
      passed,
      passRate: Math.round((passed / total) * 100),
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
    <Stack gap="32px" padding="24px">
      {/* Stats Overview */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Stack
            direction="row"
            gap="16px"
            flexWrap="wrap"
            sx={{
              "& > *": { flex: "1 1 180px" },
            }}
          >
            <StatBox
              label="Total Attempts"
              value={stats.total}
              icon={<Assignment sx={{ color: "#2196F3" }} />}
              color="#2196F3"
            />
            <StatBox
              label="Average Score"
              value={`${stats.avg}%`}
              icon={<TrendingUp sx={{ color: "#4CAF50" }} />}
              color="#4CAF50"
            />
            <StatBox
              label="Pass Rate"
              value={`${stats.passRate}%`}
              icon={<CheckCircle sx={{ color: "#FF9800" }} />}
              color="#FF9800"
            />
          </Stack>
        </Grid>
        <Grid item xs={12} md={4}>
          <Stack
            sx={{
              backgroundColor: "#FFF8E1",
              borderRadius: "12px",
              padding: "20px",
              height: "100%",
              border: "1px solid #FFECB3",
            }}
            gap="12px"
          >
            <Stack direction="row" gap="8px" alignItems="center">
              <Lightbulb sx={{ color: "#FFC107", fontSize: "20px" }} />
              <Typography
                sx={{ fontSize: "14px", fontWeight: 700, color: "#BF360C" }}
              >
                Performance Insight
              </Typography>
            </Stack>
            <Typography
              sx={{ fontSize: "13px", color: "#5D4037", lineHeight: 1.5 }}
            >
              {stats.avg > 70
                ? "Excellent performance! The student is consistently scoring above average. Recommend advanced mock tests."
                : stats.avg > 40
                ? "Good progress. Focus on improving consistency in lower-scoring subjects to boost the overall average."
                : "Needs attention. The student is struggling with core concepts. Recommend remedial sessions."}
            </Typography>
          </Stack>
        </Grid>
      </Grid>

      {/* Filters & Search */}
      <Stack gap="16px">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap="16px"
        >
          <Typography
            sx={{ fontSize: "18px", fontWeight: 700, color: "var(--text1)" }}
          >
            Exam History
          </Typography>
          <Stack direction="row" gap="16px">
            <TextField
              placeholder="Search exams..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "var(--text3)" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: "250px",
                backgroundColor: "var(--white)",
                "& .MuiOutlinedInput-root": { borderRadius: "8px" },
              }}
            />
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              size="small"
              displayEmpty
              sx={{
                width: "140px",
                backgroundColor: "var(--white)",
                borderRadius: "8px",
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="passed">Passed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </Stack>
        </Stack>

        {/* Exam List */}
        <Stack gap="12px">
          {isLoading ? (
            <Stack alignItems="center" padding="40px">
              <CircularProgress />
            </Stack>
          ) : filteredExams.length > 0 ? (
            filteredExams.map((exam, index) => (
              <ExamCard key={index} exam={exam} />
            ))
          ) : (
            <Stack
              width="100%"
              minHeight="300px"
              justifyContent="center"
              alignItems="center"
              sx={{
                backgroundColor: "var(--bg-color)",
                borderRadius: "12px",
                border: "1px dashed var(--border-color)",
              }}
            >
              <NoDataFound info="No exams found matching your criteria" />
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}

// Sub-components
const StatBox = ({ label, value, icon, color }) => (
  <Stack
    direction="row"
    alignItems="center"
    gap="16px"
    sx={{
      backgroundColor: "var(--white)",
      padding: "20px",
      borderRadius: "12px",
      border: "1px solid var(--border-color)",
      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    }}
  >
    <Box
      sx={{
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        backgroundColor: `${color}15`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {icon}
    </Box>
    <Stack>
      <Typography
        sx={{
          fontSize: "24px",
          fontWeight: 700,
          color: "var(--text1)",
          fontFamily: "Lato",
        }}
      >
        {value}
      </Typography>
      <Typography
        sx={{
          fontSize: "13px",
          color: "var(--text3)",
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>
    </Stack>
  </Stack>
);

const ExamCard = ({ exam }) => {
  const percentage = Math.round((exam.obtainedMarks / exam.totalMarks) * 100);
  const isPassed = percentage >= 40;
  const date = new Date(exam.startTimeStamp).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        backgroundColor: "var(--white)",
        padding: "16px 24px",
        borderRadius: "12px",
        border: "1px solid var(--border-color)",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateX(4px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          borderColor: "var(--primary-color)",
        },
      }}
    >
      {/* Left: Info */}
      <Stack direction="row" gap="20px" alignItems="center" flex={1}>
        <Box
          sx={{
            width: "50px",
            height: "50px",
            borderRadius: "12px",
            backgroundColor: isPassed ? "#E8F5E9" : "#FFEBEE",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: `1px solid ${isPassed ? "#C8E6C9" : "#FFCDD2"}`,
          }}
        >
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 700,
              color: isPassed ? "#2E7D32" : "#C62828",
            }}
          >
            {percentage}%
          </Typography>
        </Box>
        <Stack gap="4px">
          <Typography
            sx={{
              fontSize: "15px",
              fontWeight: 700,
              color: "var(--text1)",
              fontFamily: "Lato",
            }}
          >
            {exam.title}
          </Typography>
          <Stack direction="row" gap="12px" alignItems="center">
            <Stack direction="row" gap="4px" alignItems="center">
              <AccessTime sx={{ fontSize: "14px", color: "var(--text3)" }} />
              <Typography sx={{ fontSize: "12px", color: "var(--text3)" }}>
                {date}
              </Typography>
            </Stack>
            <Chip
              label={exam.type || "Practice"}
              size="small"
              sx={{
                height: "20px",
                fontSize: "10px",
                backgroundColor: "var(--bg-color)",
                color: "var(--text2)",
              }}
            />
          </Stack>
        </Stack>
      </Stack>

      {/* Middle: Progress Bar */}
      <Stack
        sx={{
          display: { xs: "none", md: "flex" },
          width: "200px",
          padding: "0 32px",
        }}
        gap="4px"
      >
        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ fontSize: "11px", color: "var(--text3)" }}>
            Score
          </Typography>
          <Typography sx={{ fontSize: "11px", fontWeight: 600 }}>
            {exam.obtainedMarks}/{exam.totalMarks}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: "var(--bg-color)",
            "& .MuiLinearProgress-bar": {
              backgroundColor: isPassed ? "#4CAF50" : "#F44336",
            },
          }}
        />
      </Stack>

      {/* Right: Status & Action */}
      <Stack
        direction="row"
        gap="16px"
        alignItems="center"
        justifyContent="flex-end"
        sx={{ minWidth: "140px" }}
      >
        <Chip
          icon={isPassed ? <CheckCircle /> : <Cancel />}
          label={isPassed ? "Passed" : "Failed"}
          size="small"
          sx={{
            backgroundColor: isPassed ? "#E8F5E9" : "#FFEBEE",
            color: isPassed ? "#2E7D32" : "#C62828",
            fontWeight: 600,
            "& .MuiChip-icon": {
              color: "inherit",
              fontSize: "16px",
            },
          }}
        />
        <Button
          variant="outlined"
          endIcon={<ArrowForward />}
          sx={{
            minWidth: "36px",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            padding: 0,
            borderColor: "var(--border-color)",
            color: "var(--text3)",
            "& .MuiButton-endIcon": { margin: 0 },
            "& .MuiButton-startIcon": { display: "none" },
            "&:hover": {
              borderColor: "var(--primary-color)",
              color: "var(--primary-color)",
              backgroundColor: "var(--primary-color-acc-2)",
            },
          }}
        />
      </Stack>
    </Stack>
  );
};
