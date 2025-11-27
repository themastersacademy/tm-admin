import {
  ContentCopy,
  DateRange,
  Lock,
  LockOpen,
  People,
  School,
  ArrowForward,
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
        borderRadius: "16px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        background: "var(--white)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px -4px rgba(0, 0, 0, 0.08)",
          borderColor: "transparent",
        },
      }}
    >
      <Box sx={{ height: "100%", padding: "24px" }}>
        <Stack gap="20px">
          {/* Header */}
          <Stack
            flexDirection="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Avatar
              variant="rounded"
              sx={{
                background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
                color: "#1976D2",
                width: 52,
                height: 52,
                borderRadius: "12px",
                border: "1px solid rgba(33, 150, 243, 0.1)",
              }}
            >
              <School sx={{ fontSize: "26px" }} />
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
                backgroundColor: isLocked ? "#FFEBEE" : "#E8F5E9",
                color: isLocked ? "#C62828" : "#2E7D32",
                fontWeight: 700,
                fontSize: "11px",
                height: "26px",
                borderRadius: "6px",
                border: "1px solid",
                borderColor: isLocked
                  ? "rgba(198, 40, 40, 0.1)"
                  : "rgba(46, 125, 50, 0.1)",
                "& .MuiChip-icon": {
                  color: "inherit",
                  fontSize: "16px",
                },
              }}
            />
          </Stack>

          {/* Title and Code */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: "18px",
                color: "var(--text1)",
                mb: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontFamily: "Lato",
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
                  borderRadius: "6px",
                  height: "24px",
                  fontSize: "12px",
                  fontWeight: 600,
                  backgroundColor: "var(--bg-color)",
                  borderColor: "var(--border-color)",
                  color: "var(--text2)",
                  fontFamily: "monospace",
                }}
              />
              <Tooltip title={copied ? "Copied!" : "Copy Code"} arrow>
                <IconButton
                  size="small"
                  onClick={handleCopyCode}
                  onMouseDown={(e) => e.stopPropagation()}
                  sx={{
                    padding: "4px",
                    color: copied ? "var(--success-color)" : "var(--text3)",
                    transition: "all 0.2s",
                    "&:hover": {
                      color: "var(--primary-color)",
                      backgroundColor: "var(--primary-color-acc-1)",
                    },
                  }}
                >
                  <ContentCopy sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          <Divider
            sx={{ borderStyle: "dashed", borderColor: "var(--border-color)" }}
          />

          {/* Progress */}
          <Box>
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Stack flexDirection="row" alignItems="center" gap="6px">
                <People sx={{ fontSize: 16, color: "var(--text3)" }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "12px",
                    color: "var(--text3)",
                    fontWeight: 600,
                  }}
                >
                  Enrollment
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  fontSize: "12px",
                  color: "var(--text1)",
                }}
              >
                {enrolledStudentCount}{" "}
                <span style={{ color: "var(--text3)", fontWeight: 400 }}>
                  / {capacity}
                </span>
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "var(--bg-color)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor:
                    progress >= 100
                      ? "var(--error-color)"
                      : "var(--primary-color)",
                  borderRadius: 4,
                  background:
                    progress >= 100
                      ? undefined
                      : "linear-gradient(90deg, #2196F3 0%, #1976D2 100%)",
                },
              }}
            />
          </Box>

          {/* Dates */}
          <Stack
            flexDirection="row"
            alignItems="center"
            gap="10px"
            sx={{
              backgroundColor: "var(--bg-color)",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
            }}
          >
            <DateRange sx={{ fontSize: 16, color: "var(--text3)" }} />
            <Typography
              variant="caption"
              sx={{ color: "var(--text2)", fontSize: "12px", fontWeight: 600 }}
            >
              {formatDate(startDate)} - {formatDate(endDate)}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}
