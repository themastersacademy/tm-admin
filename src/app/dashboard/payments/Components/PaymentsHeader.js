"use client";
import { Stack, Typography, Skeleton, Box } from "@mui/material";
import {
  AccountBalanceWallet,
  Receipt,
  CheckCircle,
  ErrorOutline,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";

function StatCard({ icon, label, value, sub, color, loading }) {
  return (
    <Stack
      sx={{
        flex: 1,
        minWidth: "180px",
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        borderRadius: "14px",
        padding: "20px",
        gap: "12px",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: color,
          boxShadow: `0 4px 16px ${color}15`,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "10px",
            backgroundColor: `${color}12`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
        {sub && !loading && (
          <Stack direction="row" alignItems="center" gap="4px">
            {sub.startsWith("+") ? (
              <TrendingUp sx={{ fontSize: 14, color: "#4CAF50" }} />
            ) : sub.startsWith("-") ? (
              <TrendingDown sx={{ fontSize: 14, color: "#f44336" }} />
            ) : null}
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 700,
                color: sub.startsWith("-") ? "#f44336" : "#4CAF50",
              }}
            >
              {sub}
            </Typography>
          </Stack>
        )}
      </Stack>

      {loading ? (
        <>
          <Skeleton width={80} height={32} />
          <Skeleton width={60} height={16} />
        </>
      ) : (
        <>
          <Typography
            sx={{
              fontSize: "26px",
              fontWeight: 800,
              color: "var(--text1)",
              fontFamily: "Lato",
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text3)",
            }}
          >
            {label}
          </Typography>
        </>
      )}
    </Stack>
  );
}

export default function PaymentsHeader({ stats = {}, loading = false }) {
  const {
    totalRevenue = 0,
    activePlans = 0,
    totalCoupons = 0,
    monthlyGrowth = 0,
    totalTransactions = 0,
    completedCount = 0,
    failedCount = 0,
  } = stats;

  const successRate =
    totalTransactions > 0
      ? ((completedCount / totalTransactions) * 100).toFixed(0)
      : 0;

  return (
    <Stack
      direction="row"
      gap="16px"
      flexWrap="wrap"
    >
      <StatCard
        icon={
          <AccountBalanceWallet
            sx={{ fontSize: 20, color: "var(--primary-color)" }}
          />
        }
        label="Total Revenue"
        value={`₹${totalRevenue.toLocaleString("en-IN")}`}
        sub={
          monthlyGrowth !== 0
            ? `${monthlyGrowth >= 0 ? "+" : ""}${monthlyGrowth}% this month`
            : undefined
        }
        color="var(--primary-color)"
        loading={loading}
      />
      <StatCard
        icon={<Receipt sx={{ fontSize: 20, color: "#2196F3" }} />}
        label="Total Transactions"
        value={totalTransactions}
        sub={`${activePlans} plans · ${totalCoupons} coupons`}
        color="#2196F3"
        loading={loading}
      />
      <StatCard
        icon={<CheckCircle sx={{ fontSize: 20, color: "#4CAF50" }} />}
        label="Success Rate"
        value={`${successRate}%`}
        sub={`${completedCount} completed`}
        color="#4CAF50"
        loading={loading}
      />
      <StatCard
        icon={<ErrorOutline sx={{ fontSize: 20, color: "#f44336" }} />}
        label="Failed"
        value={failedCount}
        color="#f44336"
        loading={loading}
      />
    </Stack>
  );
}
