"use client";
import { Stack, Typography, Chip } from "@mui/material";
import { EmojiEvents, CheckCircle, Edit } from "@mui/icons-material";
import React from "react";

export default function GoalsHeader({
  actions,
  totalCount = 0,
  stats = { total: 0, live: 0, draft: 0 },
}) {
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
                "linear-gradient(135deg, rgba(255, 152, 0, 0.12) 0%, rgba(245, 124, 0, 0.06) 100%)",
              borderRadius: "14px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "1.5px solid rgba(255, 152, 0, 0.25)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <EmojiEvents sx={{ fontSize: "26px", color: "#FF9800" }} />
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
                Goals
              </Typography>
              <Chip
                label={`${totalCount} ${totalCount === 1 ? "Goal" : "Goals"}`}
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
              Create and manage learning goals for students
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
              Goals Overview
            </Typography>
            <Stack
              sx={{
                width: "32px",
                height: "2px",
                background:
                  "linear-gradient(90deg, #FF9800 0%, transparent 100%)",
              }}
            />
          </Stack>
        </Stack>

        {/* Stats Cards */}
        <Stack direction="row" gap="16px" flexWrap="wrap">
          <ModernStatCard
            icon={<EmojiEvents />}
            label="Total Goals"
            value={stats.total}
            color="#FF9800"
            bgColor="rgba(255, 152, 0, 0.08)"
          />
          <ModernStatCard
            icon={<CheckCircle />}
            label="Published Goals"
            value={stats.live}
            color="#4CAF50"
            bgColor="rgba(76, 175, 80, 0.08)"
          />
          <ModernStatCard
            icon={<Edit />}
            label="Draft Goals"
            value={stats.draft}
            color="#9E9E9E"
            bgColor="rgba(158, 158, 158, 0.08)"
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
    </Stack>
  </Stack>
);
