"use client";
import { Schedule, CheckCircle } from "@mui/icons-material";
import {
  Stack,
  MenuItem,
  Chip,
  Menu,
  Pagination,
  Typography,
  TextField,
} from "@mui/material";
import Active from "./Components/Active";
import ScheduleTestHeader from "./Components/ScheduleTestHeader";
import { useEffect, useState, useCallback } from "react";
import CreateExamDialog from "@/src/components/CreateExamDialog/CreateExamDialog";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";

export default function ScheduleTest() {
  const { showSnackbar } = useSnackbar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [batchList, setBatchList] = useState([]);
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);
  const [title, setTitle] = useState("");
  const [testList, setTestList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 24;
  const [isCreating, setIsCreating] = useState(false);

  // Student selection state
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentList, setStudentList] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [isSearchingStudents, setIsSearchingStudents] = useState(false);

  const searchStudents = useCallback(async () => {
    setIsSearchingStudents(true);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/get-all-users?search=${studentSearchQuery}&limit=20`,
      );
      if (data.success) {
        setStudentList(data.data);
      }
    } finally {
      setIsSearchingStudents(false);
    }
  }, [studentSearchQuery]);

  // Debounced search for students
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (studentSearchQuery) {
        searchStudents();
      } else {
        setStudentList([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [studentSearchQuery, searchStudents]);

  const fetchScheduledTest = useCallback(
    async (signal) => {
      setIsLoading(true);
      try {
        const abortSignal = signal instanceof AbortSignal ? signal : null;
        const data = await apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/get-all-scheduled-exam`,
          { signal: abortSignal },
        );
        if (data.success) {
          const sortedData = data.data.sort(
            (a, b) => b.createdAt - a.createdAt,
          );
          setTestList(sortedData);
        } else if (!data.isAborted) {
          showSnackbar(data.message, "error", "", "3000");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
        }
      } finally {
        setIsLoading(false);
      }
    },
    [showSnackbar],
  );

  const getBatchList = useCallback(
    async (signal) => {
      try {
        const abortSignal = signal instanceof AbortSignal ? signal : null;
        const data = await apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/get-all-batch`,
          { signal: abortSignal },
        );
        if (data.success) {
          setBatchList(data.data);
        } else {
          // showSnackbar("No Batch Found", "error", "", "3000");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching batches:", error);
        }
      }
    },
    [showSnackbar],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchScheduledTest(controller.signal);
    getBatchList(controller.signal);

    return () => controller.abort();
  }, [fetchScheduledTest, getBatchList]);

  const batchOptions = batchList.map((batch) => ({
    label: `${batch.title} (${batch.instituteMeta.title})`,
    value: batch.id,
  }));

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setStudentSearchQuery("");
    setStudentList([]);
    setSelectedStudentIds([]);
  };

  const handleBatchChange = (event) => {
    const selectedIds = event.target.value;
    setSelectedBatchIds(selectedIds);
  };

  const handleCreateExam = async ({ title }) => {
    if (
      title === "" ||
      (selectedBatchIds.length === 0 && selectedStudentIds.length === 0)
    ) {
      showSnackbar(
        "Please select at least one batch or student",
        "error",
        "",
        "3000",
      );
      return;
    }
    setIsCreating(true);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title,
            type: "scheduled",
            batchList: selectedBatchIds,
            studentList: selectedStudentIds,
          }),
        },
      );
      if (data.success) {
        showSnackbar("Exam created successfully", "success", "", "3000");
        setTitle("");
        setSelectedBatchIds([]);
        setSelectedStudentIds([]);
        handleDialogClose();
        fetchScheduledTest();
      } else {
        showSnackbar("Something went wrong", "error", "", "3000");
      }
    } catch (error) {
      console.error("Error creating exam:", error);
      showSnackbar("Failed to create exam", "error", "", "3000");
    } finally {
      setIsCreating(false);
    }
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    handleFilterClose();
  };

  // Filter and search logic
  const filteredTestList = testList.filter((test) => {
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

  // Calculate stats from test list
  const now = Date.now();
  const calculatedStats = testList.reduce(
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
    { total: 0, live: 0, scheduled: 0, ended: 0 },
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredTestList.length / ITEMS_PER_PAGE);
  const paginatedTestList = filteredTestList.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  return (
    <Stack padding="20px" gap="20px">
      <ScheduleTestHeader
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        statusFilter={statusFilter}
        onFilterClick={handleFilterClick}
        onCreateClick={handleDialogOpen}
        filteredCount={filteredTestList.length}
        totalCount={testList.length}
        stats={calculatedStats}
        onClearFilter={() => handleStatusFilterChange("all")}
        isLoading={isLoading}
      />
      <Stack
        sx={{
          border: "1px solid var(--border-color)",
          backgroundColor: "var(--white)",
          borderRadius: "16px",
          padding: "24px",
          minHeight: "75vh",
          justifyContent: "space-between",
        }}
      >
        <Active testList={paginatedTestList} isLoading={isLoading} />

        {totalPages > 1 && (
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            gap={1.5}
            mt={4}
            pt={3}
            borderTop="1px solid var(--border-color)"
          >
            <Typography
              sx={{ fontSize: "13px", color: "var(--text3)", fontWeight: 500 }}
            >
              Page {page} of {totalPages}
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => {
                setPage(value);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": {
                  fontWeight: 600,
                  fontSize: "14px",
                  minWidth: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  color: "var(--text2)",
                  border: "1px solid var(--border-color)",
                  "&:hover": {
                    backgroundColor: "rgba(24, 113, 99, 0.08)",
                    borderColor: "var(--primary-color)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "var(--primary-color)",
                    color: "white",
                    borderColor: "var(--primary-color)",
                    "&:hover": {
                      backgroundColor: "var(--primary-color-dark)",
                    },
                  },
                },
                "& .MuiPaginationItem-previousNext": {
                  border: "1px solid var(--border-color)",
                  "&:hover": {
                    backgroundColor: "rgba(24, 113, 99, 0.08)",
                    borderColor: "var(--primary-color)",
                  },
                },
              }}
            />
          </Stack>
        )}
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
          All Exams
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
        onClose={handleDialogClose}
        title="Create Exam"
        subtitle="Schedule an exam for specific batches or students."
        icon={<Schedule />}
        infoText="Scheduled exams will be visible to students in the selected batches or individual students."
        isLoading={isCreating}
        onCreate={() => handleCreateExam({ title })}
      >
        <Stack gap="20px">
          {/* Exam Title - First */}
          <Stack gap="6px">
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text1)",
              }}
            >
              Exam Title
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g., Assessment 1 - Mathematics"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-color)",
                  fontSize: "14px",
                  "& fieldset": { borderColor: "var(--border-color)" },
                  "&:hover fieldset": { borderColor: "var(--primary-color)" },
                  "&.Mui-focused fieldset": { borderColor: "var(--primary-color)" },
                },
              }}
            />
          </Stack>

          {/* Select Batches */}
          <Stack gap="6px">
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text1)",
              }}
            >
              Select Batches
            </Typography>
            <Stack
              sx={{
                maxHeight: "180px",
                overflowY: "auto",
                border: "1px solid var(--border-color)",
                borderRadius: "10px",
                backgroundColor: "var(--bg-color)",
              }}
            >
              {batchOptions.length > 0 ? (
                batchOptions.map((option) => {
                  const isSelected = selectedBatchIds.includes(option.value);
                  return (
                    <Stack
                      key={option.value}
                      flexDirection="row"
                      alignItems="center"
                      gap="10px"
                      sx={{
                        padding: "10px 14px",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        backgroundColor: isSelected
                          ? "rgba(24, 113, 99, 0.06)"
                          : "transparent",
                        borderBottom: "1px solid var(--border-color)",
                        "&:last-child": { borderBottom: "none" },
                        "&:hover": {
                          backgroundColor: "rgba(24, 113, 99, 0.04)",
                        },
                      }}
                      onClick={() => {
                        if (isSelected) {
                          handleBatchChange({
                            target: {
                              value: selectedBatchIds.filter(
                                (id) => id !== option.value,
                              ),
                            },
                          });
                        } else {
                          handleBatchChange({
                            target: {
                              value: [...selectedBatchIds, option.value],
                            },
                          });
                        }
                      }}
                    >
                      <Stack
                        sx={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "4px",
                          border: isSelected
                            ? "2px solid var(--primary-color)"
                            : "2px solid var(--border-color)",
                          backgroundColor: isSelected
                            ? "var(--primary-color)"
                            : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s",
                          flexShrink: 0,
                        }}
                      >
                        {isSelected && (
                          <CheckCircle
                            sx={{ fontSize: "12px", color: "#fff" }}
                          />
                        )}
                      </Stack>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          color: isSelected
                            ? "var(--primary-color)"
                            : "var(--text1)",
                          fontWeight: isSelected ? 600 : 400,
                        }}
                      >
                        {option.label}
                      </Typography>
                    </Stack>
                  );
                })
              ) : (
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "var(--text3)",
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  No batches available
                </Typography>
              )}
            </Stack>
            {selectedBatchIds.length > 0 && (
              <Stack flexDirection="row" flexWrap="wrap" gap="6px" mt="4px">
                {selectedBatchIds.map((id) => {
                  const match = batchOptions.find((opt) => opt.value === id);
                  return (
                    <Chip
                      key={id}
                      label={match?.label || id}
                      size="small"
                      onDelete={() => {
                        handleBatchChange({
                          target: {
                            value: selectedBatchIds.filter(
                              (batchId) => batchId !== id,
                            ),
                          },
                        });
                      }}
                      sx={{
                        height: "26px",
                        backgroundColor: "var(--primary-color)",
                        color: "#fff",
                        fontSize: "12px",
                        "& .MuiChip-deleteIcon": {
                          color: "rgba(255,255,255,0.7)",
                          fontSize: "16px",
                          "&:hover": { color: "#fff" },
                        },
                      }}
                    />
                  );
                })}
              </Stack>
            )}
          </Stack>

          {/* Student Selection */}
          <Stack gap="6px">
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text1)",
              }}
            >
              Select Students{" "}
              <Typography
                component="span"
                sx={{ fontSize: "12px", color: "var(--text3)", fontWeight: 400 }}
              >
                (Optional)
              </Typography>
            </Typography>
            <TextField
              placeholder="Search students by name or email..."
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
              size="small"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-color)",
                  fontSize: "13px",
                  "& fieldset": { borderColor: "var(--border-color)" },
                  "&:hover fieldset": { borderColor: "var(--primary-color)" },
                  "&.Mui-focused fieldset": { borderColor: "var(--primary-color)" },
                },
              }}
            />
            {studentList.length > 0 && (
              <Stack
                sx={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  border: "1px solid var(--border-color)",
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-color)",
                }}
              >
                {studentList.map((student) => {
                  const isSelected = selectedStudentIds.includes(student.id);
                  return (
                    <Stack
                      key={student.id}
                      flexDirection="row"
                      alignItems="center"
                      gap="10px"
                      sx={{
                        padding: "10px 14px",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        backgroundColor: isSelected
                          ? "rgba(24, 113, 99, 0.06)"
                          : "transparent",
                        borderBottom: "1px solid var(--border-color)",
                        "&:last-child": { borderBottom: "none" },
                        "&:hover": {
                          backgroundColor: "rgba(24, 113, 99, 0.04)",
                        },
                      }}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedStudentIds((prev) =>
                            prev.filter((id) => id !== student.id),
                          );
                        } else {
                          setSelectedStudentIds((prev) => [
                            ...prev,
                            student.id,
                          ]);
                        }
                      }}
                    >
                      <Stack
                        sx={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "4px",
                          border: isSelected
                            ? "2px solid var(--primary-color)"
                            : "2px solid var(--border-color)",
                          backgroundColor: isSelected
                            ? "var(--primary-color)"
                            : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s",
                          flexShrink: 0,
                        }}
                      >
                        {isSelected && (
                          <CheckCircle
                            sx={{ fontSize: "12px", color: "#fff" }}
                          />
                        )}
                      </Stack>
                      <Stack>
                        <Typography
                          sx={{
                            fontSize: "13px",
                            color: isSelected
                              ? "var(--primary-color)"
                              : "var(--text1)",
                            fontWeight: isSelected ? 600 : 500,
                          }}
                        >
                          {student.name}
                        </Typography>
                        <Typography
                          sx={{ fontSize: "11px", color: "var(--text3)" }}
                        >
                          {student.email}
                        </Typography>
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
            )}
            {selectedStudentIds.length > 0 && (
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "var(--primary-color)",
                  fontWeight: 600,
                }}
              >
                {selectedStudentIds.length} student
                {selectedStudentIds.length !== 1 ? "s" : ""} selected
              </Typography>
            )}
          </Stack>
        </Stack>
      </CreateExamDialog>
    </Stack>
  );
}
