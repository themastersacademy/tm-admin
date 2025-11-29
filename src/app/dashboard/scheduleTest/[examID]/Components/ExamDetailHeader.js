"use client";
import {
  Stack,
  Typography,
  Chip,
  IconButton,
  Skeleton,
  Button,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Quiz,
  Category,
  Timer,
  CheckCircle,
  Schedule,
  Cancel,
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
  const [examLive, setExamLive] = useState(isLive);

  useEffect(() => {
    setExamLive(isLive);
  }, [isLive]);

  const handleLiveToggle = async () => {
    const isChecked = !examLive; // Toggle the current state

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
        if (fetchTestSeries) fetchTestSeries();
        showSnackbar(
          isChecked ? "Exam is now live" : "Exam is no longer live",
          "success",
          "",
          "3000"
        );
      } else {
        showSnackbar(
          data.message || data.error || "Failed to update exam status",
          "error",
          "",
          "3000"
        );
      }
    } catch (error) {
      console.error("Error toggling exam live state:", error);
      showSnackbar("Failed to update exam status", "error", "", "3000");
    }
  };

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  // Determine status
  const getStatus = () => {
    if (isLive === true)
      return { label: "Live", color: "#4CAF50", bg: "rgba(76, 175, 80, 0.1)" };
    if (isLive === false)
      return { label: "Draft", color: "#FF9800", bg: "rgba(255, 152, 0, 0.1)" };
    return {
      label: "Unknown",
      color: "#9E9E9E",
      bg: "rgba(158, 158, 158, 0.1)",
    };
  };

  const status = getStatus();

  return (
    <Stack
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Top Bar */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        padding="20px 24px"
        sx={{
          borderBottom: "1px solid var(--border-color)",
          background: "linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)",
        }}
      >
        {/* Left: Back Button + Title & Icon */}
        <Stack direction="row" alignItems="center" gap="16px">
          <IconButton
            onClick={handleBack}
            sx={{
              width: "44px",
              height: "44px",
              backgroundColor: "var(--bg-color)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              "&:hover": {
                backgroundColor: "rgba(var(--primary-rgb), 0.08)",
                borderColor: "var(--primary-color)",
                transform: "translateX(-2px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <ArrowBack sx={{ fontSize: "20px", color: "var(--text1)" }} />
          </IconButton>

          <Stack
            sx={{
              width: "52px",
              height: "52px",
              background:
                "linear-gradient(135deg, rgba(var(--primary-rgb), 0.12) 0%, rgba(var(--primary-rgb), 0.06) 100%)",
              borderRadius: "14px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: `1.5px solid rgba(var(--primary-rgb), 0.25)`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Edit sx={{ fontSize: "26px", color: "var(--primary-color)" }} />
          </Stack>

          <Stack gap="6px">
            <Stack direction="row" alignItems="center" gap="12px">
              {isLoading ? (
                <Skeleton variant="text" width={200} height={32} />
              ) : (
                <>
                  <Typography
                    sx={{
                      fontFamily: "Lato",
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "var(--text1)",
                    }}
                  >
                    {examTitle || "Untitled Exam"}
                  </Typography>
                  <Chip
                    label={status.label}
                    size="small"
                    sx={{
                      backgroundColor: status.bg,
                      color: status.color,
                      fontWeight: 700,
                      fontSize: "11px",
                      height: "24px",
                      border: `1px solid ${status.color}40`,
                    }}
                  />
                  {/* Live Button */}
                  {!isLoading && (
                    <Button
                      variant="contained"
                      onClick={handleLiveToggle}
                      startIcon={examLive ? <CheckCircle /> : <Schedule />}
                      sx={{
                        background: examLive
                          ? "linear-gradient(135deg, #4CAF50 0%, #45A049 100%)"
                          : "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
                        color: "#FFFFFF",
                        textTransform: "none",
                        borderRadius: "10px",
                        padding: "8px 20px",
                        fontWeight: 700,
                        fontSize: "13px",
                        boxShadow: examLive
                          ? "0 3px 10px rgba(76, 175, 80, 0.25)"
                          : "0 3px 10px rgba(255, 152, 0, 0.25)",
                        height: "40px",
                        minWidth: "140px",
                        "&:hover": {
                          background: examLive
                            ? "linear-gradient(135deg, #45A049 0%, #3D8B40 100%)"
                            : "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
                          boxShadow: examLive
                            ? "0 4px 14px rgba(76, 175, 80, 0.35)"
                            : "0 4px 14px rgba(255, 152, 0, 0.35)",
                          transform: "translateY(-1px)",
                        },
                        transition: "all 0.2s ease",
                      }}
                      disableElevation
                    >
                      {examLive ? "Published" : "Make Live"}
                    </Button>
                  )}
                </>
              )}
            </Stack>
            <Typography
              sx={{ fontSize: "13px", color: "var(--text3)", lineHeight: 1.4 }}
            >
              {isLoading ? (
                <Skeleton variant="text" width={150} />
              ) : createdAt ? (
                `Created on ${new Date(createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}`
              ) : (
                "Manage exam questions, settings, and student progress"
              )}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      {/* Stats Section */}
      <Stack padding="24px" gap="20px">
        <Stack direction="row" alignItems="center" gap="10px">
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--text1)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Exam Overview
          </Typography>
          <Stack
            sx={{
              width: "32px",
              height: "2px",
              background:
                "linear-gradient(90deg, var(--primary-color) 0%, transparent 100%)",
            }}
          />
        </Stack>

        {/* Stats Cards */}
        <Stack direction="row" gap="16px" flexWrap="wrap">
          <ModernStatCard
            icon={<Quiz />}
            label="Total Questions"
            value={totalQuestions || 0}
            color="#2196F3"
            bgColor="rgba(33, 150, 243, 0.08)"
            isLoading={isLoading}
          />
          <ModernStatCard
            icon={<Category />}
            label="Sections"
            value={totalSections || 0}
            color="#9C27B0"
            bgColor="rgba(156, 39, 176, 0.08)"
            isLoading={isLoading}
          />
          <ModernStatCard
            icon={<Timer />}
            label="Duration"
            value={`${duration || 0} min`}
            color="#FF9800"
            bgColor="rgba(255, 152, 0, 0.08)"
            isLoading={isLoading}
          />
          <ModernStatCard
            icon={isLive ? <CheckCircle /> : <Schedule />}
            label="Status"
            value={status.label}
            color={status.color}
            bgColor={status.bg}
            isLoading={isLoading}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}

const ModernStatCard = ({ icon, label, value, color, bgColor, isLoading }) => (
  <Stack
    direction="row"
    alignItems="center"
    gap="12px"
    padding="16px 20px"
    sx={{
      backgroundColor: bgColor || "var(--bg-color)",
      borderRadius: "12px",
      border: "1px solid var(--border-color)",
      minWidth: "200px",
      flex: 1,
    }}
  >
    <Stack
      sx={{
        width: "44px",
        height: "44px",
        backgroundColor: "var(--white)",
        borderRadius: "10px",
        justifyContent: "center",
        alignItems: "center",
        border: `1.5px solid ${color}30`,
        flexShrink: 0,
      }}
    >
      {icon &&
        React.cloneElement(icon, {
          sx: { fontSize: "22px", color: color },
        })}
    </Stack>
    <Stack gap="4px" flex={1}>
      <Typography
        sx={{
          fontSize: "12px",
          color: "var(--text3)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </Typography>
      {isLoading ? (
        <Typography sx={{ fontSize: "24px", color: "var(--text3)" }}>
          -
        </Typography>
      ) : (
        <Typography
          sx={{
            fontSize: "26px",
            fontWeight: 800,
            color: color,
            fontFamily: "Lato",
            lineHeight: 1,
          }}
        >
          {value}
        </Typography>
      )}
    </Stack>
  </Stack>
);
