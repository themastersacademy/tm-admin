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
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import StudentProgressCard from "./StudentProgressCard";
import SearchBox from "../../SearchBox/SearchBox";
import FilterSideNav from "../../FilterSideNav/FilterSideNav";
import { useEffect, useState, useCallback, useRef } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useParams } from "next/navigation";

export default function ExamStudents({
  examAttempts,
  setExamAttempts,
  showStudentList = true,
}) {
  const { examID } = useParams();
  const [isLoading, setIsLoading] = useState(
    examAttempts.length === 0 ? true : false
  );
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "All",
    sortBy: "Newest",
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Use ref to track if data has been fetched
  const hasFetchedAttempts = useRef(false);

  const filtersConfig = [
    {
      name: "status",
      label: "Status",
      options: [
        { label: "All", value: "All" },
        { label: "Completed", value: "COMPLETED" },
        { label: "In Progress", value: "IN_PROGRESS" },
      ],
    },
    {
      name: "sortBy",
      label: "Sort By",
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

  // Apply search and filter
  const filteredAttempts = examAttempts
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
          return new Date(b.startTimeStamp) - new Date(a.startTimeStamp);
        case "Oldest":
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
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          gap="20px"
          marginTop="20px"
        >
          <SearchBox
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
          />
          <Stack flexDirection="row" gap="16px">
            <Button
              variant="contained"
              endIcon={<Logout sx={{ transform: "rotate(-90deg)" }} />}
              sx={{
                textTransform: "none",
                fontFamily: "Lato",
                fontSize: "14px",
                backgroundColor: "var(--sec-color)",
                "&:hover": {
                  backgroundColor: "var(--sec-color)",
                },
              }}
              disableElevation
              onClick={handleExport}
              disabled={filteredAttempts.length === 0}
            >
              Export
            </Button>
            <Button
              variant="contained"
              endIcon={<FilterAlt />}
              onClick={filterOpen}
              sx={{
                backgroundColor: "var(--primary-color)",
                textTransform: "none",
                borderRadius: "4px",
                "&:hover": {
                  backgroundColor: "var(--primary-color)",
                },
              }}
              disableElevation
            >
              Filters
            </Button>
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
                      time={new Date(item.startTimeStamp).toLocaleDateString()}
                      college={item.batchMeta?.instituteMeta?.title}
                      year={item.batchMeta?.title}
                      examName={item?.title}
                      marks={`${item?.obtainedMarks}/${item?.totalMarks}`}
                      percent={`${(
                        (item.obtainedMarks / item.totalMarks) *
                        100
                      ).toFixed(0)}%`}
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
