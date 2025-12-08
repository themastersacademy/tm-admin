"use client";
import {
  Stack,
  TextField,
  Menu,
  MenuItem,
  TablePagination,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import {
  Add,
  Quiz,
  Schedule,
  CheckCircle,
  Cancel,
  Close,
  ExpandMore,
  ArrowBack,
} from "@mui/icons-material";
import ScheduledExamCard from "@/src/components/ScheduledExamCard/ScheduledExamCard";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import CreateExamDialog from "@/src/components/CreateExamDialog/CreateExamDialog";
import SearchBox from "@/src/components/SearchBox/SearchBox";
import React from "react";

export default function TestSeries() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const { showSnackbar } = useSnackbar();

  const [isDialogOpen, setIsDialogOPen] = useState(false);
  const [title, setTitle] = useState("");
  const [mockList, setMockList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Search, filter, and pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const dialogOpen = () => {
    setIsDialogOPen(true);
  };
  const dialogClose = () => {
    setIsDialogOPen(false);
  };

  const fetchTestSeries = useCallback(() => {
    setIsLoading(true);
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalID: id, type: "mock" }),
    }).then((data) => {
      if (data.success) {
        setMockList(data.data);
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
      setIsLoading(false);
    });
  }, [id, showSnackbar]);

  const createTestSeries = () => {
    if (!title) {
      return showSnackbar("Fill all data", "error", "", "3000");
    }
    setIsCreating(true);
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title,
        goalID: id,
        type: "mock",
      }),
    }).then((data) => {
      if (data.success) {
        showSnackbar(data.message, "success", "", "3000");
        dialogClose();
        setTitle("");
        fetchTestSeries();
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
      setIsCreating(false);
    });
  };

  useEffect(() => {
    fetchTestSeries();
  }, [fetchTestSeries]);

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(0);
    handleFilterClose();
  };

  // Filter and search logic
  const filteredMockList = mockList.filter((test) => {
    const matchesSearch = test.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const now = Date.now();
    const isUpcoming = test.startTimeStamp && test.startTimeStamp > now;
    const isEnded =
      !test.isLifeTime && test.endTimeStamp && test.endTimeStamp < now;
    const isOngoing = test.isLive && !isEnded;

    let matchesStatus = true;
    if (statusFilter === "live") matchesStatus = isOngoing;
    else if (statusFilter === "scheduled") matchesStatus = isUpcoming;
    else if (statusFilter === "ended") matchesStatus = isEnded;
    else if (statusFilter === "draft")
      matchesStatus = !isOngoing && !isUpcoming && !isEnded;

    return matchesSearch && matchesStatus;
  });

  const filterOpen = Boolean(filterAnchorEl);

  // Calculate stats
  const now = Date.now();
  const calculatedStats = mockList.reduce(
    (acc, test) => {
      acc.total++;
      const isUpcoming = test.startTimeStamp && test.startTimeStamp > now;
      const isEnded =
        !test.isLifeTime && test.endTimeStamp && test.endTimeStamp < now;
      const isOngoing = test.isLive && !isEnded;

      if (isOngoing) acc.live++;
      else if (isUpcoming) acc.scheduled++;
      else if (isEnded) acc.ended++;

      return acc;
    },
    { total: 0, live: 0, scheduled: 0, ended: 0 }
  );

  // Pagination logic
  const paginatedMockList = filteredMockList.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  return (
    <Stack padding="20px" gap="20px">
      {/* Modern Header */}
      <TestSeriesHeader
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        statusFilter={statusFilter}
        onFilterClick={handleFilterClick}
        onCreateClick={dialogOpen}
        filteredCount={filteredMockList.length}
        totalCount={mockList.length}
        stats={calculatedStats}
        onClearFilter={() => handleStatusFilterChange("all")}
        isLoading={isLoading}
        onBack={() => router.back()}
      />

      <Stack
        sx={{
          border: "1px solid var(--border-color)",
          backgroundColor: "var(--white)",
          borderRadius: "10px",
          padding: "20px",
          minHeight: "80vh",
        }}
      >
        <Stack>
          {!isLoading ? (
            paginatedMockList.length > 0 ? (
              <Stack
                flexDirection="row"
                flexWrap="wrap"
                gap="30px"
                rowGap="15px"
                marginTop="20px"
              >
                {paginatedMockList.map((item, index) => (
                  <ScheduledExamCard
                    key={index}
                    exam={item}
                    viewPath={`/dashboard/goals/${id}/testseries/${item.id}`}
                    editPath={`/dashboard/goals/${id}/testseries/${item.id}`}
                  />
                ))}
              </Stack>
            ) : (
              <Stack minHeight="60vh" width="100%">
                <NoDataFound info="No Test series found" />
              </Stack>
            )
          ) : (
            <Stack
              flexDirection="row"
              flexWrap="wrap"
              gap="30px"
              rowGap="15px"
              marginTop="20px"
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <SecondaryCardSkeleton key={index} />
              ))}
            </Stack>
          )}

          {/* Pagination */}
          {!isLoading && filteredMockList.length > 0 && (
            <Stack alignItems="flex-start" mt="20px">
              <TablePagination
                component="div"
                count={filteredMockList.length}
                page={currentPage}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[12, 24, 50, 100]}
                sx={{
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                    {
                      margin: 0,
                    },
                }}
              />
            </Stack>
          )}
        </Stack>
      </Stack>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={filterOpen}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => handleStatusFilterChange("all")}
          selected={statusFilter === "all"}
          sx={{
            "&.Mui-selected": {
              backgroundColor: "var(--primary-color-acc-2)",
              color: "var(--primary-color)",
            },
          }}
        >
          All Test Series
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusFilterChange("live")}
          selected={statusFilter === "live"}
          sx={{
            "&.Mui-selected": { backgroundColor: "#e8f5e9", color: "#2e7d32" },
          }}
        >
          Live
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusFilterChange("scheduled")}
          selected={statusFilter === "scheduled"}
          sx={{
            "&.Mui-selected": { backgroundColor: "#e3f2fd", color: "#1565c0" },
          }}
        >
          Scheduled
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusFilterChange("ended")}
          selected={statusFilter === "ended"}
          sx={{
            "&.Mui-selected": { backgroundColor: "#ffebee", color: "#c62828" },
          }}
        >
          Ended
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusFilterChange("draft")}
          selected={statusFilter === "draft"}
          sx={{
            "&.Mui-selected": { backgroundColor: "#f5f5f5", color: "#757575" },
          }}
        >
          Draft
        </MenuItem>
      </Menu>

      <CreateExamDialog
        isOpen={isDialogOpen}
        onClose={dialogClose}
        onCreate={createTestSeries}
        isLoading={isCreating}
        title="Create Test Series"
        subtitle="Create a new test series to assess student performance."
        icon={<Quiz />}
        infoText="Test Series are great for regular practice and mock exams."
      >
        <TextField
          fullWidth
          placeholder="Enter Test Series Title"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "#fff",
              "& fieldset": {
                borderColor: "var(--border-color)",
              },
              "&:hover fieldset": {
                borderColor: "var(--primary-color)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "var(--primary-color)",
                borderWidth: "2px",
              },
            },
            "& .MuiInputLabel-root": {
              color: "var(--text3)",
              "&.Mui-focused": {
                color: "var(--primary-color)",
              },
            },
          }}
        />
      </CreateExamDialog>
    </Stack>
  );
}

