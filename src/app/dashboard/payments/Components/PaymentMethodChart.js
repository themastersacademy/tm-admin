"use client";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Box, Typography, Stack } from "@mui/material";
import { useMemo } from "react";

const COLORS = ["#2196F3", "#4CAF50", "#FF9800", "#E91E63", "#9C27B0"];

export default function PaymentMethodChart({ transactions }) {
  const data = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const methodCounts = transactions
      .filter((t) => t.status === "completed")
      .reduce((acc, t) => {
        const method = t.paymentDetails?.method || "unknown";
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      }, {});

    return Object.entries(methodCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [transactions]);

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
      <Typography variant="h6" fontWeight={700} mb={3}>
        Payment Methods
      </Typography>

      <Box height={300}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value) => (
                <span style={{ color: "#666", fontSize: "14px" }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
