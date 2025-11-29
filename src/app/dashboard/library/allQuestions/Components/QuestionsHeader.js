"use client";
import { Stack, Typography, Chip } from "@mui/material";
import {
  Quiz,
  SignalCellularAlt1Bar,
  SignalCellularAlt2Bar,
  SignalCellularAlt,
} from "@mui/icons-material";

export default function QuestionsHeader({
  stats = {},
  actions,
  totalCount = 0,
}) {
  const { totalQuestions = 0, difficultyCounts = { 1: 0, 2: 0, 3: 0 } } = stats;

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
        {/* Left: Title & Badge */}
        <Stack direction="row" alignItems="center" gap="16px">
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
              border: "1.5px solid rgba(var(--primary-rgb), 0.25)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Quiz sx={{ fontSize: "26px", color: "var(--primary-color)" }} />
          </Stack>

          <Stack gap="6px">
            <Stack direction="row" alignItems="center" gap="12px">
              <Typography
                sx={{
                  fontFamily: "Lato",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--text1)",
                }}
              >
                Question Bank
              </Typography>
              <Chip
                label={`${totalCount} ${
                  totalCount === 1 ? "Question" : "Questions"
                }`}
                size="small"
                sx={{
                  backgroundColor: "rgba(255, 152, 0, 0.1)",
                  color: "#F57C00",
                  fontWeight: 700,
                  fontSize: "11px",
                  height: "24px",
                  border: "1px solid rgba(255, 152, 0, 0.2)",
                }}
              />
            </Stack>
            <Typography
              sx={{ fontSize: "13px", color: "var(--text3)", lineHeight: 1.4 }}
            >
              Manage and organize your questions with detailed insights
            </Typography>
          </Stack>
        </Stack>

        {/* Right: Actions */}
        <Stack direction="row" gap="12px" alignItems="center">
          {actions}
        </Stack>
      </Stack>

      {/* Stats Section */}
      <Stack padding="24px" gap="20px">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
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
              Question Overview
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
        </Stack>

        {/* Stats Cards */}
        <Stack direction="row" gap="16px" flexWrap="wrap">
          <ModernStatCard
            icon={<Quiz />}
            label="Total Questions"
            value={totalQuestions}
            color="#2196F3"
            bgColor="rgba(33, 150, 243, 0.08)"
          />
          <ModernStatCard
            icon={<SignalCellularAlt1Bar />}
            label="Easy Questions"
            value={difficultyCounts[1] || 0}
            color="#4CAF50"
            bgColor="rgba(76, 175, 80, 0.08)"
          />
          <ModernStatCard
            icon={<SignalCellularAlt2Bar />}
            label="Medium Questions"
            value={difficultyCounts[2] || 0}
            color="#FF9800"
            bgColor="rgba(255, 152, 0, 0.08)"
          />
          <ModernStatCard
            icon={<SignalCellularAlt />}
            label="Hard Questions"
            value={difficultyCounts[3] || 0}
            color="#F44336"
            bgColor="rgba(244, 67, 54, 0.08)"
          />
        </Stack>
      </Stack>
    </Stack>
  );
}

const ModernStatCard = ({ icon, label, value, color, bgColor }) => (
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
        typeof icon === "object" &&
        icon.type && {
          ...icon,
          props: { ...icon.props, sx: { fontSize: "22px", color } },
        }}
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
      <Typography
        sx={{
          fontSize: "26px",
          fontWeight: 800,
          color: color,
          fontFamily: "Lato",
          lineHeight: 1,
        }}
      >
        {value?.toLocaleString?.("en-IN") || value}
      </Typography>
    </Stack>
  </Stack>
);
