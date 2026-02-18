"use client";
import SearchBox from "@/src/components/SearchBox/SearchBox";
import { Schedule, CheckCircle } from "@mui/icons-material";
import {
  Stack,
  MenuItem,
  Chip,
  Menu,
  TablePagination,
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
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
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
          // console.error("Error fetching batches:", error);
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
      // console.error("Error creating exam:", error);
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

  // Pagination logic
  const paginatedTestList = filteredTestList.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage,
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
          borderRadius: "10px",
          padding: "20px",
          minHeight: "80vh",
        }}
      >
        <Stack>
          <Active testList={paginatedTestList} isLoading={isLoading} />

          {/* Pagination */}
          {!isLoading && filteredTestList.length > 0 && (
            <Stack alignItems="flex-start" mt="20px">
              <TablePagination
                component="div"
                count={filteredTestList.length}
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
          <Stack gap="8px">
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text1)",
                fontFamily: "Lato",
              }}
            >
              Select Batches
            </Typography>
            <Stack
              sx={{
                maxHeight: "150px",
                overflowY: "auto",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                padding: "8px",
                backgroundColor: "#fafafa",
              }}
            >
              {batchOptions.length > 0 ? (
                batchOptions.map((option) => (
                  <Stack
                    key={option.value}
                    flexDirection="row"
                    alignItems="center"
                    gap="12px"
                    sx={{
                      padding: "10px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: "#e3f2fd",
                      },
                    }}
                    onClick={() => {
                      const isSelected = selectedBatchIds.includes(
                        option.value,
                      );
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
                        width: "20px",
                        height: "20px",
                        borderRadius: "4px",
                        border: selectedBatchIds.includes(option.value)
                          ? "2px solid var(--primary-color)"
                          : "2px solid #ccc",
                        backgroundColor: selectedBatchIds.includes(option.value)
                          ? "var(--primary-color)"
                          : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                      }}
                    >
                      {selectedBatchIds.includes(option.value) && (
                        <CheckCircle sx={{ fontSize: "14px", color: "#fff" }} />
                      )}
                    </Stack>
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontFamily: "Lato",
                        color: "var(--text1)",
                      }}
                    >
                      {option.label}
                    </Typography>
                  </Stack>
                ))
              ) : (
                <Typography
                  sx={{
                    fontSize: "14px",
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
              <Stack
                flexDirection="row"
                flexWrap="wrap"
                gap="8px"
                marginTop="8px"
              >
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
                        backgroundColor: "var(--primary-color)",
                        color: "#fff",
                        "& .MuiChip-deleteIcon": {
                          color: "#fff",
                          "&:hover": {
                            color: "#fff",
                            opacity: 0.7,
                          },
                        },
                      }}
                    />
                  );
                })}
              </Stack>
            )}
          </Stack>

          {/* Student Selection */}
          <Stack gap="8px">
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text1)",
                fontFamily: "Lato",
              }}
            >
              Select Students (Optional)
            </Typography>
            <TextField
              placeholder="Search students by name or email..."
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
              size="small"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                },
              }}
            />
            {studentList.length > 0 && (
              <Stack
                sx={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "8px",
                  backgroundColor: "#fafafa",
                }}
              >
                {studentList.map((student) => (
                  <Stack
                    key={student.id}
                    flexDirection="row"
                    alignItems="center"
                    gap="12px"
                    sx={{
                      padding: "10px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: "#e3f2fd",
                      },
                    }}
                    onClick={() => {
                      const isSelected = selectedStudentIds.includes(
                        student.id,
                      );
                      if (isSelected) {
                        setSelectedStudentIds((prev) =>
                          prev.filter((id) => id !== student.id),
                        );
                      } else {
                        setSelectedStudentIds((prev) => [...prev, student.id]);
                      }
                    }}
                  >
                    <Stack
                      sx={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "4px",
                        border: selectedStudentIds.includes(student.id)
                          ? "2px solid var(--primary-color)"
                          : "2px solid #ccc",
                        backgroundColor: selectedStudentIds.includes(student.id)
                          ? "var(--primary-color)"
                          : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                      }}
                    >
                      {selectedStudentIds.includes(student.id) && (
                        <CheckCircle sx={{ fontSize: "14px", color: "#fff" }} />
                      )}
                    </Stack>
                    <Stack>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          fontFamily: "Lato",
                          color: "var(--text1)",
                          fontWeight: 500,
                        }}
                      >
                        {student.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          fontFamily: "Lato",
                          color: "var(--text3)",
                        }}
                      >
                        {student.email}
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            )}

            {selectedStudentIds.length > 0 && (
              <Stack
                flexDirection="row"
                flexWrap="wrap"
                gap="8px"
                marginTop="8px"
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  width="100%"
                >
                  Selected Students: {selectedStudentIds.length}
                </Typography>
                {/* We don't have full student details for all selected IDs if they are not in current search results, 
                    so we might only show count or need a way to fetch details. 
                    For now, showing count is safer or just showing chips for those in list. 
                    Let's just show count to keep it simple or chips if we can. 
                */}
              </Stack>
            )}
          </Stack>

          <TextField
            fullWidth
            placeholder="Enter Exam title"
            label="Exam Title"
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
        </Stack>
      </CreateExamDialog>
    </Stack>
  );
}