// Modern Header Component for Test Series
function TestSeriesHeader({
  searchQuery,
  onSearchChange,
  statusFilter,
  onFilterClick,
  onCreateClick,
  filteredCount,
  totalCount,
  stats,
  onClearFilter,
  isLoading,
  onBack,
}) {
  return (
    <Stack
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Top Bar */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        padding="20px 24px"
        sx={{
          borderBottom: "1px solid var(--border-color)",
          background: "linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)",
        }}
      >
        {/* Left: Title & Badge */}
        <Stack direction="row" alignItems="center" gap="16px">
          {/* Back Button */}
          <Stack
            onClick={onBack}
            sx={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              backgroundColor: "var(--bg-color)",
              border: "1px solid var(--border-color)",
              "&:hover": {
                backgroundColor: "var(--primary-color)",
                borderColor: "var(--primary-color)",
                transform: "translateX(-2px)",
                "& svg": {
                  color: "#fff",
                },
              },
            }}
          >
            <ArrowBack sx={{ fontSize: "20px", color: "var(--text2)" }} />
          </Stack>

          <Stack
            sx={{
              width: "52px",
              height: "52px",
              background:
                "linear-gradient(135deg, rgba(var(--primary-rgb), 0.12) 0%, rgba(var(--primary-rgb), 0.06) 100%)",
              borderRadius: "14px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "1.5px solid rgba(var(--primary-rgb), 0.25)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Quiz sx={{ fontSize: "26px", color: "var(--primary-color)" }} />
          </Stack>

          <Stack gap="6px">
            <Stack direction="row" alignItems="center" gap="12px">
              <Typography
                sx={{
                  fontFamily: "Lato",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--text1)",
                }}
              >
                Test Series
              </Typography>
              <Chip
                label={`${filteredCount} ${
                  filteredCount === 1 ? "Test" : "Tests"
                }`}
                size="small"
                sx={{
                  backgroundColor: "rgba(33, 150, 243, 0.1)",
                  color: "#1976D2",
                  fontWeight: 700,
                  fontSize: "11px",
                  height: "24px",
                  border: "1px solid rgba(33, 150, 243, 0.2)",
                }}
              />
            </Stack>
            <Typography
              sx={{ fontSize: "13px", color: "var(--text3)", lineHeight: 1.4 }}
            >
              Practice exams and mock tests for comprehensive preparation
            </Typography>
          </Stack>
        </Stack>

        {/* Right: Actions */}
        <Stack direction="row" gap="12px" alignItems="center">
          <Stack sx={{ position: "relative", width: "240px" }}>
            <SearchBox value={searchQuery} onChange={onSearchChange} />
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
                  {filteredCount}
                </Typography>
              </Stack>
            )}
          </Stack>

          <Stack
            onClick={onFilterClick}
            sx={{
              border: `1.5px solid ${
                statusFilter !== "all" ? "#4CAF50" : "var(--border-color)"
              }`,
              borderRadius: "10px",
              backgroundColor:
                statusFilter !== "all"
                  ? "rgba(76, 175, 80, 0.08)"
                  : "var(--white)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              padding: "8px 12px",
              minWidth: "130px",
              height: "48px",
              "&:hover": {
                borderColor: "#4CAF50",
                backgroundColor: "rgba(76, 175, 80, 0.08)",
                transform: "translateY(-1px)",
                boxShadow: "0 2px 8px rgba(76, 175, 80, 0.15)",
              },
            }}
          >
            <Stack direction="row" alignItems="center" gap="8px">
              <Stack
                sx={{
                  width: "32px",
                  height: "32px",
                  backgroundColor:
                    statusFilter !== "all"
                      ? "rgba(76, 175, 80, 0.15)"
                      : "var(--bg-color)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ExpandMore
                  sx={{
                    fontSize: "18px",
                    color: statusFilter !== "all" ? "#4CAF50" : "var(--text2)",
                  }}
                />
              </Stack>
              <Stack flex={1}>
                <Typography
                  sx={{
                    fontSize: "10px",
                    color: "var(--text3)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Filter
                </Typography>
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: statusFilter !== "all" ? "#4CAF50" : "var(--text1)",
                    fontWeight: 700,
                  }}
                >
                  {statusFilter === "all"
                    ? "All"
                    : statusFilter.charAt(0).toUpperCase() +
                      statusFilter.slice(1)}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onCreateClick}
            sx={{
              background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
              color: "#FFFFFF",
              textTransform: "none",
              borderRadius: "10px",
              padding: "10px 24px",
              fontWeight: 700,
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(255, 152, 0, 0.25)",
              minWidth: "160px",
              height: "48px",
              "&:hover": {
                background: "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
                boxShadow: "0 6px 16px rgba(255, 152, 0, 0.35)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
            disableElevation
          >
            Create Test
          </Button>
        </Stack>
      </Stack>

      {/* Stats Section */}
      <Stack padding="24px" gap="20px">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" gap="10px">
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--text1)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Test Series Overview
            </Typography>
            <Stack
              sx={{
                width: "32px",
                height: "2px",
                background:
                  "linear-gradient(90deg, var(--primary-color) 0%, transparent 100%)",
              }}
            />
          </Stack>
          {statusFilter !== "all" && (
            <Stack
              direction="row"
              alignItems="center"
              gap="6px"
              padding="6px 12px"
              sx={{
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                borderRadius: "20px",
                border: "1px solid rgba(76, 175, 80, 0.3)",
              }}
            >
              <Typography
                sx={{ fontSize: "11px", color: "#4CAF50", fontWeight: 600 }}
              >
                Filtered: {filteredCount} of {totalCount}
              </Typography>
              <Close
                sx={{
                  fontSize: "14px",
                  color: "#4CAF50",
                  cursor: "pointer",
                }}
                onClick={onClearFilter}
              />
            </Stack>
          )}
        </Stack>

        {/* Stats Cards */}
        <Stack direction="row" gap="16px" flexWrap="wrap">
          <ModernStatCard
            icon={<Quiz />}
            label="Total Tests"
            value={stats.total}
            color="#2196F3"
            bgColor="rgba(33, 150, 243, 0.08)"
            isLoading={isLoading}
          />
          <ModernStatCard
            icon={<CheckCircle />}
            label="Live Tests"
            value={stats.live}
            color="#4CAF50"
            bgColor="rgba(76, 175, 80, 0.08)"
            isLoading={isLoading}
          />
          <ModernStatCard
            icon={<Schedule />}
            label="Scheduled"
            value={stats.scheduled}
            color="#FF9800"
            bgColor="rgba(255, 152, 0, 0.08)"
            isLoading={isLoading}
          />
          <ModernStatCard
            icon={<Cancel />}
            label="Ended"
            value={stats.ended}
            color="#F44336"
            bgColor="rgba(244, 67, 54, 0.08)"
            isLoading={isLoading}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}

const ModernStatCard = ({ icon, label, value, color, bgColor, isLoading }) => (
  <Stack
    direction="row"
    alignItems="center"
    gap="12px"
    padding="16px 20px"
    sx={{
      backgroundColor: bgColor || "var(--bg-color)",
      borderRadius: "12px",
      border: "1px solid var(--border-color)",
      minWidth: "200px",
      flex: 1,
    }}
  >
    <Stack
      sx={{
        width: "44px",
        height: "44px",
        backgroundColor: "var(--white)",
        borderRadius: "10px",
        justifyContent: "center",
        alignItems: "center",
        border: `1.5px solid ${color}30`,
        flexShrink: 0,
      }}
    >
      {icon &&
        React.cloneElement(icon, {
          sx: { fontSize: "22px", color: color },
        })}
    </Stack>
    <Stack gap="4px" flex={1}>
      <Typography
        sx={{
          fontSize: "12px",
          color: "var(--text3)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </Typography>
      {isLoading ? (
        <Typography sx={{ fontSize: "24px", color: "var(--text3)" }}>
          -
        </Typography>
      ) : (
        <Typography
          sx={{
            fontSize: "26px",
            fontWeight: 800,
            color: color,
            fontFamily: "Lato",
            lineHeight: 1,
          }}
        >
          {value}
        </Typography>
      )}
    </Stack>
  </Stack>
);
