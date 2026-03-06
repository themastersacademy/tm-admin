"use client";
import {
  Stack,
  Typography,
  Chip,
  IconButton,
  Skeleton,
  Switch,
  Box,
} from "@mui/material";
import {
  ArrowBack,
  Quiz,
  Category,
  Timer,
  CheckCircle,
  Schedule,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";

export default function ExamDetailHeader({
  examTitle,
  isLoading,
  totalQuestions,
  totalSections,
  duration,
  isLive,
  createdAt,
  onBackClick,
  examID,
  type,
  fetchTestSeries,
}) {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [examLive, setExamLive] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    setExamLive(isLive === true);
  }, [isLive]);

  const handleLiveToggle = async () => {
    const newState = !examLive;
    setIsToggling(true);
    try {
      const url = newState
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/exam-live`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/exam-unlive`;

      const data = await apiFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examID, type }),
      });

      if (data.success) {
        setExamLive(newState);
        if (fetchTestSeries) fetchTestSeries();
        showSnackbar(
          newState ? "Exam is now live" : "Exam is no longer live",
          "success",
          "",
          "3000",
        );
      } else {
        showSnackbar(
          data.message || "Failed to update exam status",
          "error",
          "",
          "3000",
        );
      }
    } catch (error) {
      showSnackbar("Failed to update exam status", "error", "", "3000");
    } finally {
      setIsToggling(false);
    }
  };

  const handleBack = () => {
    if (onBackClick) onBackClick();
    else router.back();
  };

  const formatDuration = (mins) => {
    if (!mins) return "Not Set";
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    if (hours > 0) return `${hours}h ${m}m`;
    return `${m}m`;
  };

  return (
    <Stack
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      {/* Top Bar */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        padding="20px 24px"
        sx={{ borderBottom: "1px solid var(--border-color)" }}
      >
        {/* Left: Back + Title */}
        <Stack direction="row" alignItems="center" gap="14px">
          <IconButton
            onClick={handleBack}
            sx={{
              width: "40px",
              height: "40px",
              backgroundColor: "var(--bg-color)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              "&:hover": {
                backgroundColor: "rgba(24, 113, 99, 0.08)",
                borderColor: "var(--primary-color)",
              },
            }}
          >
            <ArrowBack sx={{ fontSize: "18px", color: "var(--text1)" }} />
          </IconButton>

          <Stack gap="2px">
            {isLoading ? (
              <>
                <Skeleton variant="text" width={220} height={28} />
                <Skeleton variant="text" width={140} height={16} />
              </>
            ) : (
              <>
                <Stack direction="row" alignItems="center" gap="10px">
                  <Typography
                    sx={{
                      fontFamily: "Lato",
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "var(--text1)",
                    }}
                  >
                    {examTitle || "Untitled Exam"}
                  </Typography>
                  <Chip
                    label={examLive ? "Live" : "Draft"}
                    size="small"
                    sx={{
                      height: "22px",
                      fontSize: "11px",
                      fontWeight: 600,
                      backgroundColor: examLive
                        ? "rgba(76, 175, 80, 0.1)"
                        : "rgba(255, 152, 0, 0.1)",
                      color: examLive ? "#2e7d32" : "#e65100",
                      border: `1px solid ${examLive ? "rgba(76, 175, 80, 0.3)" : "rgba(255, 152, 0, 0.3)"}`,
                    }}
                  />
                </Stack>
                <Typography sx={{ fontSize: "12px", color: "var(--text3)" }}>
                  {createdAt
                    ? `Created on ${new Date(createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                    : "Manage questions, settings, and students"}
                </Typography>
              </>
            )}
          </Stack>
        </Stack>

        {/* Right: Live toggle */}
        {!isLoading && (
          <Stack direction="row" alignItems="center" gap="8px">
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 600,
                color: examLive ? "#2e7d32" : "var(--text3)",
              }}
            >
              {examLive ? "Live" : "Draft"}
            </Typography>
            <Switch
              checked={examLive}
              onChange={handleLiveToggle}
              disabled={isToggling}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#4CAF50",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#4CAF50",
                },
              }}
            />
          </Stack>
        )}
      </Stack>

      {/* Stats Row - Compact inline */}
      <Stack direction="row" sx={{ minHeight: "64px" }}>
        <StatItem
          icon={<Quiz />}
          label="Questions"
          value={totalQuestions || 0}
          isLoading={isLoading}
        />
        <Box
          sx={{
            width: "1px",
            backgroundColor: "var(--border-color)",
            alignSelf: "stretch",
          }}
        />
        <StatItem
          icon={<Category />}
          label="Sections"
          value={totalSections || 0}
          isLoading={isLoading}
        />
        <Box
          sx={{
            width: "1px",
            backgroundColor: "var(--border-color)",
            alignSelf: "stretch",
          }}
        />
        <StatItem
          icon={<Timer />}
          label="Duration"
          value={formatDuration(duration)}
          isLoading={isLoading}
        />
        <Box
          sx={{
            width: "1px",
            backgroundColor: "var(--border-color)",
            alignSelf: "stretch",
          }}
        />
        <StatItem
          icon={examLive ? <CheckCircle /> : <Schedule />}
          label="Status"
          value={examLive ? "Live" : "Draft"}
          color={examLive ? "#2e7d32" : "#e65100"}
          isLoading={isLoading}
        />
      </Stack>
    </Stack>
  );
}

const StatItem = ({ icon, label, value, color, isLoading }) => (
  <Stack
    direction="row"
    alignItems="center"
    gap="10px"
    flex={1}
    padding="14px 20px"
  >
    <Stack
      sx={{
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        backgroundColor: "var(--bg-color)",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      {icon &&
        React.cloneElement(icon, {
          sx: { fontSize: "18px", color: color || "var(--primary-color)" },
        })}
    </Stack>
    <Stack>
      <Typography
        sx={{
          fontSize: "11px",
          color: "var(--text3)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.3px",
          lineHeight: 1.2,
        }}
      >
        {label}
      </Typography>
      {isLoading ? (
        <Skeleton variant="text" width={40} height={22} />
      ) : (
        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: 700,
            color: color || "var(--text1)",
            fontFamily: "Lato",
            lineHeight: 1.3,
          }}
        >
          {value}
        </Typography>
      )}
    </Stack>
  </Stack>
);
