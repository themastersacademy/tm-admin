"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Button,
  DialogContent,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { Close, East, FileCopy, Settings } from "@mui/icons-material";
import Header from "@/src/components/Header/Header";
import BatchHeader from "./Components/BatchHeader";
import { apiFetch } from "@/src/lib/apiFetch";
import CustomTabs from "@/src/components/CustomTabs/CustomTabs";
import BatchCourse from "./Components/Courses";
import BatchStudents from "./Components/Students";
import BatchHistory from "./Components/History";
import ScheduledExams from "./Components/ScheduledExams";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import StyledSwitch from "@/src/components/StyledSwitch/StyledSwitch";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { enqueueSnackbar } from "notistack";

export default function BatchPage() {
  const [batch, setBatch] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const params = useParams();
  const { showSnackbar } = useSnackbar();
  const tabs = [
    {
      label: "Students",
      content: (
        <BatchStudents setStudentCount={setStudentCount} batch={batch} />
      ),
    },
    // {
    //   label: "Courses",
    //   content: <BatchCourse setCourseCount={setCourseCount} />,
    // },
    {
      label: "Scheduled Exams",
      content: <ScheduledExams />,
    },
    // {
    //   label: "History",
    //   content: <BatchHistory />,
    // },
  ];

  const fetchBatch = useCallback(() => {
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/${params.instituteID}/${params.batchID}`
    ).then((data) => {
      if (data.success) {
        setBatch(data.data);
        // Fetch student count
        apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/${params.instituteID}/${params.batchID}/get-all-students`
        ).then((studentsData) => {
          if (studentsData.success) {
            setStudentCount(studentsData.data.length);
          }
        });
        // Fetch course count
        apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/${params.instituteID}/${params.batchID}/get-all-courses`
        ).then((coursesData) => {
          if (coursesData.success) {
            setCourseCount(coursesData.data.length);
          }
        });
      }
    });
  }, [params.instituteID, params.batchID]);

  useEffect(() => {
    fetchBatch();
  }, [fetchBatch]);

  const handleCopy = () => {
    if (batch?.batchCode) {
      navigator.clipboard
        .writeText(batch.batchCode)
        .then(() => {
          showSnackbar("Code Copied", "success", "", "3000");
        })
        .catch((err) => {
          console.error("Failed to copy:", err);
        });
    }
  };

  return (
    <Stack padding="20px" gap="20px">
      <BatchHeader
        batchTitle={batch.title}
        instituteName={batch.instituteMeta?.title}
        batchCode={batch.batchCode}
        onCopyCode={handleCopy}
        onSettings={() => setOpenDialog(true)}
        isLoading={!batch.title}
        studentCount={studentCount}
        courseCount={courseCount}
      />

      <CustomTabs tabs={tabs} />
      <DialogBox
        isOpen={openDialog}
        title="Batch Settings"
        icon={
          <IconButton sx={{ borderRadius: "8px", padding: "4px" }}>
            <Close onClick={() => setOpenDialog(false)} />
          </IconButton>
        }
      >
        <DialogContent sx={{ minHeight: "unset", paddingBottom: "20px" }}>
          <BatchSettings
            batch={batch}
            handleCopy={handleCopy}
            fetchBatch={fetchBatch}
          />
        </DialogContent>
      </DialogBox>
    </Stack>
  );
}

function BatchSettings({ batch, handleCopy, fetchBatch }) {
  const [shouldLock, setShouldLock] = useState(batch.status === "LOCKED");
  const [capacity, setCapacity] = useState(batch.capacity);
  const params = useParams();

  useEffect(() => {
    setShouldLock(batch.status === "LOCKED");
    setCapacity(batch.capacity);
  }, [batch]);

  return (
    <Stack gap="25px" padding="10px 0">
      {/* Batch Status */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          padding: "15px",
          border: "1px solid var(--border-color)",
          borderRadius: "8px",
          backgroundColor: "var(--bg-color)",
        }}
      >
        <Stack>
          <Typography fontSize="16px" fontWeight="600" color="var(--text1)">
            Lock Batch
          </Typography>
          <Typography fontSize="12px" color="var(--text3)">
            Prevent new students from enrolling
          </Typography>
        </Stack>
        <StyledSwitch
          checked={shouldLock}
          onChange={(e) => {
            setShouldLock(e.target.checked);
            apiFetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/${params.instituteID}/${params.batchID}/set-batch-status`,
              {
                method: "POST",
                body: JSON.stringify({
                  shouldLock: e.target.checked,
                }),
              }
            ).then((data) => {
              if (data.success) {
                fetchBatch();
              }
            });
          }}
        />
      </Stack>

      {/* Capacity */}
      <Stack gap="8px">
        <Typography fontSize="14px" fontWeight="600" color="var(--text2)">
          Batch Capacity
        </Typography>
        <StyledTextField
          placeholder="Enter Capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          onBlur={() => {
            if (capacity !== batch.capacity) {
              apiFetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/${params.instituteID}/${params.batchID}/update-capacity`,
                {
                  method: "POST",
                  body: JSON.stringify({
                    capacity: Number(capacity),
                  }),
                }
              ).then((data) => {
                if (data.success) {
                  enqueueSnackbar("Capacity Updated", {
                    variant: "success",
                  });
                  fetchBatch();
                }
              });
            }
          }}
          type="number"
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "var(--white)",
            },
          }}
        />
        <Typography fontSize="12px" color="var(--text3)">
          Maximum number of students allowed in this batch
        </Typography>
      </Stack>

      {/* Batch Code */}
      <Stack gap="8px">
        <Typography fontSize="14px" fontWeight="600" color="var(--text2)">
          Batch Code
        </Typography>
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            border: "1px solid var(--border-color)",
            borderRadius: "5px",
            padding: "0 5px 0 15px",
            height: "45px",
            backgroundColor: "var(--white)",
            justifyContent: "space-between",
          }}
        >
          <Typography
            fontSize="16px"
            fontWeight="500"
            color="var(--text1)"
            sx={{ letterSpacing: "1px" }}
          >
            {batch.batchCode}
          </Typography>
          <Button
            onClick={handleCopy}
            startIcon={<FileCopy />}
            sx={{
              textTransform: "none",
              color: "var(--primary-color)",
              fontWeight: "600",
            }}
          >
            Copy
          </Button>
        </Stack>
        <Typography fontSize="12px" color="var(--text3)">
          Share this code with students to join the batch
        </Typography>
      </Stack>
    </Stack>
  );
}
