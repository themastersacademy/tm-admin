"use client";
import {
  Stack,
  Typography,
  Button,
  IconButton,
  Chip,
  Skeleton,
} from "@mui/material";
import { Add, ArrowBack, ClassOutlined, Groups } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import React from "react";

export default function InstituteDetailHeader({
  instituteName,
  instituteEmail,
  batchCount,
  onCreateBatch,
  isLoading,
}) {
  const router = useRouter();

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
        {/* Left: Back Button + Title */}
        <Stack direction="row" alignItems="center" gap="16px">
          <IconButton
            onClick={() => router.back()}
            sx={{
              width: "40px",
              height: "40px",
              border: "1.5px solid var(--border-color)",
              borderRadius: "10px",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "var(--primary-color)",
                borderColor: "var(--primary-color)",
                "& svg": {
                  color: "#fff",
                },
              },
            }}
          >
            <ArrowBack
              sx={{
                fontSize: "20px",
                color: "var(--text2)",
                transition: "color 0.2s",
              }}
            />
          </IconButton>

          <Stack
            sx={{
              width: "52px",
              height: "52px",
              background:
                "linear-gradient(135deg, rgba(255, 152, 0, 0.12) 0%, rgba(255, 152, 0, 0.06) 100%)",
              borderRadius: "14px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "1.5px solid rgba(255, 152, 0, 0.25)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <ClassOutlined sx={{ fontSize: "26px", color: "#FF9800" }} />
          </Stack>

          <Stack gap="6px">
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--text1)",
              }}
            >
              {instituteName || <Skeleton variant="text" width={150} />}
            </Typography>
            <Typography
              sx={{ fontSize: "13px", color: "var(--text3)", lineHeight: 1.4 }}
            >
              {instituteEmail || <Skeleton variant="text" width={200} />}
            </Typography>
          </Stack>
        </Stack>

        {/* Right: Action Button */}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onCreateBatch}
          sx={{
            background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
            color: "#FFFFFF",
            textTransform: "none",
            borderRadius: "10px",
            padding: "10px 24px",
            fontWeight: 700,
            fontSize: "14px",
            boxShadow: "0 4px 12px rgba(255, 152, 0, 0.25)",
            minWidth: "140px",
            height: "48px",
            "&:hover": {
              background: "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
              boxShadow: "0 6px 16px rgba(255, 152, 0, 0.35)",
              transform: "translateY(-1px)",
            },
          }}
          disableElevation
        >
          Create Batch
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
            Batch Overview
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

        <Stack direction="row" gap="16px" flexWrap="wrap">
          <ModernStatCard
            icon={<Groups />}
            label="Total Batches"
            value={batchCount}
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
