"use client";
import { Stack, Typography, Button, Chip } from "@mui/material";
import {
  Add,
  FilterAlt,
  Group,
  VerifiedUser,
  CheckCircle,
  Close,
} from "@mui/icons-material";
import SearchBox from "@/src/components/SearchBox/SearchBox";
import React from "react";

export default function StudentsHeader({
  searchQuery,
  onSearchChange,
  onFilterClick,
  onAddClick,
  stats,
  isLoading,
  hasActiveFilters,
  onClearFilters,
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
                "linear-gradient(135deg, rgba(76, 175, 80, 0.12) 0%, rgba(76, 175, 80, 0.06) 100%)",
              borderRadius: "14px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "1.5px solid rgba(76, 175, 80, 0.25)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Group sx={{ fontSize: "26px", color: "#4CAF50" }} />
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
                Students
              </Typography>
              <Chip
                label={`${stats.total || 0} Total`}
                size="small"
                sx={{
                  backgroundColor: "rgba(76, 175, 80, 0.1)",
                  color: "#4CAF50",
                  fontWeight: 700,
                  fontSize: "11px",
                  height: "24px",
                  border: "1px solid rgba(76, 175, 80, 0.2)",
                }}
              />
            </Stack>
            <Typography
              sx={{ fontSize: "13px", color: "var(--text3)", lineHeight: 1.4 }}
            >
              Manage student accounts, verify identities, and monitor activity
            </Typography>
          </Stack>
        </Stack>

        {/* Right: Actions */}
        <Stack direction="row" gap="12px" alignItems="center">
          <Stack sx={{ position: "relative", width: "240px" }}>
            <SearchBox value={searchQuery} onChange={onSearchChange} />
          </Stack>

          <Stack
            onClick={onFilterClick}
            sx={{
              border: `1.5px solid ${
                hasActiveFilters ? "#2196F3" : "var(--border-color)"
              }`,
              borderRadius: "10px",
              backgroundColor: hasActiveFilters
                ? "rgba(33, 150, 243, 0.08)"
                : "var(--white)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              padding: "8px 12px",
              minWidth: "100px",
              height: "48px",
              "&:hover": {
                borderColor: "#2196F3",
                backgroundColor: "rgba(33, 150, 243, 0.08)",
                transform: "translateY(-1px)",
                boxShadow: "0 2px 8px rgba(33, 150, 243, 0.15)",
              },
            }}
          >
            <Stack direction="row" alignItems="center" gap="8px">
              <Stack
                sx={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: hasActiveFilters
                    ? "rgba(33, 150, 243, 0.15)"
                    : "var(--bg-color)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FilterAlt
                  sx={{
                    fontSize: "18px",
                    color: hasActiveFilters ? "#2196F3" : "var(--text2)",
                  }}
                />
              </Stack>
              <Typography
                sx={{
                  fontSize: "13px",
                  color: hasActiveFilters ? "#2196F3" : "var(--text1)",
                  fontWeight: 700,
                }}
              >
                Filter
              </Typography>
            </Stack>
          </Stack>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAddClick}
            sx={{
              background: "linear-gradient(135deg, #4CAF50 0%, #45A049 100%)",
              color: "#FFFFFF",
              textTransform: "none",
              borderRadius: "10px",
              padding: "10px 24px",
              fontWeight: 700,
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(76, 175, 80, 0.25)",
              minWidth: "140px",
              height: "48px",
              "&:hover": {
                background: "linear-gradient(135deg, #45A049 0%, #3D8B40 100%)",
                boxShadow: "0 6px 16px rgba(76, 175, 80, 0.35)",
                transform: "translateY(-1px)",
              },
            }}
            disableElevation
          >
            Add Student
          </Button>
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
              Student Overview
            </Typography>
            <Stack
              sx={{
                width: "32px",
                height: "2px",
                background:
                  "linear-gradient(90deg, #4CAF50 0%, transparent 100%)",
              }}
            />
          </Stack>
          {hasActiveFilters && (
            <Stack
              direction="row"
              alignItems="center"
              gap="6px"
              padding="6px 12px"
              sx={{
                backgroundColor: "rgba(33, 150, 243, 0.1)",
                borderRadius: "20px",
                border: "1px solid rgba(33, 150, 243, 0.3)",
              }}
            >
              <Typography
                sx={{ fontSize: "11px", color: "#2196F3", fontWeight: 600 }}
              >
                Filters Active
              </Typography>
              <Close
                sx={{
                  fontSize: "14px",
                  color: "#2196F3",
                  cursor: "pointer",
                }}
                onClick={onClearFilters}
              />
            </Stack>
          )}
        </Stack>

        {/* Stats Cards */}
        <Stack direction="row" gap="16px" flexWrap="wrap">
          <ModernStatCard
            icon={<Group />}
            label="Total Students"
            value={stats.total}
            color="#4CAF50"
            bgColor="rgba(76, 175, 80, 0.08)"
            isLoading={isLoading}
          />
          <ModernStatCard
            icon={<VerifiedUser />}
            label="Verified Students"
            value={stats.verified}
            color="#2196F3"
            bgColor="rgba(33, 150, 243, 0.08)"
            isLoading={isLoading}
          />
          <ModernStatCard
            icon={<CheckCircle />}
            label="Active Students"
            value={stats.active}
            color="#FF9800"
            bgColor="rgba(255, 152, 0, 0.08)"
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
