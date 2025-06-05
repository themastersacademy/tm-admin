"use client";
import Image from "next/image";
import SecondaryCard from "../../SecondaryCard/SecondaryCard";
import { CalendarToday } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import StyledSwitch from "../../StyledSwitch/StyledSwitch";
import { useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";

export default function ExamInfoCard({
  examTitle,
  icon,
  date,
  questions,
  duration,
  type,
  examID,
  isLive,
  fetchTestSeries,
}) {
  const [examLive, setExamLive] = useState(isLive);
  const { showSnackbar } = useSnackbar();
  useEffect(() => {
    setExamLive(isLive);
  }, [isLive]);

  const handleSwitchChange = async (e) => {
    const isChecked = e.target.checked;

    try {
      const url = isChecked
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/exam-live`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/exam-unlive`;

      const data = await apiFetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ examID: examID, type: type }),
      });

      if (data.success) {
        setExamLive(isChecked);
        fetchTestSeries();
      } else {
        showSnackbar("Fill All Fields", "error", "", "3000");
      }
    } catch (error) {
      console.error("Error toggling exam live state:", error);
    }
  };

  return (
    <SecondaryCard
      title={examTitle}
      icon={<Image src={icon} alt="icon" width={24} height={24} />}
      subTitle={
        <Stack flexDirection="row" gap="40px" alignItems="center">
          <Stack flexDirection="row" gap="5px" alignItems="center">
            <CalendarToday sx={{ color: "var(--text4)", fontSize: "16px" }} />
            <Typography sx={{ color: "var(--text3)", fontSize: "14px" }}>
              {date}
            </Typography>
          </Stack>
          <Stack flexDirection="row" gap="40px" alignItems="center">
            <Typography sx={{ color: "var(--text3)", fontSize: "14px" }}>
              {questions}
            </Typography>
            <Typography sx={{ color: "var(--text3)", fontSize: "14px" }}>
              {duration}
            </Typography>
          </Stack>
        </Stack>
      }
      button={
        <StyledSwitch
          checked={examLive || false}
          onChange={(e) => handleSwitchChange(e)}
        />
      }
    />
  );
}
