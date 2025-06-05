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
import { apiFetch } from "@/src/lib/apiFetch";
import CustomTabs from "@/src/components/CustomTabs/CustomTabs";
import BatchCourse from "./Components/Courses";
import BatchStudents from "./Components/Students";
import BatchHistory from "./Components/History";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import StyledSwitch from "@/src/components/StyledSwitch/StyledSwitch";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { enqueueSnackbar } from "notistack";

export default function BatchPage() {
  const [batch, setBatch] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const params = useParams();
  const { showSnackbar } = useSnackbar();
  const tabs = [
    {
      label: "Students",
      content: <BatchStudents />,
    },
    {
      label: "Courses",
      content: <BatchCourse />,
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
      <Header
        title={batch.title || <Skeleton variant="text" width={100} />}
        button={[
          <IconButton key="copy" onClick={() => setOpenDialog(true)}>
            <Settings sx={{ color: "var(--text3)" }} />
          </IconButton>,
          <Button
            key="add"
            variant="outlined"
            endIcon={<FileCopy sx={{ color: "var(--text3)" }} />}
            onClick={handleCopy}
            sx={{
              fontSize: "16px",
              width: "130px",
              borderColor: "var(--border-color)",
              textTransform: "none",
              fontFamily: "Lato",
              color: "var(--text3) ",
            }}
          >
            {batch.batchCode || <Skeleton variant="text" width={70} />}
          </Button>,
        ]}
        back
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
        <DialogContent>
          <BatchSettings batch={batch} handleCopy={handleCopy} />
        </DialogContent>
      </DialogBox>
    </Stack>
  );
}

function BatchSettings({ batch, handleCopy }) {
  const [shouldLock, setShouldLock] = useState(batch.status === "LOCKED");
  const [capacity, setCapacity] = useState(batch.capacity);
  const params = useParams();
  const fetchBatch = useCallback(() => {
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/${params.instituteID}/${params.batchID}`
    ).then((data) => {
      if (data.success) {
        setBatch(data.data);
        setCapacity(data.data.capacity);
        setShouldLock(data.data.status === "LOCKED");
      }
    });
  }, [params.instituteID, params.batchID]);
  return (
    <Stack gap="20px">
      <Stack gap="10px" direction="row" alignItems="center">
        <Typography fontSize="16px" fontWeight="600" width="150px">
          Batch Locked
        </Typography>
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
      <Stack gap="10px" direction="row" alignItems="center">
        <Typography fontSize="16px" fontWeight="600" width="150px">
          Capacity
        </Typography>
        <Stack>
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
            sx={{ width: "100px" }}
          />
        </Stack>
      </Stack>
      <Stack gap="10px" direction="row" alignItems="center">
        <Typography fontSize="16px" fontWeight="600" width="150px">
          Batch Code
        </Typography>
        <Typography>{batch.batchCode}</Typography>
        <IconButton onClick={handleCopy}>
          <FileCopy />
        </IconButton>
      </Stack>
    </Stack>
  );
}
