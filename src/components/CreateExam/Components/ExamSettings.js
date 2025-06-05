"use client";
import { Stack, Tooltip, Typography } from "@mui/material";
import StyledTextField from "../../StyledTextField/StyledTextField";
import { useState } from "react";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { apiFetch } from "@/src/lib/apiFetch";
import { useParams } from "next/navigation";
import DatePicker from "@/src/app/dashboard/goals/[id]/testseries/[examID]/Components/DatePicker";
import UpdateSwitch from "@/src/app/dashboard/goals/[id]/testseries/[examID]/Components/updateSwitch";
import SelectBatch from "./SelectBatch";

export default function ExamSettings({ exam, setExam, type, isLive }) {
  const [initialTitle, setInitialTitle] = useState(exam.title || "");
  const [initialDuration, setInitialDuration] = useState(exam.duration || "");
  const { showSnackbar } = useSnackbar();
  const params = useParams();
  const examID = params.examID;

  const updateExam = ({ params = {} }) => {
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        examID: examID,
        type: type,
        ...params,
      }),
    }).then((data) => {
      if (data.success) {
        setExam((prev) => ({ ...prev, ...params }));
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
    });
  };

  const updateBatchList = (batchList) => {
    console.log(batchList);
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/batch-list-update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ examID, batchList }),
    }).then((data) => {
      if (data.success) {
        setExam((prev) => ({ ...prev, batchList }));
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
    });
  };

  return (
    <Tooltip
      title={isLive ? "You cannot Edit when exam is live" : ""}
      followCursor
      placement="right"
    >
      <Stack gap="20px" marginTop="20px" padding="10px">
        <Stack gap="20px" flexDirection="row" alignItems="center">
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "14px",
              fontWeight: "700",
              color: "var(--text3)",
              width: "200px",
              pointerEvents: isLive ? "none" : "auto",
              opacity: isLive ? 0.5 : 1,
            }}
          >
            Title
          </Typography>
          <StyledTextField
            placeholder="Enter title"
            sx={{ width: "600px" }}
            value={exam.title || ""}
            onFocus={(e) => {
              e.target.select();
              setInitialTitle(e.target.value);
            }}
            onBlur={(e) => {
              const newTitle = e.target.value;
              if (newTitle !== initialTitle) {
                setExam((prev) => ({ ...prev, title: newTitle }));
                updateExam({ params: { title: newTitle } });
              }
            }}
            onChange={(e) => {
              const newTitle = e.target.value;
              setExam((prev) => ({ ...prev, title: newTitle }));
            }}
            disabled={isLive}
          />
        </Stack>
        <Stack
          gap="20px"
          flexDirection="row"
          alignItems="center"
          sx={{
            pointerEvents: isLive ? "none" : "auto",
            opacity: isLive ? 0.5 : 1,
          }}
        >
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "14px",
              fontWeight: "700",
              color: "var(--text3)",
              width: "200px",
            }}
          >
            Starts At
          </Typography>
          <DatePicker
            data={exam}
            setData={setExam}
            updateData={updateExam}
            field="startTimeStamp"
          />
        </Stack>
        <Stack
          gap="20px"
          flexDirection="row"
          alignItems="center"
          sx={{
            pointerEvents: isLive ? "none" : "auto",
            opacity: isLive ? 0.5 : 1,
          }}
        >
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "14px",
              fontWeight: "700",
              color: "var(--text3)",
              width: "200px",
            }}
          >
            Ends At
          </Typography>
          <DatePicker
            data={exam}
            setData={setExam}
            updateData={updateExam}
            field="endTimeStamp"
          />
        </Stack>
        <Stack gap="20px" flexDirection="row" alignItems="center">
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "14px",
              fontWeight: "700",
              color: "var(--text3)",
              width: "200px",
              pointerEvents: isLive ? "none" : "auto",
              opacity: isLive ? 0.5 : 1,
            }}
          >
            Exam duration in mins
          </Typography>
          <StyledTextField
            placeholder="Enter Duration"
            sx={{ width: "600px" }}
            value={exam.duration || ""}
            onChange={(e) => {
              const newDuration = e.target.value;
              if (/^\d*$/.test(newDuration)) {
                setExam((prev) => ({ ...prev, duration: newDuration }));
              }
            }}
            onFocus={(e) => {
              e.target.select();
              setInitialDuration(e.target.value);
            }}
            onBlur={(e) => {
              const newDuration = e.target.value;
              if (newDuration !== initialDuration) {
                setExam((prev) => ({ ...prev, duration: newDuration }));
                updateExam({ params: { duration: newDuration } });
              }
            }}
            disabled={isLive}
          />
        </Stack>
        {type === "scheduled" && (
          <Stack gap="20px" flexDirection="row" alignItems="center">
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "14px",
                fontWeight: "700",
                color: "var(--text3)",
                width: "200px",
                pointerEvents: isLive ? "none" : "auto",
                opacity: isLive ? 0.5 : 1,
              }}
            >
              Select Batch
            </Typography>
            <Stack width="600px">
              <SelectBatch
                exam={exam}
                setExam={setExam}
                updateBatchList={updateBatchList}
                isLive={isLive}
              />
            </Stack>
          </Stack>
        )}

        <UpdateSwitch
          data={exam}
          setData={setExam}
          updateData={updateExam}
          mode={type}
          isLive={isLive}
        />
      </Stack>
    </Tooltip>
  );
}
