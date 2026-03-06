"use client";
import {
  Button,
  Chip,
  Skeleton,
  Stack,
  Typography,
  Box,
  Tooltip,
} from "@mui/material";
import {
  FilterAlt,
  Logout,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
  FileDownload,
  Close,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { exportExamToPDF } from "@/src/utils/exportExamPDF";
import { writeExcel } from "@/src/lib/excel";
import StudentProgressCard from "./StudentProgressCard";
import SearchBox from "../../SearchBox/SearchBox";
import FilterSideNav from "../../FilterSideNav/FilterSideNav";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useParams } from "next/navigation";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import QuestionPreview from "@/src/app/dashboard/students/[id]/QuestionPreview";

export default function ExamStudents({
  examAttempts,
  setExamAttempts,
  showStudentList = true,
  exam,
}) {
  const { examID } = useParams();
  const { showSnackbar } = useSnackbar();
  const [forceSubmitting, setForceSubmitting] = useState(null);
  const [isLoading, setIsLoading] = useState(
    examAttempts.length === 0 ? true : false
  );
  const [allStudents, setAllStudents] = useState([]);
  const [batchStudents, setBatchStudents] = useState([]);
  const [individualStudents, setIndividualStudents] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "All",
    sortBy: "Newest",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(20);
  const [activeStatusFilter, setActiveStatusFilter] = useState("All");

  // Use ref to track if data has been fetched
  const hasFetchedAttempts = useRef(false);

  const filtersConfig = [
    {
      name: "status",
      label: "Status",
      type: "chip",
      options: [
        { label: "All", value: "All" },
        { label: "Completed", value: "COMPLETED" },
        { label: "In Progress", value: "IN_PROGRESS" },
        { label: "Not Attended", value: "NOT_ATTENDED" },
      ],
    },
    {
      name: "sortBy",
      label: "Sort By",
      type: "select",
      options: [
        { label: "Newest First", value: "Newest" },
        { label: "Oldest First", value: "Oldest" },
        { label: "Marks: High to Low", value: "MarksHighLow" },
        { label: "Marks: Low to High", value: "MarksLowHigh" },
        { label: "Name: A-Z", value: "NameAZ" },
        { label: "Name: Z-A", value: "NameZA" },
      ],
    },
  ];

  const filterOpen = () => {
    setIsOpen(!isOpen);
  };

  // Fetch batch students
  useEffect(() => {
    const fetchBatchStudents = async () => {
      if (exam?.batchList && exam.batchList.length > 0) {
        try {
          const data = await apiFetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/get-students-by-batch`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ batchIds: exam.batchList }),
            }
          );
          if (data.success) {
            setBatchStudents(data.data);
          }
        } catch (error) {
          console.error("Error fetching batch students:", error);
        }
      }
    };
    fetchBatchStudents();
  }, [exam?.batchList]);

  // Fetch individual students
  useEffect(() => {
    const fetchIndividualStudents = async () => {
      if (exam?.studentList && exam.studentList.length > 0) {
        try {
          const data = await apiFetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/get-by-ids`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ids: exam.studentList }),
            }
          );
          if (data.success) {
            setIndividualStudents(data.data);
          }
        } catch (error) {
          console.error("Error fetching individual students:", error);
        }
      }
    };
    fetchIndividualStudents();
  }, [exam?.studentList]);

  // Merge attempts, batch students, and individual students
  useEffect(() => {
    if (!examAttempts) return;

    // Use Email as the unique identifier
    const attemptsMap = new Map();

    examAttempts.forEach((attempt) => {
      const email = attempt.userMeta?.email;
      if (email) {
        // Try to find matching batch student to enrich attempt with rollNo/tag
        const batchStudent = batchStudents.find(
          (bs) => bs.studentMeta?.email?.toLowerCase() === email.toLowerCase()
        );
        if (batchStudent) {
          attempt.rollNo = batchStudent.rollNo || "-";
          attempt.tag = batchStudent.tag || "-";
        }
        attemptsMap.set(email.toLowerCase(), attempt);
      }
    });

    const mergedList = [...examAttempts];

    // Helper to add student if not present
    const addIfNotPresent = (student, isBatch = false) => {
      const email = isBatch ? student.studentMeta?.email : student.email;

      if (!email) return;

      const normalizedEmail = email.toLowerCase();

      if (!attemptsMap.has(normalizedEmail)) {
        // Check if already added to mergedList
        const alreadyAdded = mergedList.some((item) => {
          const itemEmail = item.userMeta?.email;
          return itemEmail && itemEmail.toLowerCase() === normalizedEmail;
        });

        if (!alreadyAdded) {
          // Get ID for the new entry
          const userID = isBatch ? student.id : student.id;

          mergedList.push({
            userID: userID, // Keep the ID for reference
            userMeta: {
              name: isBatch
                ? student.studentMeta?.name
                : student.name || "Unknown",
              email: email,
              image: isBatch ? student.studentMeta?.image : student.image,
            },
            batchMeta: isBatch
              ? {
                  title: student.batchMeta?.title || "",
                  instituteMeta: student.batchMeta?.instituteMeta,
                }
              : null,
            rollNo: isBatch ? student.rollNo || "-" : "-",
            tag: isBatch ? student.tag || "-" : "-",
            status: "NOT_ATTENDED",
            obtainedMarks: 0,
            totalMarks: 0,
            startTimeStamp: null,
            title: exam?.title || "",
            type: "scheduled",
          });
        }
      }
    };

    batchStudents.forEach((student) => addIfNotPresent(student, true));
    individualStudents.forEach((student) => addIfNotPresent(student, false));

    setAllStudents(mergedList);
  }, [examAttempts, batchStudents, individualStudents, exam]);

  // Apply search and filter
  const filteredAttempts = useMemo(() => {
    const statusFilter = activeStatusFilter !== "All" ? activeStatusFilter : filters.status;
    return allStudents
      .filter((item) => {
        const matchesSearch =
          searchQuery === "" ||
          item.userMeta?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.userMeta?.email?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "All" || item.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "Newest":
            if (!a.startTimeStamp) return 1;
            if (!b.startTimeStamp) return -1;
            return new Date(b.startTimeStamp) - new Date(a.startTimeStamp);
          case "Oldest":
            if (!a.startTimeStamp) return 1;
            if (!b.startTimeStamp) return -1;
            return new Date(a.startTimeStamp) - new Date(b.startTimeStamp);
          case "MarksHighLow":
            return (b.obtainedMarks || 0) - (a.obtainedMarks || 0);
          case "MarksLowHigh":
            return (a.obtainedMarks || 0) - (b.obtainedMarks || 0);
          case "NameAZ":
            return (a.userMeta?.name || "").localeCompare(b.userMeta?.name || "");
          case "NameZA":
            return (b.userMeta?.name || "").localeCompare(a.userMeta?.name || "");
          default:
            return 0;
        }
      });
  }, [allStudents, searchQuery, activeStatusFilter, filters]);

  // Paginated data
  const paginatedAttempts = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAttempts.slice(start, start + rowsPerPage);
  }, [filteredAttempts, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredAttempts.length / rowsPerPage);

  const handleStudentClick = (attempt) => {
    setSelectedAttempt(attempt);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailDialogOpen(false);
    setSelectedAttempt(null);
  };

  const handleForceSubmit = async (e, attempt) => {
    e.stopPropagation();
    if (!attempt.pKey) return;
    setForceSubmitting(attempt.pKey);
    try {
      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/force-submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attemptPKey: attempt.pKey }),
        }
      );
      if (res.success) {
        showSnackbar("Attempt submitted successfully", "success", "", "3000");
        // Update local state
        setExamAttempts((prev) =>
          prev.map((a) =>
            a.pKey === attempt.pKey
              ? { ...a, status: "COMPLETED", obtainedMarks: res.data.obtainedMarks }
              : a
          )
        );
      } else {
        showSnackbar(res.message || "Failed to submit", "error", "", "3000");
      }
    } catch (error) {
      console.error("Force submit error:", error);
      showSnackbar("Failed to force submit", "error", "", "3000");
    } finally {
      setForceSubmitting(null);
    }
  };

  const handleExport = () => {
    // Export filtered data
    const dataToExport = filteredAttempts.map((item) => ({
      Name: item.userMeta?.name,
      "Roll No": item.rollNo || "-",
      Email: item.userMeta?.email,
      "Exam Name": item.title,
      College: item.batchMeta?.instituteMeta?.title,
      Batch: item.batchMeta?.title,
      Department: item.tag || "-",
      Status: item.status,
      "Date & Time": new Date(item.startTimeStamp).toLocaleString(),
      Marks: `${item.obtainedMarks} / ${item.totalMarks}`,
      "Percentage (%)": ((item.obtainedMarks / item.totalMarks) * 100).toFixed(
        2
      ),
    }));

    if (dataToExport.length === 0) return;

    writeExcel(dataToExport, `${dataToExport[0]["Exam Name"]}.xlsx`, "Results");
  };

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setIsOpen(open);
  };

  const fetchExamAttempts = useCallback(async () => {
    if (hasFetchedAttempts.current && examAttempts.length > 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/${examID}/get-exam-attempts`
      );
      if (response.success) {
        setExamAttempts(response.data);
        hasFetchedAttempts.current = true;
      }
    } catch (error) {
      console.error("Failed to fetch exam attempts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [examID, setExamAttempts, examAttempts.length]);

  useEffect(() => {
    // Only fetch if not already fetched
    if (!hasFetchedAttempts.current) {
      fetchExamAttempts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency - only run on mount

  // Analytics Calculations
  const totalStudents = allStudents.length;
  const completedStudents = examAttempts.filter(
    (item) => item.status === "COMPLETED"
  ).length;
  const inProgressStudents = examAttempts.filter(
    (item) => item.status === "IN_PROGRESS"
  ).length;
  const notAttendedStudents = totalStudents - completedStudents - inProgressStudents;

  const scores = examAttempts
    .filter((item) => item.status === "COMPLETED")
    .map((item) => item.obtainedMarks);

  const percentages = examAttempts
    .filter((item) => item.status === "COMPLETED" && item.totalMarks > 0)
    .map((item) => (item.obtainedMarks / item.totalMarks) * 100);

  const averageScore =
    scores.length > 0
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : 0;

  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

  const averagePercent =
    percentages.length > 0
      ? (percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(0)
      : 0;

  // Score Distribution
  const scoreDistribution = { above80: 0, s60to80: 0, s40to60: 0, below40: 0 };
  percentages.forEach((p) => {
    if (p >= 80) scoreDistribution.above80++;
    else if (p >= 60) scoreDistribution.s60to80++;
    else if (p >= 40) scoreDistribution.s40to60++;
    else scoreDistribution.below40++;
  });

  const passCount = scoreDistribution.above80 + scoreDistribution.s60to80 + scoreDistribution.s40to60;
  const failCount = scoreDistribution.below40;

  const passPercentage =
    completedStudents > 0
      ? ((passCount / completedStudents) * 100).toFixed(0)
      : 0;

  const completionRate =
    totalStudents > 0
      ? ((completedStudents / totalStudents) * 100).toFixed(0)
      : 0;

  // Top Performers
  const topPerformers = examAttempts
    .filter((item) => item.status === "COMPLETED")
    .sort((a, b) => b.obtainedMarks - a.obtainedMarks)
    .slice(0, 3);

  // Components
  const StatCard = ({ title, value, subtext, icon, color }) => (
    <Stack
      sx={{
        flex: "1 1 160px",
        padding: "12px 16px",
        borderRadius: "10px",
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: color,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        },
      }}
    >
      <Stack flexDirection="row" alignItems="center" gap="12px">
        <Box
          sx={{
            padding: "6px",
            borderRadius: "8px",
            backgroundColor: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
        <Stack>
          <Typography
            sx={{
              fontSize: "11px",
              fontWeight: "600",
              color: "var(--text3)",
              fontFamily: "Lato",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: "700",
              color: "var(--text1)",
              fontFamily: "Lato",
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );

  const DonutChart = ({ percentage, color }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <Box sx={{ position: "relative", width: "90px", height: "90px", flexShrink: 0 }}>
        <svg width="90" height="90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f0f0f0" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={radius} fill="transparent" stroke={color} strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>
        <Box
          sx={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)", textAlign: "center",
          }}
        >
          <Typography sx={{ fontSize: "15px", fontWeight: "700", color }}>
            {percentage}%
          </Typography>
          <Typography sx={{ fontSize: "9px", color: "var(--text4)" }}>
            Pass Rate
          </Typography>
        </Box>
      </Box>
    );
  };

  // Score Distribution Bar helper
  const DistBar = ({ label, count, total, color }) => {
    const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
    return (
      <Stack gap="2px">
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "var(--text2)" }}>{label}</Typography>
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color }}>{count} ({pct}%)</Typography>
        </Stack>
        <Box sx={{ height: 6, borderRadius: 3, backgroundColor: "#f0f0f0", overflow: "hidden" }}>
          <Box sx={{ height: "100%", width: `${pct}%`, backgroundColor: color, borderRadius: 3, transition: "width 0.8s ease" }} />
        </Box>
      </Stack>
    );
  };

  return (
    <Stack marginTop="12px" gap="14px" padding="8px">
      {/* Row 1: Key Metrics */}
      <Stack
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "10px",
        }}
      >
        <StatCard title="Total" value={totalStudents} icon={<PeopleIcon sx={{ fontSize: "18px", color: "var(--primary-color)" }} />} color="var(--primary-color)" />
        <StatCard title="Completed" value={completedStudents} icon={<CheckCircleIcon sx={{ fontSize: "18px", color: "#4caf50" }} />} color="#4caf50" />
        <StatCard title="Not Attended" value={notAttendedStudents} icon={<HourglassEmptyIcon sx={{ fontSize: "18px", color: "#ff9800" }} />} color="#ff9800" />
        <StatCard title="Avg Score" value={averageScore} icon={<TrendingUpIcon sx={{ fontSize: "18px", color: "#2196f3" }} />} color="#2196f3" />
        <StatCard title="Highest" value={highestScore} icon={<TrendingUpIcon sx={{ fontSize: "18px", color: "#4caf50" }} />} color="#4caf50" />
        <StatCard title="Lowest" value={lowestScore} icon={<TrendingDownIcon sx={{ fontSize: "18px", color: "#f44336" }} />} color="#f44336" />
      </Stack>

      {/* Row 2: Analytics Cards */}
      <Stack
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
          gap: "10px",
        }}
      >
        {/* Completion & Pass Rate */}
        <Stack
          sx={{
            backgroundColor: "var(--white)",
            borderRadius: "10px",
            padding: "14px",
            border: "1px solid var(--border-color)",
          }}
        >
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "var(--text2)", mb: 1.5 }}>
            Completion & Pass Rate
          </Typography>
          <Stack gap="12px">
            <Stack flexDirection="row" alignItems="center" gap="10px">
              <DonutChart percentage={completionRate} color="var(--primary-color)" />
              <Stack gap="4px" flex={1}>
                <Stack flexDirection="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: "11px", color: "var(--text3)" }}>Completion</Typography>
                  <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "var(--primary-color)" }}>{completionRate}%</Typography>
                </Stack>
                <Stack flexDirection="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: "11px", color: "var(--text3)" }}>Pass Rate</Typography>
                  <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#4caf50" }}>{passPercentage}%</Typography>
                </Stack>
                <Stack flexDirection="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: "11px", color: "var(--text3)" }}>Avg %</Typography>
                  <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#2196f3" }}>{averagePercent}%</Typography>
                </Stack>
              </Stack>
            </Stack>
            <Stack flexDirection="row" gap="6px">
              <Tooltip title={`Passed: ${passCount}`} arrow>
                <Box sx={{ flex: passCount || 1, height: 8, borderRadius: 4, backgroundColor: "#4caf50", cursor: "pointer" }} />
              </Tooltip>
              <Tooltip title={`Failed: ${failCount}`} arrow>
                <Box sx={{ flex: failCount || 1, height: 8, borderRadius: 4, backgroundColor: "#f44336", cursor: "pointer" }} />
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>

        {/* Score Distribution */}
        <Stack
          sx={{
            backgroundColor: "var(--white)",
            borderRadius: "10px",
            padding: "14px",
            border: "1px solid var(--border-color)",
          }}
        >
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "var(--text2)", mb: 1.5 }}>
            Score Distribution
          </Typography>
          <Stack gap="8px">
            <DistBar label="80-100%" count={scoreDistribution.above80} total={completedStudents} color="#4caf50" />
            <DistBar label="60-80%" count={scoreDistribution.s60to80} total={completedStudents} color="#8bc34a" />
            <DistBar label="40-60%" count={scoreDistribution.s40to60} total={completedStudents} color="#ff9800" />
            <DistBar label="Below 40%" count={scoreDistribution.below40} total={completedStudents} color="#f44336" />
          </Stack>
        </Stack>

        {/* Top Performers */}
        <Stack
          sx={{
            backgroundColor: "var(--white)",
            borderRadius: "10px",
            padding: "14px",
            border: "1px solid var(--border-color)",
          }}
        >
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "var(--text2)", mb: 1.5 }}>
            Top Performers
          </Typography>
          <Stack gap="4px">
            {topPerformers.length > 0 ? (
              topPerformers.map((student, index) => (
                <Stack
                  key={index}
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    backgroundColor: index === 0 ? "#fff8e1" : "transparent",
                    border: index === 0 ? "1px solid #ffecb3" : "1px solid transparent",
                    "&:hover": { backgroundColor: "var(--bg-color)" },
                  }}
                >
                  <Stack flexDirection="row" alignItems="center" gap="8px">
                    <Box
                      sx={{
                        width: 20, height: 20, borderRadius: "50%",
                        bgcolor: index === 0 ? "#ffc107" : "#f5f5f5",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: index === 0 ? "white" : "var(--text4)",
                        fontWeight: 700, fontSize: "10px",
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Stack>
                      <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "var(--text2)" }}>
                        {student.userMeta?.name || "Unknown"}
                      </Typography>
                      <Typography sx={{ fontSize: "10px", color: "var(--text4)" }}>
                        {student.userMeta?.email}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "var(--primary-color)" }}>
                    {student.obtainedMarks}/{student.totalMarks}
                  </Typography>
                </Stack>
              ))
            ) : (
              <Stack alignItems="center" justifyContent="center" height="60px">
                <Typography sx={{ color: "var(--text4)", fontSize: "12px" }}>No data yet</Typography>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>

      {/* Action Bar */}
      {showStudentList && (
        <Stack gap="10px">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            gap="12px"
            padding="10px 14px"
            sx={{
              backgroundColor: "var(--white)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
            }}
          >
            <Stack sx={{ position: "relative", width: "250px" }}>
              <SearchBox
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                placeholder="Search by name or email..."
              />
              {searchQuery && (
                <Stack
                  sx={{
                    position: "absolute",
                    right: "40px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    padding: "1px 6px",
                    backgroundColor: "var(--primary-color)",
                    borderRadius: "8px",
                  }}
                >
                  <Typography
                    sx={{ fontSize: "10px", color: "#fff", fontWeight: 700 }}
                  >
                    {filteredAttempts.length}
                  </Typography>
                </Stack>
              )}
            </Stack>

            <Stack direction="row" gap="8px" alignItems="center">
              <Button
                variant="contained"
                size="small"
                startIcon={<Logout sx={{ transform: "rotate(-90deg)", fontSize: "16px" }} />}
                onClick={handleExport}
                disabled={filteredAttempts.length === 0}
                sx={{
                  backgroundColor: "var(--primary-color)",
                  color: "#fff",
                  textTransform: "none",
                  borderRadius: "8px",
                  padding: "6px 16px",
                  fontWeight: 600,
                  fontSize: "13px",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "var(--primary-color-dark)",
                    boxShadow: "0 2px 8px rgba(24, 113, 99, 0.2)",
                  },
                  "&:disabled": {
                    background: "rgba(158, 158, 158, 0.12)",
                    color: "var(--text3)",
                  },
                }}
                disableElevation
              >
                Export
              </Button>

              <Button
                variant="outlined"
                size="small"
                startIcon={<FilterAlt sx={{ fontSize: "16px" }} />}
                onClick={filterOpen}
                sx={{
                  borderColor: "var(--border-color)",
                  color: "var(--text2)",
                  textTransform: "none",
                  borderRadius: "8px",
                  padding: "6px 14px",
                  fontWeight: 600,
                  fontSize: "13px",
                  "&:hover": {
                    borderColor: "var(--primary-color)",
                    backgroundColor: "rgba(24, 113, 99, 0.04)",
                  },
                }}
              >
                Filters
              </Button>
            </Stack>
          </Stack>

          {/* Inline Status Filter Chips */}
          <Stack direction="row" gap="6px" alignItems="center" flexWrap="wrap">
            {[
              { label: "All", value: "All", count: allStudents.length },
              { label: "Completed", value: "COMPLETED", count: completedStudents, color: "#4caf50" },
              { label: "In Progress", value: "IN_PROGRESS", count: inProgressStudents, color: "#2196f3" },
              { label: "Absent", value: "NOT_ATTENDED", count: notAttendedStudents, color: "#9e9e9e" },
            ].map((f) => {
              const isActive = activeStatusFilter === f.value;
              return (
                <Chip
                  key={f.value}
                  label={`${f.label} (${f.count})`}
                  size="small"
                  onClick={() => { setActiveStatusFilter(f.value); setPage(0); }}
                  sx={{
                    height: "26px",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                    backgroundColor: isActive
                      ? (f.color ? `${f.color}18` : "var(--primary-color-acc-2)")
                      : "transparent",
                    color: isActive
                      ? (f.color || "var(--primary-color)")
                      : "var(--text3)",
                    border: `1px solid ${isActive ? (f.color || "var(--primary-color)") + "40" : "var(--border-color)"}`,
                    "&:hover": {
                      backgroundColor: f.color ? `${f.color}12` : "var(--primary-color-acc-2)",
                    },
                  }}
                />
              );
            })}
          </Stack>
        </Stack>
      )}

      <FilterSideNav
        isOpen={isOpen}
        toggleDrawer={toggleDrawer}
        filtersConfig={filtersConfig}
        setFilters={setFilters}
        filters={filters}
      />

      <ExamDetailDialog
        open={isDetailDialogOpen}
        onClose={handleCloseDetails}
        attemptID={selectedAttempt?.pKey}
        userID={selectedAttempt?.userMeta?._id || selectedAttempt?.userMeta?.id}
        student={selectedAttempt?.userMeta}
      />

      {/* Student List */}
      {showStudentList && (
        <Stack gap="4px">
          {/* Table Header */}
          <Stack
            flexDirection="row"
            alignItems="center"
            sx={{
              padding: "6px 12px",
              gap: "12px",
              borderBottom: "2px solid var(--border-color)",
              backgroundColor: "var(--white)",
              borderRadius: "6px 6px 0 0",
            }}
          >
            <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.5px", minWidth: "24px", textAlign: "center" }}>#</Typography>
            <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.5px", minWidth: "180px", flex: 1 }}>Student</Typography>
            <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.5px", flex: 0.8, display: { xs: "none", md: "block" } }}>College</Typography>
            <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.5px", minWidth: "70px", textAlign: "center", display: { xs: "none", lg: "block" } }}>Roll No</Typography>
            <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.5px", minWidth: "65px", textAlign: "center", display: { xs: "none", lg: "block" } }}>Date</Typography>
            <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.5px", minWidth: "90px", textAlign: "right" }}>Marks</Typography>
            <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.5px", minWidth: "110px", textAlign: "center" }}>Status</Typography>
          </Stack>
          {!isLoading ? (
            filteredAttempts.length > 0 ? (
              <>
                {paginatedAttempts.map((item, index) => {
                  const globalIndex = page * rowsPerPage + index;
                  return (
                    item.type === "scheduled" && (
                      <StudentProgressCard
                        key={globalIndex}
                        index={globalIndex}
                        name={item.userMeta?.name}
                        email={item.userMeta?.email}
                        image={item.userMeta?.image}
                        status={item.status}
                        time={
                          item.startTimeStamp
                            ? new Date(item.startTimeStamp).toLocaleDateString()
                            : "-"
                        }
                        college={item.batchMeta?.instituteMeta?.title}
                        year={item.batchMeta?.title}
                        rollNo={item.rollNo}
                        tag={item.tag}
                        examName={item?.title}
                        marks={
                          item.status === "NOT_ATTENDED"
                            ? "-"
                            : `${item?.obtainedMarks}/${item?.totalMarks}`
                        }
                        percent={
                          item.status === "NOT_ATTENDED"
                            ? "-"
                            : `${(
                                (item.obtainedMarks / item.totalMarks) *
                                100
                              ).toFixed(0)}%`
                        }
                        onClick={() => handleStudentClick(item)}
                        onForceSubmit={item.status === "IN_PROGRESS" ? (e) => handleForceSubmit(e, item) : null}
                        isForceSubmitting={forceSubmitting === item.pKey}
                      />
                    )
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      padding: "8px 12px",
                      borderTop: "1px solid var(--border-color)",
                      mt: "4px",
                    }}
                  >
                    <Typography sx={{ fontSize: "12px", color: "var(--text4)" }}>
                      Showing {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredAttempts.length)} of {filteredAttempts.length}
                    </Typography>
                    <Stack direction="row" gap="4px" alignItems="center">
                      <IconButton
                        size="small"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        sx={{
                          width: 28, height: 28,
                          color: "var(--text2)",
                          "&:disabled": { color: "var(--text4)" },
                        }}
                      >
                        <ChevronLeft sx={{ fontSize: "18px" }} />
                      </IconButton>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i;
                        } else if (page < 3) {
                          pageNum = i;
                        } else if (page > totalPages - 4) {
                          pageNum = totalPages - 5 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        return (
                          <Box
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            sx={{
                              width: 28, height: 28,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              borderRadius: "6px",
                              fontSize: "12px", fontWeight: 600,
                              cursor: "pointer",
                              backgroundColor: page === pageNum ? "var(--primary-color)" : "transparent",
                              color: page === pageNum ? "#fff" : "var(--text3)",
                              "&:hover": {
                                backgroundColor: page === pageNum ? "var(--primary-color)" : "var(--primary-color-acc-2)",
                              },
                            }}
                          >
                            {pageNum + 1}
                          </Box>
                        );
                      })}
                      <IconButton
                        size="small"
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        sx={{
                          width: 28, height: 28,
                          color: "var(--text2)",
                          "&:disabled": { color: "var(--text4)" },
                        }}
                      >
                        <ChevronRight sx={{ fontSize: "18px" }} />
                      </IconButton>
                    </Stack>
                  </Stack>
                )}
              </>
            ) : (
              <Stack
                width="100%"
                minHeight="120px"
                justifyContent="center"
                alignItems="center"
                gap="6px"
              >
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--text3)",
                    fontFamily: "Lato",
                  }}
                >
                  No students found
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--text4)",
                    fontFamily: "Lato",
                  }}
                >
                  {searchQuery || activeStatusFilter !== "All"
                    ? "Try adjusting your search or filters"
                    : "No students have attempted this exam yet"}
                </Typography>
              </Stack>
            )
          ) : (
            Array.from({ length: 5 }).map((_, index) => (
              <StudentCardSkeleton key={index} />
            ))
          )}
        </Stack>
      )}
    </Stack>
  );
}

function StudentCardSkeleton() {
  return (
    <Stack
      flexDirection="row"
      padding="8px 12px"
      alignItems="center"
      gap="12px"
      width="100%"
      sx={{
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
      }}
    >
      <Stack flexDirection="row" alignItems="center" gap="10px" flex={1.2} minWidth="200px">
        <Skeleton variant="rectangular" animation="wave" sx={{ width: 32, height: 32, borderRadius: "8px" }} />
        <Stack gap="2px">
          <Skeleton variant="text" animation="wave" sx={{ width: 100 }} />
          <Skeleton variant="text" animation="wave" sx={{ width: 130, height: 14 }} />
        </Stack>
      </Stack>
      <Skeleton variant="text" animation="wave" sx={{ width: 100, flex: 1, display: { xs: "none", md: "block" } }} />
      <Skeleton variant="text" animation="wave" sx={{ width: 60, display: { xs: "none", lg: "block" } }} />
      <Skeleton variant="text" animation="wave" sx={{ width: 50, display: { xs: "none", lg: "block" } }} />
      <Skeleton variant="text" animation="wave" sx={{ width: 50 }} />
      <Skeleton variant="rectangular" animation="wave" sx={{ width: 65, height: 22, borderRadius: "11px" }} />
    </Stack>
  );
}

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
      setLoading(false);
    }
  }, [open, attemptID, userID]);

  if (!open) return null;

  // Compute stats
  const totalQuestions = details?.questions?.length || 0;
  let totalCorrect = 0, totalIncorrect = 0, totalSkipped = 0;
  details?.questions?.forEach((q) => {
    const ua = q.userAnswer;
    if (!ua) { totalSkipped++; return; }
    const isSkippedMCQMSQ = (q.type === "MCQ" || q.type === "MSQ") && ua.selectedOptions?.length === 0;
    const isSkippedFIB = q.type === "FIB" && (ua.blankAnswers?.length === 0 || ua.blankAnswers?.every((a) => a.trim() === ""));
    if (isSkippedMCQMSQ || isSkippedFIB) totalSkipped++;
    else if (ua.isCorrect) totalCorrect++;
    else totalIncorrect++;
  });

  const scorePercent = details?.totalMarks > 0
    ? Math.round((details.obtainedMarks / details.totalMarks) * 100) : 0;
  const getScoreColor = (s) => s >= 80 ? "#4caf50" : s >= 50 ? "#ff9800" : "#f44336";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          height: "85vh",
          overflow: "hidden",
        },
      }}
    >
      {/* Compact Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          padding: "12px 20px",
          borderBottom: "1px solid var(--border-color)",
          backgroundColor: "var(--white)",
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" gap="12px">
          {student?.image && (
            <Box
              component="img"
              src={student.image}
              sx={{ width: 32, height: 32, borderRadius: "8px", objectFit: "cover" }}
            />
          )}
          <Stack>
            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "var(--text1)" }}>
              {student?.name || "Student"}
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "var(--text4)" }}>
              {student?.email}
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" gap="8px" alignItems="center">
          {details && (
            <Button
              onClick={() => exportExamToPDF(details, details.answerList, student)}
              variant="contained"
              size="small"
              startIcon={<FileDownload sx={{ fontSize: "16px" }} />}
              disableElevation
              sx={{
                backgroundColor: "var(--primary-color)",
                color: "#fff",
                textTransform: "none",
                fontSize: "12px",
                fontWeight: 600,
                padding: "5px 14px",
                borderRadius: "8px",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "var(--primary-color-dark)",
                },
              }}
            >
              PDF
            </Button>
          )}
          <IconButton onClick={onClose} size="small" sx={{ width: 28, height: 28 }}>
            <Close sx={{ fontSize: "18px" }} />
          </IconButton>
        </Stack>
      </Stack>

      <DialogContent sx={{ padding: "0", overflow: "auto" }}>
        {loading ? (
          <Stack height="100%" justifyContent="center" alignItems="center" gap="12px">
            <CircularProgress size={28} />
            <Typography sx={{ color: "var(--text3)", fontSize: "13px" }}>Loading...</Typography>
          </Stack>
        ) : details ? (
          <Stack padding="16px 20px" gap="16px">
            {/* Score Banner */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                padding: "12px 16px",
                borderRadius: "10px",
                background: `linear-gradient(135deg, ${getScoreColor(scorePercent)}12, ${getScoreColor(scorePercent)}05)`,
                border: `1px solid ${getScoreColor(scorePercent)}25`,
              }}
            >
              <Stack gap="2px">
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "var(--text1)" }}>
                  {details.title}
                </Typography>
                <Typography sx={{ fontSize: "11px", color: "var(--text4)" }}>
                  {new Date(details.startTimeStamp).toLocaleString()}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap="12px">
                <Stack alignItems="flex-end">
                  <Typography sx={{ fontSize: "11px", color: "var(--text4)" }}>Score</Typography>
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "var(--text1)" }}>
                    {details.obtainedMarks}/{details.totalMarks}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    width: 48, height: 48,
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: `conic-gradient(${getScoreColor(scorePercent)} ${scorePercent * 3.6}deg, #f0f0f0 0deg)`,
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      width: 38, height: 38, borderRadius: "50%",
                      backgroundColor: "var(--white)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Typography sx={{ fontSize: "12px", fontWeight: 800, color: getScoreColor(scorePercent) }}>
                      {scorePercent}%
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Stack>

            {/* Overview Stats Row */}
            <Stack direction="row" gap="8px">
              {[
                { label: "Total", value: totalQuestions, color: "#2196F3" },
                { label: "Correct", value: totalCorrect, color: "#4CAF50" },
                { label: "Wrong", value: totalIncorrect, color: "#F44336" },
                { label: "Skipped", value: totalSkipped, color: "#FF9800" },
              ].map((s) => (
                <Stack
                  key={s.label}
                  flex={1}
                  alignItems="center"
                  sx={{
                    padding: "10px 8px",
                    borderRadius: "8px",
                    backgroundColor: `${s.color}08`,
                    border: `1px solid ${s.color}18`,
                  }}
                >
                  <Typography sx={{ fontSize: "18px", fontWeight: 800, color: s.color, lineHeight: 1.2 }}>
                    {s.value}
                  </Typography>
                  <Typography sx={{ fontSize: "10px", fontWeight: 600, color: "var(--text3)", mt: "2px" }}>
                    {s.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            {/* Accuracy Bar */}
            {totalQuestions > 0 && (
              <Stack gap="4px">
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "var(--text3)" }}>Accuracy</Typography>
                  <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "var(--primary-color)" }}>
                    {totalQuestions - totalSkipped > 0
                      ? Math.round((totalCorrect / (totalQuestions - totalSkipped)) * 100)
                      : 0}%
                  </Typography>
                </Stack>
                <Stack direction="row" gap="3px" sx={{ height: 6, borderRadius: 3, overflow: "hidden" }}>
                  <Box sx={{ flex: totalCorrect || 0.1, backgroundColor: "#4caf50", borderRadius: "3px 0 0 3px" }} />
                  <Box sx={{ flex: totalIncorrect || 0.1, backgroundColor: "#f44336" }} />
                  <Box sx={{ flex: totalSkipped || 0.1, backgroundColor: "#ff9800", borderRadius: "0 3px 3px 0" }} />
                </Stack>
                <Stack direction="row" gap="12px" justifyContent="center">
                  {[
                    { label: "Correct", color: "#4caf50" },
                    { label: "Wrong", color: "#f44336" },
                    { label: "Skipped", color: "#ff9800" },
                  ].map((l) => (
                    <Stack key={l.label} direction="row" alignItems="center" gap="4px">
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: l.color }} />
                      <Typography sx={{ fontSize: "10px", color: "var(--text4)" }}>{l.label}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            )}

            {/* Question Analysis */}
            <Stack gap="10px">
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "var(--text1)" }}>
                Question Analysis ({totalQuestions})
              </Typography>
              <Stack gap="10px">
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
          </Stack>
        ) : (
          <Stack height="100%" justifyContent="center" alignItems="center">
            <Typography sx={{ color: "var(--text3)", fontSize: "13px" }}>No details found</Typography>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};
