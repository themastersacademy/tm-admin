"use client";
import { Button, Skeleton, Stack, Typography, Box } from "@mui/material";
import {
  FilterAlt,
  Logout,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import StudentProgressCard from "./StudentProgressCard";
import SearchBox from "../../SearchBox/SearchBox";
import FilterSideNav from "../../FilterSideNav/FilterSideNav";
import { useEffect, useState, useCallback, useRef } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useParams } from "next/navigation";

export default function ExamStudents({ examAttempts, setExamAttempts }) {
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
  const pendingStudents = examAttempts.filter(
    (item) => item.status !== "COMPLETED"
  ).length;

  const above80 = examAttempts.filter((item) => {
    if (item.status !== "COMPLETED") return false;
    const percentage = (item.obtainedMarks / item.totalMarks) * 100;
    return percentage > 80;
  }).length;

  const below50 = examAttempts.filter((item) => {
    if (item.status !== "COMPLETED") return false;
    const percentage = (item.obtainedMarks / item.totalMarks) * 100;
    return percentage < 50;
  }).length;

  return (
    <Stack marginTop="20px" gap="30px" padding="10px">
      {/* Analytics Cards */}
      <Stack gap="20px">
        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: "700",
            color: "var(--text2)",
            fontFamily: "Lato",
          }}
        >
          Exam Analytics
        </Typography>
        <Stack flexDirection="row" gap="16px" flexWrap="wrap">
          {/* Total Students */}
          <Stack
            sx={{
              flex: "1 1 200px",
              minWidth: "200px",
              maxWidth: "280px",
              padding: "20px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--white)",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "var(--primary-color)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              },
            }}
          >
            <Stack gap="12px">
              <Stack flexDirection="row" alignItems="center" gap="10px">
                <Box
                  sx={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "var(--primary-color-acc-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PeopleIcon
                    sx={{ fontSize: "20px", color: "var(--primary-color)" }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--text3)",
                    fontFamily: "Lato",
                  }}
                >
                  Total Students
                </Typography>
              </Stack>
              <Typography
                sx={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "var(--text1)",
                  fontFamily: "Lato",
                  lineHeight: 1,
                }}
              >
                {totalStudents}
              </Typography>
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "var(--text4)",
                  fontFamily: "Lato",
                }}
              >
                attempted the exam
              </Typography>
            </Stack>
          </Stack>

          {/* Total Completed */}
          <Stack
            sx={{
              flex: "1 1 200px",
              minWidth: "200px",
              maxWidth: "280px",
              padding: "20px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--white)",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "var(--sec-color)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              },
            }}
          >
            <Stack gap="12px">
              <Stack flexDirection="row" alignItems="center" gap="10px">
                <Box
                  sx={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "var(--sec-color-acc-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircleIcon
                    sx={{ fontSize: "20px", color: "var(--sec-color)" }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--text3)",
                    fontFamily: "Lato",
                  }}
                >
                  Total Completed
                </Typography>
              </Stack>
              <Typography
                sx={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "var(--text1)",
                  fontFamily: "Lato",
                  lineHeight: 1,
                }}
              >
                {completedStudents}
              </Typography>
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "var(--text4)",
                  fontFamily: "Lato",
                }}
              >
                submitted successfully
              </Typography>
            </Stack>
          </Stack>

          {/* Total Pending */}
          <Stack
            sx={{
              flex: "1 1 200px",
              minWidth: "200px",
              maxWidth: "280px",
              padding: "20px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--white)",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "#ff9800",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              },
            }}
          >
            <Stack gap="12px">
              <Stack flexDirection="row" alignItems="center" gap="10px">
                <Box
                  sx={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "#fff3e0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <HourglassEmptyIcon
                    sx={{ fontSize: "20px", color: "#ff9800" }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--text3)",
                    fontFamily: "Lato",
                  }}
                >
                  Total Pending
                </Typography>
              </Stack>
              <Typography
                sx={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "var(--text1)",
                  fontFamily: "Lato",
                  lineHeight: 1,
                }}
              >
                {pendingStudents}
              </Typography>
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "var(--text4)",
                  fontFamily: "Lato",
                }}
              >
                in progress / not submitted
              </Typography>
            </Stack>
          </Stack>

          {/* Above 80% */}
          <Stack
            sx={{
              flex: "1 1 200px",
              minWidth: "200px",
              maxWidth: "280px",
              padding: "20px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--white)",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "#4caf50",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              },
            }}
          >
            <Stack gap="12px">
              <Stack flexDirection="row" alignItems="center" gap="10px">
                <Box
                  sx={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "#e8f5e9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: "20px", color: "#4caf50" }} />
                </Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--text3)",
                    fontFamily: "Lato",
                  }}
                >
                  Above 80%
                </Typography>
              </Stack>
              <Typography
                sx={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "var(--text1)",
                  fontFamily: "Lato",
                  lineHeight: 1,
                }}
              >
                {above80}
              </Typography>
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "var(--text4)",
                  fontFamily: "Lato",
                }}
              >
                high performers
              </Typography>
            </Stack>
          </Stack>

          {/* Below 50% */}
          <Stack
            sx={{
              flex: "1 1 200px",
              minWidth: "200px",
              maxWidth: "280px",
              padding: "20px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--white)",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "#f44336",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              },
            }}
          >
            <Stack gap="12px">
              <Stack flexDirection="row" alignItems="center" gap="10px">
                <Box
                  sx={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "#ffebee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingDownIcon
                    sx={{ fontSize: "20px", color: "#f44336" }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--text3)",
                    fontFamily: "Lato",
                  }}
                >
                  Below 50%
                </Typography>
              </Stack>
              <Typography
                sx={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "var(--text1)",
                  fontFamily: "Lato",
                  lineHeight: 1,
                }}
              >
                {below50}
              </Typography>
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "var(--text4)",
                  fontFamily: "Lato",
                }}
              >
                needs improvement
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
      {/* Action Buttons */}
      <Stack
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap="20px"
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

      <FilterSideNav
        isOpen={isOpen}
        toggleDrawer={toggleDrawer}
        filtersConfig={filtersConfig}
        setFilters={setFilters}
        filters={filters}
      />

      {/* Student Cards */}
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
