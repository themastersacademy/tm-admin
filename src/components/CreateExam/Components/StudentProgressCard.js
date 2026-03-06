"use client";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Person as PersonIcon, Send as SendIcon } from "@mui/icons-material";

export default function StudentProgressCard({
  index = 0,
  name,
  email,
  image,
  year,
  college,
  rollNo,
  tag,
  time,
  status,
  percent,
  marks,
  onClick,
  onForceSubmit,
  isForceSubmitting,
}) {
  const percentageValue = parseInt(percent) || 0;

  const getScoreColor = (score) => {
    if (score >= 80) return "#4caf50";
    if (score >= 50) return "#ff9800";
    return "#f44336";
  };

  const scoreColor = status === "COMPLETED" ? getScoreColor(percentageValue) : "var(--text4)";
  const isEven = index % 2 === 0;

  const statusConfig = {
    COMPLETED: { label: "Completed", bg: "rgba(76, 175, 80, 0.08)", color: "#4caf50" },
    IN_PROGRESS: { label: "In Progress", bg: "rgba(33, 150, 243, 0.08)", color: "#2196f3" },
    NOT_ATTENDED: { label: "Absent", bg: "rgba(158, 158, 158, 0.08)", color: "#9e9e9e" },
  };

  const sc = statusConfig[status] || statusConfig.NOT_ATTENDED;

  return (
    <Stack
      onClick={onClick}
      flexDirection="row"
      alignItems="center"
      sx={{
        width: "100%",
        backgroundColor: isEven ? "var(--white)" : "var(--bg-color, #fafafa)",
        borderRadius: "6px",
        padding: "7px 12px",
        cursor: "pointer",
        transition: "all 0.15s ease",
        gap: "12px",
        borderLeft: status === "COMPLETED"
          ? `3px solid ${scoreColor}`
          : status === "IN_PROGRESS"
            ? "3px solid #2196f3"
            : "3px solid transparent",
        "&:hover": {
          backgroundColor: "rgba(24, 113, 99, 0.04)",
        },
      }}
    >
      {/* # */}
      <Typography
        sx={{
          fontSize: "11px",
          fontWeight: 600,
          color: "var(--text4)",
          minWidth: "24px",
          textAlign: "center",
        }}
      >
        {index + 1}
      </Typography>

      {/* Avatar + Name */}
      <Stack flexDirection="row" alignItems="center" gap="8px" sx={{ minWidth: "180px", flex: 1 }}>
        <Avatar
          src={image}
          sx={{
            width: 30,
            height: 30,
            borderRadius: "8px",
            backgroundColor: "var(--primary-color-acc-2)",
            color: "var(--primary-color)",
            fontSize: "13px",
          }}
        >
          {!image && <PersonIcon sx={{ fontSize: "16px" }} />}
        </Avatar>
        <Stack sx={{ minWidth: 0 }}>
          <Typography
            title={name}
            sx={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text1)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "150px",
            }}
          >
            {name}
          </Typography>
          <Typography
            sx={{
              fontSize: "10px",
              color: "var(--text4)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "150px",
            }}
          >
            {email}
          </Typography>
        </Stack>
      </Stack>

      {/* College + Batch */}
      <Stack sx={{ flex: 0.8, minWidth: 0, display: { xs: "none", md: "flex" } }}>
        <Typography
          title={college}
          sx={{
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--text2)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {college || "-"}
        </Typography>
        <Typography sx={{ fontSize: "10px", color: "var(--text4)" }}>
          {year || "-"}
        </Typography>
      </Stack>

      {/* Roll No */}
      <Typography
        sx={{
          fontSize: "11px",
          fontWeight: 600,
          color: "var(--text2)",
          minWidth: "70px",
          textAlign: "center",
          display: { xs: "none", lg: "block" },
        }}
      >
        {rollNo || "-"}
      </Typography>

      {/* Date */}
      <Typography
        sx={{
          fontSize: "10px",
          color: "var(--text4)",
          minWidth: "65px",
          textAlign: "center",
          display: { xs: "none", lg: "block" },
        }}
      >
        {time}
      </Typography>

      {/* Marks + Score Bar */}
      <Stack alignItems="flex-end" sx={{ minWidth: "90px" }}>
        {status === "COMPLETED" ? (
          <Stack gap="3px" width="100%" alignItems="flex-end">
            <Stack direction="row" alignItems="baseline" gap="4px">
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: scoreColor }}>
                {marks}
              </Typography>
              <Typography sx={{ fontSize: "10px", fontWeight: 600, color: scoreColor }}>
                {percent}
              </Typography>
            </Stack>
            <Box sx={{ width: "100%", height: 3, borderRadius: 2, backgroundColor: "#f0f0f0", overflow: "hidden" }}>
              <Box
                sx={{
                  height: "100%",
                  width: `${percentageValue}%`,
                  backgroundColor: scoreColor,
                  borderRadius: 2,
                  transition: "width 0.5s ease",
                }}
              />
            </Box>
          </Stack>
        ) : (
          <Typography sx={{ fontSize: "11px", color: "var(--text4)" }}>--</Typography>
        )}
      </Stack>

      {/* Status + Action */}
      <Stack direction="row" alignItems="center" gap="4px" sx={{ minWidth: onForceSubmit ? "110px" : "72px" }}>
        <Chip
          label={sc.label}
          size="small"
          sx={{
            height: "20px",
            fontSize: "10px",
            fontWeight: 600,
            backgroundColor: sc.bg,
            color: sc.color,
            border: `1px solid ${sc.color}30`,
            minWidth: "72px",
            "& .MuiChip-label": { padding: "0 8px" },
          }}
        />
        {onForceSubmit && (
          <Tooltip title="Force submit this attempt" arrow>
            <Box
              onClick={isForceSubmitting ? undefined : onForceSubmit}
              sx={{
                width: 24, height: 24,
                borderRadius: "6px",
                display: "flex", alignItems: "center", justifyContent: "center",
                backgroundColor: "#ff980015",
                border: "1px solid #ff980030",
                cursor: isForceSubmitting ? "default" : "pointer",
                flexShrink: 0,
                "&:hover": { backgroundColor: isForceSubmitting ? "#ff980015" : "#ff980025" },
              }}
            >
              {isForceSubmitting ? (
                <CircularProgress size={12} sx={{ color: "#ff9800" }} />
              ) : (
                <SendIcon sx={{ fontSize: "12px", color: "#ff9800" }} />
              )}
            </Box>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
}
