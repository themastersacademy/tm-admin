"use client";
import { Stack, Typography, CircularProgress } from "@mui/material";
import {
  Quiz,
  SignalCellularAlt1Bar,
  SignalCellularAlt2Bar,
  SignalCellularAlt,
  CheckCircle,
} from "@mui/icons-material";
import React from "react";

export default function SubjectAnalytics({ stats, isLoading }) {
  return (
    <Stack gap="20px">
      {/* Section Header */}
      <Stack direction="row" alignItems="center" gap="10px">
        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--text1)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Subject Overview
        </Typography>
        <Stack
          sx={{
            width: "40px",
            height: "2px",
            background:
              "linear-gradient(90deg, var(--primary-color) 0%, transparent 100%)",
          }}
        />
      </Stack>

      {/* Stats Cards Grid */}
      <Stack
        direction="row"
        gap="16px"
        flexWrap="wrap"
        sx={{
          "& > *": {
            flex: "1 1 220px",
            minWidth: "220px",
          },
        }}
      >
        <DashboardStatCard
          icon={<Quiz />}
          label="Total Questions"
          value={stats?.totalQuestions || 0}
          color="#2196F3"
          bgColor="rgba(33, 150, 243, 0.08)"
          isLoading={isLoading}
        />
        <DashboardStatCard
          icon={<SignalCellularAlt1Bar />}
          label="Easy Questions"
          value={stats?.easyQuestions || 0}
          color="#4CAF50"
          bgColor="rgba(76, 175, 80, 0.08)"
          isLoading={isLoading}
        />
        <DashboardStatCard
          icon={<SignalCellularAlt2Bar />}
          label="Medium Questions"
          value={stats?.mediumQuestions || 0}
          color="#FF9800"
          bgColor="rgba(255, 152, 0, 0.08)"
          isLoading={isLoading}
        />
        <DashboardStatCard
          icon={<SignalCellularAlt />}
          label="Hard Questions"
          value={stats?.hardQuestions || 0}
          color="#F44336"
          bgColor="rgba(244, 67, 54, 0.08)"
          isLoading={isLoading}
        />
      </Stack>
    </Stack>
  );
}

const DashboardStatCard = ({
  icon,
  label,
  value,
  color,
  bgColor,
  isLoading,
}) => {
  return (
    <Stack
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
          borderColor: color + "50",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`,
        },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        {/* Icon */}
        <Stack
          sx={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            backgroundColor: bgColor,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: `1.5px solid ${color}30`,
          }}
        >
          {icon &&
            React.cloneElement(icon, {
              sx: { fontSize: "24px", color: color },
            })}
        </Stack>
      </Stack>

      {/* Label */}
      <Typography
        sx={{
          fontSize: "13px",
          color: "var(--text3)",
          fontWeight: 600,
          marginTop: "16px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </Typography>

      {/* Value */}
      {isLoading ? (
        <CircularProgress size={24} sx={{ color: color, marginTop: "8px" }} />
      ) : (
        <Stack direction="row" alignItems="baseline" gap="8px" marginTop="4px">
          <Typography
            sx={{
              fontSize: "32px",
              fontWeight: 800,
              color: color,
              fontFamily: "Lato",
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};
