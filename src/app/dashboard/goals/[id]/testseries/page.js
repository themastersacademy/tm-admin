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
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "16px",
                  marginTop: "16px",
                }}
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
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
                marginTop: "16px",
              }}
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

function TestSeriesHeader({
  searchQuery,
  onSearchChange,
  statusFilter,
  onFilterClick,
  onCreateClick,
  filteredCount,
  stats,
  onClearFilter,
  isLoading,
  onBack,
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      padding="10px 16px"
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
      }}
    >
      {/* Left: Back + Icon + Title + Chip + Stats */}
      <Stack direction="row" alignItems="center" gap="10px">
        <Stack
          onClick={onBack}
          sx={{
            width: "30px",
            height: "30px",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            backgroundColor: "var(--bg-color)",
            border: "1px solid var(--border-color)",
            flexShrink: 0,
            "&:hover": {
              backgroundColor: "rgba(24, 113, 99, 0.08)",
              borderColor: "var(--primary-color)",
              "& svg": { color: "var(--primary-color)" },
            },
          }}
        >
          <ArrowBack sx={{ fontSize: "16px", color: "var(--text2)" }} />
        </Stack>

        <Stack
          sx={{
            width: "32px",
            height: "32px",
            backgroundColor: "rgba(24, 113, 99, 0.08)",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <Quiz sx={{ fontSize: "18px", color: "var(--primary-color)" }} />
        </Stack>

        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--text1)",
          }}
        >
          Test Series
        </Typography>

        <Chip
          label={`${filteredCount} Tests`}
          size="small"
          sx={{
            backgroundColor: "rgba(24, 113, 99, 0.08)",
            color: "var(--primary-color)",
            fontWeight: 600,
            fontSize: "11px",
            height: "22px",
          }}
        />

        {!isLoading && (
          <Stack direction="row" alignItems="center" gap="6px" ml="6px">
            <StatChip label="Total" value={stats.total} color="#2196F3" />
            <StatChip label="Live" value={stats.live} color="#4CAF50" />
            <StatChip label="Scheduled" value={stats.scheduled} color="#FF9800" />
            <StatChip label="Ended" value={stats.ended} color="#F44336" />
          </Stack>
        )}

        {statusFilter !== "all" && (
          <Chip
            label={`Filtered: ${statusFilter}`}
            size="small"
            onDelete={onClearFilter}
            sx={{
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              color: "#4CAF50",
              fontWeight: 600,
              fontSize: "11px",
              height: "22px",
              "& .MuiChip-deleteIcon": {
                fontSize: "14px",
                color: "#4CAF50",
              },
            }}
          />
        )}
      </Stack>

      {/* Right: Search + Filter + Create */}
      <Stack direction="row" gap="8px" alignItems="center">
        <Stack sx={{ width: "200px" }}>
          <SearchBox value={searchQuery} onChange={onSearchChange} />
        </Stack>

        <Button
          variant="outlined"
          size="small"
          endIcon={<ExpandMore sx={{ fontSize: "16px" }} />}
          onClick={onFilterClick}
          sx={{
            textTransform: "none",
            borderColor: statusFilter !== "all" ? "#4CAF50" : "var(--border-color)",
            color: statusFilter !== "all" ? "#4CAF50" : "var(--text2)",
            backgroundColor: statusFilter !== "all" ? "rgba(76, 175, 80, 0.08)" : "transparent",
            borderRadius: "8px",
            height: "34px",
            fontSize: "12px",
            fontWeight: 600,
            padding: "0 12px",
            "&:hover": {
              borderColor: "#4CAF50",
              backgroundColor: "rgba(76, 175, 80, 0.08)",
            },
          }}
        >
          {statusFilter === "all"
            ? "Filter"
            : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
        </Button>

        <Button
          variant="contained"
          startIcon={<Add sx={{ fontSize: "16px" }} />}
          onClick={onCreateClick}
          disableElevation
          sx={{
            backgroundColor: "var(--primary-color)",
            color: "#fff",
            textTransform: "none",
            borderRadius: "8px",
            height: "34px",
            fontSize: "12px",
            fontWeight: 600,
            padding: "0 14px",
            "&:hover": {
              backgroundColor: "var(--primary-color)",
              opacity: 0.9,
            },
          }}
        >
          Create Test
        </Button>
      </Stack>
    </Stack>
  );
}

const StatChip = ({ label, value, color }) => (
  <Stack
    direction="row"
    alignItems="center"
    gap="4px"
    padding="2px 8px"
    sx={{
      backgroundColor: `${color}12`,
      borderRadius: "6px",
    }}
  >
    <Typography sx={{ fontSize: "11px", color: color, fontWeight: 700 }}>
      {value}
    </Typography>
    <Typography sx={{ fontSize: "10px", color: "var(--text3)", fontWeight: 500 }}>
      {label}
    </Typography>
  </Stack>
);
