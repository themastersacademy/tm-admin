"use client";
import { Stack, Typography, Button, Chip, Box } from "@mui/material";
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
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "16px 20px",
      }}
    >
      {/* Left: Title & Stats */}
      <Stack direction="row" alignItems="center" gap="20px">
        <Stack direction="row" alignItems="center" gap="12px">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              backgroundColor: "var(--primary-color-acc-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(24, 113, 99, 0.15)",
              flexShrink: 0,
            }}
          >
            <Business sx={{ fontSize: "20px", color: "var(--primary-color)" }} />
          </Box>
          <Stack>
            <Stack direction="row" alignItems="center" gap="8px">
              <Typography
                sx={{
                  fontFamily: "Lato",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--text1)",
                }}
              >
                Institutes
              </Typography>
              <Chip
                label={instituteCount}
                size="small"
                sx={{
                  backgroundColor: "var(--primary-color-acc-2)",
                  color: "var(--primary-color)",
                  fontWeight: 700,
                  fontSize: "11px",
                  height: "22px",
                  minWidth: "28px",
                  border: "1px solid rgba(24, 113, 99, 0.2)",
                }}
              />
            </Stack>
            <Typography sx={{ fontSize: "12px", color: "var(--text4)" }}>
              {activeBatches} active batches
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      {/* Right: Action Button */}
      <Button
        variant="contained"
        startIcon={<Add sx={{ fontSize: "18px" }} />}
        onClick={onCreateClick}
        disableElevation
        sx={{
          backgroundColor: "var(--primary-color)",
          color: "#fff",
          textTransform: "none",
          borderRadius: "8px",
          padding: "8px 18px",
          fontWeight: 600,
          fontSize: "13px",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "var(--primary-color-dark)",
            boxShadow: "0 2px 8px rgba(24, 113, 99, 0.2)",
          },
        }}
      >
        Create Institute
      </Button>
    </Stack>
  );
}
