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
  Close,
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
import React from "react";

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

// Modern Header Component for Exam Groups
function ExamGroupsHeader({
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
            <Groups sx={{ fontSize: "26px", color: "var(--primary-color)" }} />
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
                Exam Groups
              </Typography>
              <Chip
                label={`${filteredCount} ${
                  filteredCount === 1 ? "Group" : "Groups"
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
              Organize and manage grouped exams for structured assessments
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
            Create Group
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
              Exam Groups Overview
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
            icon={<Groups />}
            label="Total Groups"
            value={stats.total}
            color="#2196F3"
            bgColor="rgba(33, 150, 243, 0.08)"
            isLoading={isLoading}
          />
          <ModernStatCard
            icon={<CheckCircle />}
            label="Live Groups"
            value={stats.live}
            color="#4CAF50"
            bgColor="rgba(76, 175, 80, 0.08)"
            isLoading={isLoading}
          />
          <ModernStatCard
            icon={<Close />}
            label="Inactive"
            value={stats.inactive}
            color="#9E9E9E"
            bgColor="rgba(158, 158, 158, 0.08)"
            isLoading={isLoading}
          />
          <ModernStatCard
            icon={<Quiz />}
            label="Total Exams"
            value={stats.exams}
            color="#FF9800"
            bgColor="rgba(255, 152, 0, 0.08)"
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
