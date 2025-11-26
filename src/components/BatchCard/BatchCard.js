import {
  ContentCopy,
  DateRange,
  Lock,
  LockOpen,
  People,
  School,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BatchCard({ batch, instituteID }) {
  const router = useRouter();
  const {
    id,
    title,
    batchCode,
    status,
    enrolledStudentCount = 0,
    capacity = 1,
    startDate,
    endDate,
  } = batch;

  const [copied, setCopied] = useState(false);

  const handleCopyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(batchCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isLocked = status === "LOCKED";
  const progress = Math.min((enrolledStudentCount / capacity) * 100, 100);

  return (
    <Card
      elevation={0}
      onClick={() => router.push(`/dashboard/institute/${instituteID}/${id}`)}
      sx={{
        width: "350px",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        transition: "all 0.2s ease-in-out",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.1)",
          borderColor: "var(--primary-color)",
        },
      }}
    >
      <Box sx={{ height: "100%", padding: "20px" }}>
        <Stack gap="16px">
          {/* Header */}
          <Stack
            flexDirection="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Avatar
              sx={{
                bgcolor: "var(--primary-color-acc-2)",
                color: "var(--primary-color)",
                width: 48,
                height: 48,
              }}
            >
              <School />
            </Avatar>
            <Chip
              icon={
                isLocked ? (
                  <Lock fontSize="small" />
                ) : (
                  <LockOpen fontSize="small" />
                )
              }
              label={status || "LOCKED"}
              size="small"
              sx={{
                backgroundColor: isLocked ? "#ffebee" : "#e8f5e9",
                color: isLocked ? "#c62828" : "#2e7d32",
                fontWeight: 600,
                fontSize: "11px",
                height: "24px",
                "& .MuiChip-icon": {
                  color: "inherit",
                },
              }}
            />
          </Stack>

          {/* Title and Code */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: "18px",
                color: "var(--text1)",
                mb: 0.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </Typography>
            <Stack flexDirection="row" alignItems="center" gap="8px">
              <Chip
                label={`Code: ${batchCode}`}
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: "4px",
                  height: "24px",
                  fontSize: "12px",
                  backgroundColor: "var(--bg-color)",
                  borderColor: "var(--border-color)",
                  color: "var(--text2)",
                }}
              />
              <Tooltip title={copied ? "Copied!" : "Copy Code"} arrow>
                <IconButton
                  size="small"
                  onClick={handleCopyCode}
                  onMouseDown={(e) => e.stopPropagation()}
                  sx={{ padding: "4px" }}
                >
                  <ContentCopy sx={{ fontSize: 14, color: "var(--text3)" }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          <Divider sx={{ borderStyle: "dashed" }} />

          {/* Progress */}
          <Box>
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              mb={0.5}
            >
              <Stack flexDirection="row" alignItems="center" gap="6px">
                <People sx={{ fontSize: 16, color: "var(--text3)" }} />
                <Typography
                  variant="body2"
                  sx={{ fontSize: "12px", color: "var(--text3)" }}
                >
                  Enrollment
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: "12px",
                  color: "var(--text2)",
                }}
              >
                {enrolledStudentCount} / {capacity}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "var(--bg-color)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "var(--primary-color)",
                  borderRadius: 3,
                },
              }}
            />
          </Box>

          {/* Dates */}
          <Stack
            flexDirection="row"
            alignItems="center"
            gap="8px"
            sx={{
              backgroundColor: "var(--bg-color)",
              padding: "8px 12px",
              borderRadius: "8px",
            }}
          >
            <DateRange sx={{ fontSize: 16, color: "var(--text3)" }} />
            <Typography
              variant="caption"
              sx={{ color: "var(--text2)", fontSize: "12px", fontWeight: 500 }}
            >
              {formatDate(startDate)} - {formatDate(endDate)}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}
