"use client";
import { Stack, Typography, Chip } from "@mui/material";
import {
  Quiz,
  SignalCellularAlt1Bar,
  SignalCellularAlt2Bar,
  SignalCellularAlt,
} from "@mui/icons-material";

export default function QuestionsHeader({
  stats = {},
  actions,
  totalCount = 0,
}) {
  const { totalQuestions = 0, difficultyCounts = { 1: 0, 2: 0, 3: 0 } } = stats;

  return (
    <Stack
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {/* Top Bar */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        padding="12px 16px"
        sx={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <Stack direction="row" alignItems="center" gap="10px">
          <Stack
            sx={{
              width: "32px",
              height: "32px",
              backgroundColor: "rgba(24, 113, 99, 0.08)",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Quiz sx={{ fontSize: "17px", color: "var(--primary-color)" }} />
          </Stack>
          <Typography
            sx={{ fontSize: "15px", fontWeight: 700, color: "var(--text1)" }}
          >
            Question Bank
          </Typography>
          <Chip
            label={`${totalCount} ${totalCount === 1 ? "Question" : "Questions"}`}
            size="small"
            sx={{
              backgroundColor: "rgba(24, 113, 99, 0.08)",
              color: "var(--primary-color)",
              fontWeight: 700,
              fontSize: "11px",
              height: "22px",
              borderRadius: "6px",
            }}
          />
        </Stack>

        <Stack direction="row" gap="8px" alignItems="center">
          {actions}
        </Stack>
      </Stack>

      {/* Stats Row */}
      <Stack direction="row" gap="12px" padding="12px 16px" flexWrap="wrap">
        <StatChip
          icon={<Quiz sx={{ fontSize: "14px" }} />}
          label="Total"
          value={totalQuestions}
          color="var(--primary-color)"
        />
        <StatChip
          icon={<SignalCellularAlt1Bar sx={{ fontSize: "14px" }} />}
          label="Easy"
          value={difficultyCounts[1] || 0}
          color="#4CAF50"
        />
        <StatChip
          icon={<SignalCellularAlt2Bar sx={{ fontSize: "14px" }} />}
          label="Medium"
          value={difficultyCounts[2] || 0}
          color="#FF9800"
        />
        <StatChip
          icon={<SignalCellularAlt sx={{ fontSize: "14px" }} />}
          label="Hard"
          value={difficultyCounts[3] || 0}
          color="#F44336"
        />
      </Stack>
    </Stack>
  );
}

const StatChip = ({ icon, label, value, color }) => (
  <Stack
    direction="row"
    alignItems="center"
    gap="8px"
    sx={{
      padding: "8px 14px",
      backgroundColor: "var(--bg-color)",
      borderRadius: "8px",
      border: "1px solid var(--border-color)",
      flex: 1,
      minWidth: "140px",
    }}
  >
    <Stack
      sx={{
        width: "28px",
        height: "28px",
        backgroundColor: "var(--white)",
        borderRadius: "6px",
        justifyContent: "center",
        alignItems: "center",
        color,
        flexShrink: 0,
      }}
    >
      {icon}
    </Stack>
    <Stack>
      <Typography
        sx={{ fontSize: "10px", color: "var(--text4)", fontWeight: 600 }}
      >
        {label}
      </Typography>
      <Typography
        sx={{ fontSize: "16px", fontWeight: 800, color, lineHeight: 1.2 }}
      >
        {value?.toLocaleString?.("en-IN") || value}
      </Typography>
    </Stack>
  </Stack>
);
