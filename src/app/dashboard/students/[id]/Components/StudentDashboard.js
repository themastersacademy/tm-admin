"use client";
import { Stack, Typography, Box, Skeleton } from "@mui/material";
import {
  School,
  TrendingUp,
  CardMembership,
  MenuBook,
} from "@mui/icons-material";
import React from "react";

export default function StudentDashboard({ stats, isLoading }) {
  return (
    <Stack
      direction="row"
      gap="12px"
      flexWrap="wrap"
      sx={{
        "& > *": {
          flex: "1 1 200px",
          minWidth: "180px",
        },
      }}
    >
      <StatCard
        icon={<School />}
        label="Total Exams"
        value={stats?.totalExams || 0}
        color="var(--primary-color)"
        bgColor="var(--primary-color-acc-2)"
        isLoading={isLoading}
      />
      <StatCard
        icon={<TrendingUp />}
        label="Avg Score"
        value={stats?.avgScore ? `${stats.avgScore}%` : "N/A"}
        color="#4CAF50"
        bgColor="rgba(76, 175, 80, 0.08)"
        isLoading={isLoading}
      />
      <StatCard
        icon={<CardMembership />}
        label="Subscription"
        value={stats?.subscription || "None"}
        color="#FF9800"
        bgColor="rgba(255, 152, 0, 0.08)"
        isLoading={isLoading}
      />
      <StatCard
        icon={<MenuBook />}
        label="Courses"
        value={stats?.totalCourses || 0}
        color="#9C27B0"
        bgColor="rgba(156, 39, 176, 0.08)"
        isLoading={isLoading}
      />
    </Stack>
  );
}

const StatCard = ({ icon, label, value, color, bgColor, isLoading }) => (
  <Stack
    direction="row"
    alignItems="center"
    gap="12px"
    sx={{
      backgroundColor: "var(--white)",
      border: "1px solid var(--border-color)",
      borderRadius: "10px",
      padding: "14px 16px",
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: "8px",
        backgroundColor: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon &&
        React.cloneElement(icon, {
          sx: { fontSize: "18px", color: color },
        })}
    </Box>
    <Stack>
      <Typography
        sx={{
          fontSize: "10px",
          color: "var(--text4)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.3px",
        }}
      >
        {label}
      </Typography>
      {isLoading ? (
        <Skeleton variant="text" width={40} height={20} />
      ) : (
        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: 700,
            color: color,
            fontFamily: "Lato",
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>
      )}
    </Stack>
  </Stack>
);
