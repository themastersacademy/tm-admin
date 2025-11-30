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
import { useState, useMemo } from "react";

export default function RevenueTrendChart({ transactions }) {
  const [timeRange, setTimeRange] = useState("30days");

  const data = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const now = new Date();
    const result = [];

    if (timeRange === "30days") {
      // Last 30 days
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
      // Last 12 months
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

  return (
    <Box
      sx={{
        backgroundColor: "var(--white)",
        borderRadius: "16px",
        border: "1px solid var(--border-color)",
        padding: "24px",
        height: "100%",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6" fontWeight={700}>
          Revenue Trend
        </Typography>
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          size="small"
          sx={{
            height: "36px",
            fontSize: "14px",
            borderRadius: "8px",
            backgroundColor: "var(--bg-color)",
            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
          }}
        >
          <MenuItem value="30days">Last 30 Days</MenuItem>
          <MenuItem value="12months">Last 12 Months</MenuItem>
        </Select>
      </Stack>

      <Box height={300}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2196F3" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#2196F3" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#eee"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#666" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#666" }}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              formatter={(value) => [`₹${value}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2196F3"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
