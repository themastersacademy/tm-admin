"use client";
import { Stack, Typography, Chip, Skeleton, Box } from "@mui/material";
import {
  Payments,
  CurrencyRupee,
  WorkspacePremium,
  LocalOffer,
  TrendingUp,
} from "@mui/icons-material";
import React from "react";

export default function PaymentsHeader({ stats = {}, loading = false }) {
  const {
    totalRevenue = 0,
    activePlans = 0,
    totalCoupons = 0,
    monthlyGrowth = 0,
  } = stats;

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
      {/* Left */}
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
          <Payments sx={{ fontSize: "20px", color: "var(--primary-color)" }} />
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
              Payments
            </Typography>
            {loading ? (
              <Skeleton width={50} height={22} />
            ) : (
              <Chip
                label={`₹${totalRevenue.toLocaleString("en-IN")}`}
                size="small"
                sx={{
                  backgroundColor: "var(--primary-color-acc-2)",
                  color: "var(--primary-color)",
                  fontWeight: 700,
                  fontSize: "11px",
                  height: "22px",
                  border: "1px solid rgba(24, 113, 99, 0.2)",
                }}
              />
            )}
          </Stack>
          <Stack direction="row" alignItems="center" gap="12px">
            <Typography sx={{ fontSize: "12px", color: "var(--text4)" }}>
              {activePlans} plans
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "var(--text4)" }}>
              {totalCoupons} coupons
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                color: monthlyGrowth >= 0 ? "#4CAF50" : "#f44336",
                fontWeight: 600,
              }}
            >
              {monthlyGrowth >= 0 ? "+" : ""}
              {monthlyGrowth}% this month
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
