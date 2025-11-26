"use client";
import Header from "@/src/components/Header/Header";
import SearchBox from "@/src/components/SearchBox/SearchBox";
import {
  Add,
  Close,
  East,
  ExpandMore,
  Quiz,
  CheckCircle,
  Schedule,
  Cancel,
} from "@mui/icons-material";
import {
  Stack,
  Button,
  IconButton,
  DialogContent,
  Select,
  FormControl,
  MenuItem,
  InputLabel,
  Chip,
  Menu,
  TablePagination,
} from "@mui/material";
import Active from "./Components/Active";
import { useEffect, useState, useCallback } from "react";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";

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

  const fetchScheduledTest = useCallback(() => {
    setIsLoading(true);
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/get-all-scheduled-exam`
    ).then((data) => {
      if (data.success) {
        setTestList(data.data);
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
      setIsLoading(false);
    });
  }, [showSnackbar]);

  useEffect(() => {
    fetchScheduledTest();
  }, [fetchScheduledTest]);

  const batchOptions = batchList.map((batch) => ({
    label: `${batch.title} (${batch.instituteMeta.title})`,
    value: batch.id,
  }));

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const getBatchList = () => {
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/get-all-batch`).then(
      (data) => {
        if (data.success) {
          setBatchList(data.data);
        } else {
          showSnackbar("No Batch Found", "error", "", "3000");
        }
      }
    );
  };

  useEffect(() => {
    getBatchList();
  }, []);

  const handleBatchChange = (event) => {
    const selectedIds = event.target.value;
    setSelectedBatchIds(selectedIds);
  };

  const handleCreateExam = async ({ title }) => {
    if (title === "" || selectedBatchIds.length === 0) {
      showSnackbar("Please Fill all data", "error", "", "3000");
      return;
    }
    try {
      await apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          type: "scheduled",
          batchList: selectedBatchIds,
        }),
      }).then((data) => {
        if (data.success) {
          showSnackbar("Exam created successfully", "success", "", "3000");
          setTitle("");
          setSelectedBatchIds([]);
          handleDialogClose();
          fetchScheduledTest();
        } else {
          showSnackbar("Something went wrong", "error", "", "3000");
        }
      });
    } catch (error) {
      console.error("Error creating exam:", error);
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
    { total: 0, live: 0, scheduled: 0, ended: 0 }
  );

  // Pagination logic
  const paginatedTestList = filteredTestList.slice(
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
      <Header
        title="Schedule Test"
        button={[
          <Stack key="head" flexDirection="row" alignItems="center" gap="10px">
            <SearchBox
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleDialogOpen}
              sx={{
                backgroundColor: "var(--primary-color)",
                textTransform: "none",
                width: "100px",
              }}
              disableElevation
            >
              Exam
            </Button>
            <Button
              variant="contained"
              endIcon={<ExpandMore />}
              onClick={handleFilterClick}
              sx={{
                backgroundColor:
                  statusFilter !== "all"
                    ? "var(--sec-color)"
                    : "var(--primary-color)",
                textTransform: "none",
                width: "100px",
              }}
              disableElevation
            >
              Filter
            </Button>
          </Stack>,
        ]}
      />

      {/* Analytics Cards */}
      <Stack flexDirection="row" gap="20px" flexWrap="wrap">
        <SecondaryCard
          icon={<Quiz sx={{ color: "var(--primary-color)" }} />}
          title="Total Exams"
          subTitle={calculatedStats.total}
          cardWidth="200px"
        />
        <SecondaryCard
          icon={<CheckCircle sx={{ color: "var(--primary-color)" }} />}
          title="Live Exams"
          subTitle={calculatedStats.live}
          cardWidth="200px"
        />
        <SecondaryCard
          icon={<Schedule sx={{ color: "var(--primary-color)" }} />}
          title="Scheduled"
          subTitle={calculatedStats.scheduled}
          cardWidth="200px"
        />
        <SecondaryCard
          icon={<Cancel sx={{ color: "var(--primary-color)" }} />}
          title="Ended Exams"
          subTitle={calculatedStats.ended}
          cardWidth="200px"
        />
      </Stack>

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

      <DialogBox
        isOpen={isDialogOpen}
        title="Create Exam"
        icon={
          <IconButton
            onClick={handleDialogClose}
            sx={{ borderRadius: "8px", padding: "4px" }}
          >
            <Close />
          </IconButton>
        }
        actionButton={
          <Button
            variant="text"
            endIcon={<East />}
            onClick={() => handleCreateExam({ title })}
            sx={{ color: "var(--primary-color)", textTransform: "none" }}
          >
            Create
          </Button>
        }
      >
        <DialogContent>
          <Stack gap="20px">
            <FormControl size="small">
              <InputLabel
                sx={{
                  "&.Mui-focused": {
                    color: "var(--sec-color)",
                  },
                }}
              >
                Select Batch
              </InputLabel>
              <Select
                multiple
                size="small"
                label="Select Batch"
                value={selectedBatchIds}
                onChange={(e) => handleBatchChange(e)}
                renderValue={(selectedIds) => (
                  <Stack flexDirection="row" flexWrap="wrap" gap="10px">
                    {selectedIds.map((id) => {
                      const match = batchOptions.find(
                        (opt) => opt.value === id
                      );
                      return (
                        <Chip
                          key={id}
                          label={match?.label || id}
                          sx={{
                            backgroundColor: "var(--sec-color-acc-2)",
                            color: "var(--sec-color)",
                          }}
                        />
                      );
                    })}
                  </Stack>
                )}
                sx={{
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--sec-color)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--sec-color)",
                  },
                }}
              >
                {batchOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    sx={{
                      "&.Mui-selected": {
                        backgroundColor: "var(--sec-color-acc-2)",
                        color: "var(--sec-color)",
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: "var(--sec-color-acc-2)",
                      },
                    }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <StyledTextField
              placeholder="Enter Exam title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Stack>
        </DialogContent>
      </DialogBox>
    </Stack>
  );
}
