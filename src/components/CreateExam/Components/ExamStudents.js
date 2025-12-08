"use client";
import {
  Button,
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
} from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { exportExamToPDF } from "@/src/utils/exportExamPDF";
import * as XLSX from "xlsx";
import StudentProgressCard from "./StudentProgressCard";
import SearchBox from "../../SearchBox/SearchBox";
import FilterSideNav from "../../FilterSideNav/FilterSideNav";
import { useEffect, useState, useCallback, useRef } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useParams } from "next/navigation";
import QuestionPreview from "@/src/app/dashboard/students/[id]/QuestionPreview";

export default function ExamStudents({
  examAttempts,
  setExamAttempts,
  showStudentList = true,
  exam,
}) {
  const { examID } = useParams();
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
  const filteredAttempts = allStudents
    .filter((item) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        item.userMeta?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.userMeta?.email?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        filters.status === "All" || item.status === filters.status;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "Newest":
          // Handle null timestamps for NOT_ATTENDED
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

  const handleStudentClick = (attempt) => {
    setSelectedAttempt(attempt);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailDialogOpen(false);
    setSelectedAttempt(null);
  };

  const handleExport = () => {
    // Export filtered data
    const dataToExport = filteredAttempts.map((item) => ({
      Name: item.userMeta?.name,
      Email: item.userMeta?.email,
      "Exam Name": item.title,
      College: item.batchMeta?.instituteMeta?.title,
      Batch: item.batchMeta?.title,
      Status: item.status,
      "Date & Time": new Date(item.startTimeStamp).toLocaleString(),
      Marks: `${item.obtainedMarks} / ${item.totalMarks}`,
      "Percentage (%)": ((item.obtainedMarks / item.totalMarks) * 100).toFixed(
        2
      ),
    }));

    if (dataToExport.length === 0) return;

    // Create a new workbook and a worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    // Trigger the download
    XLSX.writeFile(workbook, `${dataToExport[0]["Exam Name"]}.xlsx`);
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
  const totalStudents = examAttempts.length;
  const completedStudents = examAttempts.filter(
    (item) => item.status === "COMPLETED"
  ).length;

  // New Metrics
  const scores = examAttempts
    .filter((item) => item.status === "COMPLETED")
    .map((item) => item.obtainedMarks);

  const averageScore =
    scores.length > 0
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : 0;

  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;

  // Chart Data Preparation
  const passCount = examAttempts.filter((item) => {
    if (item.status !== "COMPLETED") return false;
    const percentage = (item.obtainedMarks / item.totalMarks) * 100;
    return percentage >= 40; // Assuming 40% is pass
  }).length;
  const failCount = completedStudents - passCount;

  const passPercentage =
    completedStudents > 0
      ? ((passCount / completedStudents) * 100).toFixed(0)
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
        flex: "1 1 200px",
        padding: "20px",
        borderRadius: "12px",
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: color,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Stack gap="15px">
        <Stack
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: "600",
              color: "var(--text3)",
              fontFamily: "Lato",
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              padding: "8px",
              borderRadius: "8px",
              backgroundColor: `${color}15`, // 15 is hex opacity
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Stack>
        <Stack gap="5px">
          <Typography
            sx={{
              fontSize: "28px",
              fontWeight: "700",
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
              color: "var(--text4)",
              fontFamily: "Lato",
            }}
          >
            {subtext}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );

  const DonutChart = ({ percentage, color }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <Box sx={{ position: "relative", width: "120px", height: "120px" }}>
        <svg width="120" height="120" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#f0f0f0"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <Typography
            sx={{ fontSize: "18px", fontWeight: "700", color: color }}
          >
            {percentage}%
          </Typography>
          <Typography sx={{ fontSize: "10px", color: "var(--text4)" }}>
            Pass Rate
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Stack marginTop="20px" gap="30px" padding="10px">
      {/* Header Stats */}
      <Stack gap="20px">
        <Typography
          sx={{
            fontSize: "18px",
            fontWeight: "700",
            color: "var(--text1)",
            fontFamily: "Lato",
          }}
        >
          Dashboard Overview
        </Typography>
        <Stack flexDirection="row" gap="20px" flexWrap="wrap">
          <StatCard
            title="Total Students"
            value={totalStudents}
            subtext="Enrolled & Attempting"
            icon={
              <PeopleIcon
                sx={{ fontSize: "20px", color: "var(--primary-color)" }}
              />
            }
            color="var(--primary-color)"
          />
          <StatCard
            title="Average Score"
            value={averageScore}
            subtext="Across all attempts"
            icon={
              <TrendingUpIcon sx={{ fontSize: "20px", color: "#2196f3" }} />
            }
            color="#2196f3"
          />
          <StatCard
            title="Highest Score"
            value={highestScore}
            subtext="Top performance"
            icon={
              <CheckCircleIcon sx={{ fontSize: "20px", color: "#4caf50" }} />
            }
            color="#4caf50"
          />
        </Stack>
      </Stack>

      {/* Detailed Analytics Section */}
      <Stack
        flexDirection="row"
        gap="20px"
        flexWrap="wrap"
        alignItems="flex-start"
      >
        {/* Performance Ratio */}
        <Stack
          flex={1}
          minWidth="300px"
          sx={{
            backgroundColor: "var(--white)",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid var(--border-color)",
          }}
        >
          <Stack
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom="20px"
          >
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: "700",
                color: "var(--text2)",
              }}
            >
              Performance Ratio
            </Typography>
            <Tooltip title="Pass mark is set to 40% of total marks" arrow>
              <Box
                sx={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  backgroundColor: "#f5f5f5",
                  fontSize: "11px",
                  color: "var(--text4)",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "help",
                }}
              >
                Pass Mark: 40%
                <InfoIcon sx={{ fontSize: "14px" }} />
              </Box>
            </Tooltip>
          </Stack>

          <Stack
            flexDirection="row"
            alignItems="center"
            justifyContent="space-around"
            gap="20px"
          >
            <DonutChart percentage={passPercentage} color="#4caf50" />

            <Stack gap="12px" flex={1}>
              <Stack
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  padding: "10px",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                  border: "1px solid #eee",
                }}
              >
                <Stack flexDirection="row" alignItems="center" gap="10px">
                  <Box
                    sx={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      bgcolor: "#4caf50",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "var(--text2)",
                    }}
                  >
                    Passed
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "var(--text1)",
                  }}
                >
                  {passCount}{" "}
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--text4)",
                      fontWeight: "400",
                    }}
                  >
                    Students
                  </span>
                </Typography>
              </Stack>

              <Stack
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  padding: "10px",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                  border: "1px solid #eee",
                }}
              >
                <Stack flexDirection="row" alignItems="center" gap="10px">
                  <Box
                    sx={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      bgcolor: "#f44336",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "var(--text2)",
                    }}
                  >
                    Failed
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "var(--text1)",
                  }}
                >
                  {failCount}{" "}
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--text4)",
                      fontWeight: "400",
                    }}
                  >
                    Students
                  </span>
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        {/* Top Performers */}
        <Stack
          flex={1}
          minWidth="300px"
          sx={{
            backgroundColor: "var(--white)",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid var(--border-color)",
          }}
        >
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: "700",
              color: "var(--text2)",
              marginBottom: "20px",
            }}
          >
            Top Performers
          </Typography>
          <Stack gap="12px">
            {topPerformers.length > 0 ? (
              topPerformers.map((student, index) => (
                <Stack
                  key={index}
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    backgroundColor: index === 0 ? "#fff8e1" : "var(--white)",
                    border:
                      index === 0
                        ? "1px solid #ffecb3"
                        : "1px solid var(--border-color)",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateX(5px)",
                      borderColor: "var(--primary-color)",
                    },
                  }}
                >
                  <Stack flexDirection="row" alignItems="center" gap="15px">
                    <Box
                      sx={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        bgcolor: index === 0 ? "#ffc107" : "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: index === 0 ? "white" : "var(--text4)",
                        fontWeight: "700",
                        fontSize: "12px",
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Stack>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "var(--text2)",
                        }}
                      >
                        {student.userMeta?.name || "Unknown"}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "11px", color: "var(--text4)" }}
                      >
                        {student.userMeta?.email}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "var(--primary-color)",
                    }}
                  >
                    {student.obtainedMarks}
                  </Typography>
                </Stack>
              ))
            ) : (
              <Stack
                alignItems="center"
                justifyContent="center"
                height="150px"
                gap="10px"
              >
                <Typography sx={{ color: "var(--text4)", fontSize: "14px" }}>
                  No data available yet
                </Typography>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>

      {/* Action Buttons */}
      {showStudentList && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap="20px"
          marginTop="20px"
          padding="16px 20px"
          sx={{
            backgroundColor: "var(--white)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Stack sx={{ position: "relative", width: "280px" }}>
            <SearchBox
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
            />
            {searchQuery && (
              <Stack
                sx={{
                  position: "absolute",
                  right: "40px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "2px 8px",
                  backgroundColor: "#2196F3",
                  borderRadius: "10px",
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

          <Stack direction="row" gap="12px" alignItems="center">
            <Button
              variant="contained"
              startIcon={<Logout sx={{ transform: "rotate(-90deg)" }} />}
              onClick={handleExport}
              disabled={filteredAttempts.length === 0}
              sx={{
                background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
                color: "#FFFFFF",
                textTransform: "none",
                borderRadius: "10px",
                padding: "10px 20px",
                fontWeight: 700,
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(255, 152, 0, 0.25)",
                minWidth: "120px",
                height: "48px",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
                  boxShadow: "0 6px 16px rgba(255, 152, 0, 0.35)",
                  transform: "translateY(-1px)",
                },
                "&:disabled": {
                  background: "rgba(158, 158, 158, 0.12)",
                  color: "var(--text3)",
                  boxShadow: "none",
                },
                transition: "all 0.2s ease",
              }}
              disableElevation
            >
              Export
            </Button>

            <Stack
              onClick={filterOpen}
              sx={{
                border: `1.5px solid ${
                  Object.values(filters).some((v) => v)
                    ? "#4CAF50"
                    : "var(--border-color)"
                }`,
                borderRadius: "10px",
                backgroundColor: Object.values(filters).some((v) => v)
                  ? "rgba(76, 175, 80, 0.08)"
                  : "var(--white)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                padding: "8px 16px",
                minWidth: "120px",
                height: "48px",
                "&:hover": {
                  borderColor: "#4CAF50",
                  backgroundColor: "rgba(76, 175, 80, 0.08)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 2px 8px rgba(76, 175, 80, 0.15)",
                },
              }}
            >
              <Stack direction="row" alignItems="center" gap="10px">
                <Stack
                  sx={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: Object.values(filters).some((v) => v)
                      ? "rgba(76, 175, 80, 0.15)"
                      : "var(--bg-color)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FilterAlt
                    sx={{
                      fontSize: "18px",
                      color: Object.values(filters).some((v) => v)
                        ? "#4CAF50"
                        : "var(--text2)",
                    }}
                  />
                </Stack>
                <Typography
                  sx={{
                    fontSize: "14px",
                    color: Object.values(filters).some((v) => v)
                      ? "#4CAF50"
                      : "var(--text1)",
                    fontWeight: 700,
                  }}
                >
                  Filters
                </Typography>
              </Stack>
            </Stack>
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

      {/* Student Cards */}
      {showStudentList && (
        <Stack flexDirection="row" flexWrap="wrap" gap="20px">
          {!isLoading ? (
            filteredAttempts.length > 0 ? (
              filteredAttempts.map((item, index) => {
                return (
                  item.type === "scheduled" && (
                    <StudentProgressCard
                      key={index}
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
                    />
                  )
                );
              })
            ) : (
              <Stack
                width="100%"
                minHeight="200px"
                justifyContent="center"
                alignItems="center"
                gap="10px"
              >
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "var(--text3)",
                    fontFamily: "Lato",
                  }}
                >
                  No students found
                </Typography>
                <Typography
                  sx={{
                    fontSize: "14px",
                    color: "var(--text4)",
                    fontFamily: "Lato",
                  }}
                >
                  {searchQuery || filters.status !== "All"
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
      padding="10px"
      alignItems="center"
      gap="10px"
      width="100%"
      sx={{
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        minHeight: "80px",
      }}
    >
      <Stack flexDirection="row" alignItems="center" gap="30px">
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{ width: "50px", height: "50px", borderRadius: "10px" }}
        />
        <Stack flexDirection="column" gap="5px">
          <Skeleton variant="text" animation="wave" sx={{ width: "100px" }} />
          <Skeleton variant="text" animation="wave" sx={{ width: "160px" }} />
        </Stack>
        <Stack
          flexDirection="column"
          alignItems="center"
          gap="10px"
          marginLeft="70px"
        >
          <Skeleton
            variant="text"
            animation="wave"
            sx={{ width: "100px", marginLeft: "auto" }}
          />
          <Skeleton
            variant="text"
            animation="wave"
            sx={{ width: "100px", marginLeft: "auto" }}
          />
        </Stack>
        <Stack flexDirection="column" gap="10px" marginLeft="10px">
          <Skeleton variant="text" animation="wave" sx={{ width: "350px" }} />
          <Skeleton variant="text" animation="wave" sx={{ width: "80px" }} />
        </Stack>
      </Stack>
      <Skeleton
        variant="text"
        animation="wave"
        sx={{ width: "30px", marginLeft: "50px" }}
      />
      <Skeleton variant="text" animation="wave" sx={{ width: "80px" }} />
      <Skeleton
        variant="rectangular"
        animation="wave"
        sx={{
          width: "100px",
          height: "30px",
          borderRadius: "20px",
          marginLeft: "auto",
        }}
      />
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
                    } else {
                      const isSkippedMCQMSQ =
                        (q.type === "MCQ" || q.type === "MSQ") &&
                        ua.selectedOptions?.length === 0;
                      const isSkippedFIB =
                        q.type === "FIB" &&
                        (ua.blankAnswers?.length === 0 ||
                          ua.blankAnswers?.every((a) => a.trim() === ""));

                      if (isSkippedMCQMSQ || isSkippedFIB) {
                        totalSkipped++;
                      } else if (ua.isCorrect) {
                        totalCorrect++;
                      } else {
                        totalIncorrect++;
                      }
                    }
                  });

                  const StatItem = ({ label, value, color }) => (
                    <Stack
                      flex={1}
                      minWidth="120px"
                      alignItems="center"
                      gap="8px"
                      sx={{
                        padding: "12px",
                        borderRadius: "8px",
                        backgroundColor: `${color}08`,
                        border: `1px solid ${color}20`,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "20px",
                          fontWeight: 800,
                          color: color,
                        }}
                      >
                        {value}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "var(--text3)",
                          fontWeight: 600,
                        }}
                      >
                        {label}
                      </Typography>
                    </Stack>
                  );

                  return (
                    <>
                      <StatItem
                        label="Total Questions"
                        value={totalQuestions}
                        color="#2196F3"
                      />
                      <StatItem
                        label="Correct"
                        value={totalCorrect}
                        color="#4CAF50"
                      />
                      <StatItem
                        label="Incorrect"
                        value={totalIncorrect}
                        color="#F44336"
                      />
                      <StatItem
                        label="Skipped"
                        value={totalSkipped}
                        color="#FF9800"
                      />
                    </>
                  );
                })()}
              </Stack>
            </Stack>

            {/* Question Analysis */}
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
              <Stack gap="12px">
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
          <Stack
            height="100%"
            justifyContent="center"
            alignItems="center"
            gap="16px"
          >
            <Typography sx={{ color: "var(--text3)", fontSize: "14px" }}>
              No details found
            </Typography>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};
