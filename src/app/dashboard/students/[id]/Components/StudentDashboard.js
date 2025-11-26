"use client";
import { Stack, Typography, CircularProgress } from "@mui/material";
import {
  School,
  TrendingUp,
  CardMembership,
  MenuBook,
  CheckCircle,
} from "@mui/icons-material";
import React from "react";

export default function StudentDashboard({ stats, isLoading }) {
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
          Quick Overview
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
          icon={<School />}
          label="Total Exams"
          value={stats?.totalExams || 0}
          color="#2196F3"
          bgColor="rgba(33, 150, 243, 0.08)"
          isLoading={isLoading}
          trend={stats?.examsTrend}
        />
        <DashboardStatCard
          icon={<TrendingUp />}
          label="Average Score"
          value={stats?.avgScore ? `${stats.avgScore}%` : "N/A"}
          color="#4CAF50"
          bgColor="rgba(76, 175, 80, 0.08)"
          isLoading={isLoading}
          trend={stats?.scoreTrend}
        />
        <DashboardStatCard
          icon={<CardMembership />}
          label="Subscription"
          value={stats?.subscription || "None"}
          color="#FF9800"
          bgColor="rgba(255, 152, 0, 0.08)"
          isLoading={isLoading}
          isText
        />
        <DashboardStatCard
          icon={<MenuBook />}
          label="Courses"
          value={stats?.totalCourses || 0}
          color="#9C27B0"
          bgColor="rgba(156, 39, 176, 0.08)"
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
  trend,
  isText = false,
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

        {/* Trend Indicator */}
        {trend && !isText && (
          <Stack
            direction="row"
            alignItems="center"
            gap="4px"
            sx={{
              backgroundColor:
                trend > 0 ? "rgba(76, 175, 80, 0.1)" : "rgba(244, 67, 54, 0.1)",
              padding: "4px 8px",
              borderRadius: "6px",
            }}
          >
            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 700,
                color: trend > 0 ? "#4CAF50" : "#F44336",
              }}
            >
              {trend > 0 ? "+" : ""}
              {trend}%
            </Typography>
          </Stack>
        )}
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
              fontSize: isText ? "20px" : "32px",
              fontWeight: 800,
              color: color,
              fontFamily: "Lato",
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>
          {!isText && value !== "N/A" && (
            <CheckCircle
              sx={{
                fontSize: "16px",
                color: "#4CAF50",
              }}
            />
          )}
        </Stack>
      )}

      {/* Progress indicator for certain stats */}
      {!isText && value !== "N/A" && typeof value === "number" && (
        <Stack
          sx={{
            mt: "12px",
            height: "4px",
            backgroundColor: bgColor,
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <Stack
            sx={{
              height: "100%",
              width: `${Math.min((value / 100) * 100, 100)}%`,
              backgroundColor: color,
              transition: "width 0.5s ease",
            }}
          />
        </Stack>
      )}
    </Stack>
  );
};
