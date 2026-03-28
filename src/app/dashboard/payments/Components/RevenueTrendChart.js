"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Box, Typography, Stack, Select, MenuItem } from "@mui/material";
import { TrendingUp } from "@mui/icons-material";
import { useState, useMemo } from "react";

export default function RevenueTrendChart({ transactions }) {
  const [timeRange, setTimeRange] = useState("30days");

  const data = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const now = new Date();
    const result = [];

    if (timeRange === "30days") {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];

        const dayRevenue = transactions
          .filter((t) => {
            const tDate = new Date(t.createdAt).toISOString().split("T")[0];
            return tDate === dateStr && t.status === "completed";
          })
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        result.push({
          name: d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          revenue: dayRevenue,
        });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const monthStr = `${d.getFullYear()}-${d.getMonth()}`;

        const monthRevenue = transactions
          .filter((t) => {
            const tDate = new Date(t.createdAt);
            return (
              `${tDate.getFullYear()}-${tDate.getMonth()}` === monthStr &&
              t.status === "completed"
            );
          })
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        result.push({
          name: d.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
          revenue: monthRevenue,
        });
      }
    }
    return result;
  }, [transactions, timeRange]);

  const hasRevenue = data.some((d) => d.revenue > 0);

  return (
    <Box
      sx={{
        backgroundColor: "var(--white)",
        borderRadius: "14px",
        border: "1px solid var(--border-color)",
        padding: "24px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Stack direction="row" alignItems="center" gap="10px">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              backgroundColor: "rgba(24, 113, 99, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrendingUp
              sx={{ fontSize: 18, color: "var(--primary-color)" }}
            />
          </Box>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--text1)",
            }}
          >
            Revenue Trend
          </Typography>
        </Stack>
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          size="small"
          sx={{
            height: "32px",
            fontSize: "13px",
            fontWeight: 600,
            borderRadius: "8px",
            color: "var(--text2)",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--border-color)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--primary-color)",
            },
          }}
        >
          <MenuItem value="30days">Last 30 Days</MenuItem>
          <MenuItem value="12months">Last 12 Months</MenuItem>
        </Select>
      </Stack>

      <Box flex={1} minHeight={0}>
        {!hasRevenue ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            height="100%"
            gap="8px"
          >
            <TrendingUp
              sx={{ fontSize: 48, color: "var(--border-color)" }}
            />
            <Typography
              sx={{ fontSize: "14px", color: "var(--text3)", fontWeight: 600 }}
            >
              No revenue data yet
            </Typography>
            <Typography
              sx={{ fontSize: "12px", color: "var(--text4)" }}
            >
              Completed transactions will appear here
            </Typography>
          </Stack>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--primary-color)"
                    stopOpacity={0.15}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary-color)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border-color)"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#999" }}
                dy={8}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#999" }}
                tickFormatter={(value) => `₹${value}`}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid var(--border-color)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
                formatter={(value) => [
                  `₹${value.toLocaleString("en-IN")}`,
                  "Revenue",
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--primary-color)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "var(--primary-color)",
                  stroke: "var(--white)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Box>
  );
}
