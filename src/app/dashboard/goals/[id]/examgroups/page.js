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
  Groups,
  CheckCircle,
  Quiz,
  ExpandMore,
  ArrowBack,
} from "@mui/icons-material";
import ExamGroupCard from "@/src/components/ExamGroupCard/ExamGroupCard";
import { useParams, useRouter } from "next/navigation";
import CreateExamDialog from "@/src/components/CreateExamDialog/CreateExamDialog";
import { useEffect, useState, useCallback } from "react";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { apiFetch } from "@/src/lib/apiFetch";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import SearchBox from "@/src/components/SearchBox/SearchBox";

export default function Examgroups() {
  const params = useParams();
  const goalID = params.id;
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [title, setTitle] = useState("");
  const [isDialogOpen, setIsDialogOPen] = useState(false);
  const [groupList, setGroupList] = useState([]);
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

  const fetchExamGroups = useCallback(() => {
    setIsLoading(true);
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/group/get-exam-by-goal`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalID: goalID,
        }),
      }
    ).then((data) => {
      if (data.success) {
        setGroupList(data.data);
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
      setIsLoading(false);
    });
  }, [goalID, showSnackbar]);

  const createExamGroup = () => {
    if (!title) {
      return showSnackbar("Fill all data", "error", "", "3000");
    }
    setIsCreating(true);
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/group/create-group`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalID: goalID,
          title: title,
        }),
      }
    ).then((data) => {
      if (data.success) {
        showSnackbar(data.message, "success", "", "3000");
        dialogClose();
        setTitle("");
        fetchExamGroups();
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
      setIsCreating(false);
    });
  };

  useEffect(() => {
    fetchExamGroups();
  }, [fetchExamGroups]);

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
  const filteredGroupList = groupList.filter((group) => {
    const matchesSearch = group.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === "live") matchesStatus = group.isLive;
    else if (statusFilter === "inactive") matchesStatus = !group.isLive;

    return matchesSearch && matchesStatus;
  });

  const filterOpen = Boolean(filterAnchorEl);

  // Calculate statistics
  const totalGroups = groupList.length;
  const liveGroups = groupList.filter((group) => group.isLive).length;
  const inactiveGroups = totalGroups - liveGroups;
  const totalExams = groupList.reduce(
    (acc, group) =>
      acc +
      (group?.examCount ||
        group?.examList?.length ||
        group?.exams?.length ||
        group?.totalExams ||
        0),
    0
  );

  const stats = {
    total: totalGroups,
    live: liveGroups,
    inactive: inactiveGroups,
    exams: totalExams,
  };

  // Pagination logic
  const paginatedGroupList = filteredGroupList.slice(
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
      <ExamGroupsHeader
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        statusFilter={statusFilter}
        onFilterClick={handleFilterClick}
        onCreateClick={dialogOpen}
        filteredCount={filteredGroupList.length}
        totalCount={groupList.length}
        stats={stats}
        onClearFilter={() => handleStatusFilterChange("all")}
        isLoading={isLoading}
        onBack={() => router.back()}
      />

      <Stack
        sx={{
          backgroundColor: "var(--white)",
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          padding: "20px",
          minHeight: "80vh",
        }}
      >
        <Stack>
          {!isLoading ? (
            paginatedGroupList.length > 0 ? (
              <Stack
                flexDirection="row"
                flexWrap="wrap"
                gap="30px"
                rowGap="15px"
                marginTop="20px"
              >
                {paginatedGroupList.map((item, index) => (
                  <ExamGroupCard
                    key={index}
                    group={item}
                    onClick={() => {
                      router.push(
                        `/dashboard/goals/${goalID}/examgroups/${item.id}`
                      );
                    }}
                  />
                ))}
              </Stack>
            ) : (
              <Stack minHeight="60vh" width="100%">
                <NoDataFound info="No Exam Groups found" />
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
                <SecondaryCardSkeleton key={index} questionCard />
              ))}
            </Stack>
          )}

          {/* Pagination */}
          {!isLoading && filteredGroupList.length > 0 && (
            <Stack alignItems="flex-start" mt="20px">
              <TablePagination
                component="div"
                count={filteredGroupList.length}
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
          All Groups
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
          onClick={() => handleStatusFilterChange("inactive")}
          selected={statusFilter === "inactive"}
          sx={{
            "&.Mui-selected": { backgroundColor: "#f5f5f5", color: "#757575" },
          }}
        >
          Inactive
        </MenuItem>
      </Menu>

      <CreateExamDialog
        isOpen={isDialogOpen}
        onClose={dialogClose}
        onCreate={createExamGroup}
        isLoading={isCreating}
        title="Create Exam Group"
        subtitle="Group multiple exams together for structured learning."
        icon={<Groups />}
        infoText="Exam Groups allow you to bundle exams for a comprehensive assessment."
      >
        <TextField
          fullWidth
          placeholder="Enter Exam Group Title"
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

function ExamGroupsHeader({
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
          <Groups sx={{ fontSize: "18px", color: "var(--primary-color)" }} />
        </Stack>

        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--text1)",
          }}
        >
          Exam Groups
        </Typography>

        <Chip
          label={`${filteredCount} Groups`}
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
            <StatChip label="Inactive" value={stats.inactive} color="#9E9E9E" />
            <StatChip label="Exams" value={stats.exams} color="#FF9800" />
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
          Create Group
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
