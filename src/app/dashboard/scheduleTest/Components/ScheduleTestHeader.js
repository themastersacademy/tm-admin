"use client";
import { Stack, Typography, Button, Chip } from "@mui/material";
import {
  Add,
  ExpandMore,
  Schedule,
  Quiz,
  CheckCircle,
  Cancel,
  Close,
} from "@mui/icons-material";
import SearchBox from "@/src/components/SearchBox/SearchBox";
import React from "react";

export default function ScheduleTestHeader({
  searchQuery,
  onSearchChange,
  statusFilter,
  onFilterClick,
  onCreateClick,
  filteredCount,
  totalCount,
  stats,
  onClearFilter,
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
            <Schedule
              sx={{ fontSize: "26px", color: "var(--primary-color)" }}
            />
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
                Schedule Test
              </Typography>
              <Chip
                label={`${filteredCount} ${
                  filteredCount === 1 ? "Exam" : "Exams"
                }`}
                size="small"
                sx={{
                  backgroundColor: "rgba(33, 150, 243, 0.1)",
                  color: "#1976D2",
                  fontWeight: 700,
                  fontSize: "11px",
                  height: "24px",
                  border: "1px solid rgba(33, 150, 243, 0.2)",
                }}
              />
            </Stack>
            <Typography
              sx={{ fontSize: "13px", color: "var(--text3)", lineHeight: 1.4 }}
            >
              Create, schedule, and monitor exams across all batches
            </Typography>
          </Stack>
        </Stack>

        {/* Right: Actions */}
        <Stack direction="row" gap="12px" alignItems="center">
          <Stack sx={{ position: "relative", width: "240px" }}>
            <SearchBox value={searchQuery} onChange={onSearchChange} />
            {searchQuery && (
              <Stack
                sx={{
                  position: "absolute",
                  right: "40px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "2px 8px",
                  backgroundColor: "#2196F3",
                  borderRadius: "10px",
                }}
              >
                <Typography
                  sx={{ fontSize: "10px", color: "#fff", fontWeight: 700 }}
                >
                  {filteredCount}
                </Typography>
              </Stack>
            )}
          </Stack>

          <Stack
            onClick={onFilterClick}
            sx={{
              border: `1.5px solid ${
                statusFilter !== "all" ? "#4CAF50" : "var(--border-color)"
              }`,
              borderRadius: "10px",
              backgroundColor:
                statusFilter !== "all"
                  ? "rgba(76, 175, 80, 0.08)"
                  : "var(--white)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              padding: "8px 12px",
              minWidth: "130px",
              height: "48px",
              "&:hover": {
                borderColor: "#4CAF50",
                backgroundColor: "rgba(76, 175, 80, 0.08)",
                transform: "translateY(-1px)",
                boxShadow: "0 2px 8px rgba(76, 175, 80, 0.15)",
              },
            }}
          >
            <Stack direction="row" alignItems="center" gap="8px">
              <Stack
                sx={{
                  width: "32px",
                  height: "32px",
                  backgroundColor:
                    statusFilter !== "all"
                      ? "rgba(76, 175, 80, 0.15)"
                      : "var(--bg-color)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ExpandMore
                  sx={{
                    fontSize: "18px",
                    color: statusFilter !== "all" ? "#4CAF50" : "var(--text2)",
                  }}
                />
              </Stack>
              <Stack flex={1}>
                <Typography
                  sx={{
                    fontSize: "10px",
                    color: "var(--text3)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Filter
                </Typography>
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: statusFilter !== "all" ? "#4CAF50" : "var(--text1)",
                    fontWeight: 700,
                  }}
                >
                  {statusFilter === "all"
                    ? "All"
                    : statusFilter.charAt(0).toUpperCase() +
                      statusFilter.slice(1)}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onCreateClick}
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
            Create Exam
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
          {statusFilter !== "all" && (
            <Stack
              direction="row"
              alignItems="center"
              gap="6px"
              padding="6px 12px"
              sx={{
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                borderRadius: "20px",
                border: "1px solid rgba(76, 175, 80, 0.3)",
              }}
            >
              <Typography
                sx={{ fontSize: "11px", color: "#4CAF50", fontWeight: 600 }}
              >
                Filtered: {filteredCount} of {totalCount}
              </Typography>
              <Close
                sx={{
                  fontSize: "14px",
                  color: "#4CAF50",
                  cursor: "pointer",
                }}
                onClick={onClearFilter}
              />
            </Stack>
          )}
        </Stack>

        {/*  Stats Cards */}
        <Stack direction="row" gap="16px" flexWrap="wrap">
          <ModernStatCard
            icon={<Quiz />}
            label="Total Exams"
            value={stats.total}
            color="#2196F3"
            bgColor="rgba(33, 150, 243, 0.08)"
            isLoading={isLoading}
          />
          <ModernStatCard
            icon={<CheckCircle />}
            label="Live Exams"
            value={stats.live}
            color="#4CAF50"
            bgColor="rgba(76, 175, 80, 0.08)"
            isLoading={isLoading}
          />
          <ModernStatCard
            icon={<Schedule />}
            label="Scheduled"
            value={stats.scheduled}
            color="#FF9800"
            bgColor="rgba(255, 152, 0, 0.08)"
            isLoading={isLoading}
          />
          <ModernStatCard
            icon={<Cancel />}
            label="Ended"
            value={stats.ended}
            color="#F44336"
            bgColor="rgba(244, 67, 54, 0.08)"
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
