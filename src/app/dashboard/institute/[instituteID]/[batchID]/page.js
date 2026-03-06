"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  Box,
  Tooltip,
} from "@mui/material";
import {
  Close,
  FileCopy,
  Settings,
  Lock,
  LockOpen,
  ContentCopy,
  GroupAdd,
} from "@mui/icons-material";
import BatchHeader from "./Components/BatchHeader";
import { apiFetch } from "@/src/lib/apiFetch";
import CustomTabs from "@/src/components/CustomTabs/CustomTabs";
import BatchStudents from "./Components/Students";
import ScheduledExams from "./Components/ScheduledExams";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import StyledSwitch from "@/src/components/StyledSwitch/StyledSwitch";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { enqueueSnackbar } from "notistack";

export default function BatchPage() {
  const [batch, setBatch] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const params = useParams();
  const { showSnackbar } = useSnackbar();
  const tabs = [
    {
      label: "Students",
      content: (
        <BatchStudents setStudentCount={setStudentCount} batch={batch} />
      ),
    },
    {
      label: "Scheduled Exams",
      content: <ScheduledExams />,
    },
  ];

  const fetchBatch = useCallback(() => {
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/${params.instituteID}/${params.batchID}`
    ).then((data) => {
      if (data.success) {
        setBatch(data.data);
        apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/${params.instituteID}/${params.batchID}/get-all-students`
        ).then((studentsData) => {
          if (studentsData.success) {
            setStudentCount(studentsData.data.length);
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
        courseCount={0}
      />

      <CustomTabs tabs={tabs} />

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        disableScrollLock
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
          },
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ padding: "14px 20px", borderBottom: "1px solid var(--border-color)" }}
        >
          <Stack direction="row" alignItems="center" gap="10px">
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "8px",
                backgroundColor: "var(--primary-color-acc-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Settings sx={{ fontSize: "16px", color: "var(--primary-color)" }} />
            </Box>
            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "var(--text1)" }}>
              Batch Settings
            </Typography>
          </Stack>
          <IconButton onClick={() => setOpenDialog(false)} size="small" sx={{ width: 28, height: 28 }}>
            <Close sx={{ fontSize: "16px", color: "var(--text3)" }} />
          </IconButton>
        </Stack>

        <DialogContent sx={{ padding: "16px 20px" }}>
          <BatchSettings
            batch={batch}
            handleCopy={handleCopy}
            fetchBatch={fetchBatch}
          />
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

function BatchSettings({ batch, handleCopy, fetchBatch }) {
  const [shouldLock, setShouldLock] = useState(batch.status === "LOCKED");
  const [capacity, setCapacity] = useState(batch.capacity);
  const [codeCopied, setCodeCopied] = useState(false);
  const params = useParams();

  useEffect(() => {
    setShouldLock(batch.status === "LOCKED");
    setCapacity(batch.capacity);
  }, [batch]);

  const handleCopyCode = () => {
    handleCopy();
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <Stack gap="16px">
      {/* Lock Batch */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          padding: "12px 14px",
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          backgroundColor: "var(--bg-color, #fafafa)",
        }}
      >
        <Stack direction="row" alignItems="center" gap="10px">
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "8px",
              backgroundColor: shouldLock ? "rgba(244, 67, 54, 0.08)" : "var(--primary-color-acc-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {shouldLock ? (
              <Lock sx={{ fontSize: "14px", color: "#f44336" }} />
            ) : (
              <LockOpen sx={{ fontSize: "14px", color: "var(--primary-color)" }} />
            )}
          </Box>
          <Stack>
            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text1)" }}>
              Lock Batch
            </Typography>
            <Typography sx={{ fontSize: "10px", color: "var(--text4)" }}>
              Prevent new students from enrolling
            </Typography>
          </Stack>
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
      <Stack gap="6px">
        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "var(--text2)" }}>
          Batch Capacity
        </Typography>
        <Stack direction="row" alignItems="center" gap="8px">
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "8px",
              backgroundColor: "var(--primary-color-acc-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <GroupAdd sx={{ fontSize: "14px", color: "var(--primary-color)" }} />
          </Box>
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
              flex: 1,
              "& .MuiOutlinedInput-root": {
                height: "36px",
                fontSize: "13px",
                borderRadius: "8px",
                backgroundColor: "var(--white)",
              },
            }}
          />
        </Stack>
        <Typography sx={{ fontSize: "10px", color: "var(--text4)", ml: "36px" }}>
          Maximum students allowed in this batch
        </Typography>
      </Stack>

      {/* Batch Code */}
      <Stack gap="6px">
        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "var(--text2)" }}>
          Batch Code
        </Typography>
        <Tooltip title={codeCopied ? "Copied!" : "Click to copy"} arrow>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            onClick={handleCopyCode}
            sx={{
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "8px 12px",
              backgroundColor: "var(--bg-color, #fafafa)",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "var(--primary-color)",
                backgroundColor: "var(--primary-color-acc-2)",
              },
            }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 700,
                fontFamily: "monospace",
                color: "var(--text1)",
                letterSpacing: "2px",
              }}
            >
              {batch.batchCode}
            </Typography>
            <ContentCopy
              sx={{
                fontSize: "14px",
                color: codeCopied ? "#4caf50" : "var(--text3)",
                transition: "color 0.2s",
              }}
            />
          </Stack>
        </Tooltip>
        <Typography sx={{ fontSize: "10px", color: "var(--text4)" }}>
          Share this code with students to join the batch
        </Typography>
      </Stack>
    </Stack>
  );
}
