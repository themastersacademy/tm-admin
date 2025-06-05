"use client";
import Header from "@/src/components/Header/Header";
import SearchBox from "@/src/components/SearchBox/SearchBox";
import { Add, Close, East, ExpandMore } from "@mui/icons-material";
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
} from "@mui/material";
import Active from "./Components/Active";
import { useEffect, useState, useCallback } from "react";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
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

  return (
    <Stack padding="20px" gap="20px">
      <Header
        title="Schedule Test"
        button={[
          <Stack key="head" flexDirection="row" alignItems="center" gap="10px">
            <SearchBox />
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
              sx={{
                backgroundColor: "var(--primary-color)",
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
      <Stack sx={{
          border: "1px solid var(--border-color)",
          backgroundColor: "var(--white)",
          borderRadius: "10px",
          padding: "20px",
          minHeight: "80vh",
        }}>
        <Stack>
          <Active testList={testList} isLoading={isLoading} />
        </Stack>
      </Stack>
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
