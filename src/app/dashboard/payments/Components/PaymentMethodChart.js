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
import { PieChartOutline } from "@mui/icons-material";
import { useMemo } from "react";

const COLORS = ["#187163", "#2196F3", "#FF9800", "#E91E63", "#9C27B0"];

const METHOD_LABELS = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
  wallet: "Wallet",
  emi: "EMI",
  unknown: "Other",
};

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
      name: METHOD_LABELS[name] || name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [transactions]);

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
      <Stack direction="row" alignItems="center" gap="10px" mb={2}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            backgroundColor: "rgba(33, 150, 243, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PieChartOutline sx={{ fontSize: 18, color: "#2196F3" }} />
        </Box>
        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--text1)",
          }}
        >
          Payment Methods
        </Typography>
      </Stack>

      <Box flex={1} minHeight={0}>
        {data.length === 0 ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            height="100%"
            gap="8px"
          >
            <PieChartOutline
              sx={{ fontSize: 48, color: "var(--border-color)" }}
            />
            <Typography
              sx={{ fontSize: "14px", color: "var(--text3)", fontWeight: 600 }}
            >
              No payment data yet
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "var(--text4)" }}>
              Method breakdown will appear after payments
            </Typography>
          </Stack>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
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
                  borderRadius: "10px",
                  border: "1px solid var(--border-color)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
                formatter={(value, name) => [
                  `${value} transaction${value > 1 ? "s" : ""}`,
                  name,
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span
                    style={{
                      color: "var(--text2)",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Box>
  );
}
