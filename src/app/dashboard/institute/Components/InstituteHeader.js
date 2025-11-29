"use client";
import { Stack, Typography, Button, Chip } from "@mui/material";
import { Add, Business, Groups, Domain } from "@mui/icons-material";
import React from "react";

export default function InstituteHeader({
  instituteCount,
  activeBatches,
  onCreateClick,
  isLoading,
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
        {/* Left: Title & Icon */}
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
            <Business sx={{ fontSize: "26px", color: "var(--primary-color)" }} />
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
                Institute Management
              </Typography>
              <Chip
                label={`${instituteCount} ${
                  instituteCount === 1 ? "Institute" : "Institutes"
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
              Manage all your institutes and their details here
            </Typography>
          </Stack>
        </Stack>

        {/* Right: Action Button */}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onCreateClick}
          sx={{
            background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
            color: "#FFFFFF",
            textTransform: "none",
            borderRadius: "10px",
            padding: "10px 24px",
            fontWeight: 700,
            fontSize: "14px",
            boxShadow: "0 4px 12px rgba(255, 152, 0, 0.25)",
            minWidth: "160px",
            height: "48px",
            "&:hover": {
              background: "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
              boxShadow: "0 6px 16px rgba(255, 152, 0, 0.35)",
              transform: "translateY(-1px)",
            },
          }}
          disableElevation
        >
          Create Institute
        </Button>
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
            Overview
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

        {/* Stats Cards */}
        <Stack direction="row" gap="16px" flexWrap="wrap">
          <ModernStatCard
            icon={<Domain />}
            label="Total Institutes"
            value={instituteCount}
            color="#FF9800"
            bgColor="rgba(255, 152, 0, 0.08)"
            isLoading={isLoading}
          />
          <ModernStatCard
            icon={<Groups />}
            label="Active Batches"
            value={activeBatches}
            color="#2196F3"
            bgColor="rgba(33, 150, 243, 0.08)"
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
      minWidth: "220px",
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
