"use client";
import {
  Card,
  Stack,
  Typography,
  Chip,
  Box,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  Schedule,
  Quiz,
  Timer,
  Grading,
  Edit,
  Visibility,
  CheckCircle,
  Cancel,
  Close,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ScheduledExamCard({ exam, onClick }) {
  const router = useRouter();
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const {
    id,
    title,
    isLive,
    startTimeStamp,
    duration,
    totalQuestions,
    totalMarks,
    isLifeTime,
    endTimeStamp,
    batchList,
    batchMeta,
  } = exam;

  // Color themes for variety
  const colorThemes = [
    { main: "#187163", light: "#e0f2f0", icon: "#187163" }, // Primary Green
    { main: "#1976d2", light: "#e3f2fd", icon: "#1565c0" }, // Blue
    { main: "#7b1fa2", light: "#f3e5f5", icon: "#6a1b9a" }, // Purple
    { main: "#d32f2f", light: "#ffebee", icon: "#c62828" }, // Red
    { main: "#ed6c02", light: "#fff4e5", icon: "#e65100" }, // Orange
    { main: "#0288d1", light: "#e1f5fe", icon: "#01579b" }, // Cyan
  ];

  // Select color based on exam ID hash
  const getColorTheme = () => {
    if (!id) return colorThemes[0];
    const hash = id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colorThemes[hash % colorThemes.length];
  };

  const colorTheme = getColorTheme();

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "Not Set";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "Not Set";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const isUpcoming = startTimeStamp && startTimeStamp > Date.now();
  const isEnded = !isLifeTime && endTimeStamp && endTimeStamp < Date.now();
  const isOngoing = isLive && !isEnded;

  const getStatusColor = () => {
    if (isOngoing) return { bg: "#e8f5e9", text: "#2e7d32" };
    if (isEnded) return { bg: "#ffebee", text: "#c62828" };
    if (isUpcoming) return { bg: "#e3f2fd", text: "#1565c0" };
    return { bg: "#f5f5f5", text: "#757575" };
  };

  const getStatusLabel = () => {
    if (isOngoing) return "Live";
    if (isEnded) return "Ended";
    if (isUpcoming) return "Scheduled";
    return "Draft";
  };

  const statusColor = getStatusColor();

  return (
    <>
      <Card
        elevation={0}
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
        onClick={() => {
          if (onClick) {
            onClick();
          } else {
            router.push(`/dashboard/scheduleTest/${id}`);
          }
        }}
      >
        <Box sx={{ padding: "20px" }}>
          <Stack gap="16px">
            {/* Header */}
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Stack
                sx={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: colorTheme.light,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Quiz sx={{ color: colorTheme.icon, fontSize: 24 }} />
              </Stack>
              <Stack direction="row" gap="6px">
                {batchList && batchList.length > 0 && (
                  <Chip
                    label={`${batchList.length} ${
                      batchList.length === 1 ? "Batch" : "Batches"
                    }`}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowBatchDialog(true);
                    }}
                    sx={{
                      backgroundColor: colorTheme.light,
                      color: colorTheme.main,
                      fontWeight: 700,
                      fontSize: "11px",
                      height: "24px",
                      border: `1px solid ${colorTheme.main}`,
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: colorTheme.main,
                        color: "#fff",
                      },
                    }}
                  />
                )}
                <Chip
                  icon={
                    isOngoing ? (
                      <CheckCircle fontSize="small" />
                    ) : isEnded ? (
                      <Cancel fontSize="small" />
                    ) : isUpcoming ? (
                      <Schedule fontSize="small" />
                    ) : null
                  }
                  label={getStatusLabel()}
                  size="small"
                  sx={{
                    backgroundColor: statusColor.bg,
                    color: statusColor.text,
                    fontWeight: 600,
                    fontSize: "11px",
                    height: "24px",
                    "& .MuiChip-icon": {
                      color: "inherit",
                    },
                  }}
                />
              </Stack>
            </Stack>

            {/* Title */}
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
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  minHeight: "48px",
                }}
              >
                {title || "Untitled Exam"}
              </Typography>
            </Box>

            <Divider sx={{ borderStyle: "dashed" }} />

            {/* Exam Details */}
            <Stack gap="12px">
              {/* Start Time */}
              <Stack
                flexDirection="row"
                alignItems="center"
                gap="8px"
                justifyContent="space-between"
              >
                <Stack flexDirection="row" alignItems="center" gap="8px">
                  <Schedule sx={{ fontSize: 18, color: "var(--text3)" }} />
                  <Typography
                    variant="body2"
                    color="var(--text3)"
                    fontSize="12px"
                  >
                    Start Time
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
                  {formatDateTime(startTimeStamp)}
                </Typography>
              </Stack>

              {/* Duration & Marks */}
              <Stack
                flexDirection="row"
                alignItems="center"
                gap="16px"
                sx={{
                  backgroundColor: colorTheme.light,
                  padding: "10px 12px",
                  borderRadius: "8px",
                }}
              >
                <Stack
                  flexDirection="row"
                  alignItems="center"
                  gap="6px"
                  flex={1}
                >
                  <Timer sx={{ fontSize: 18, color: colorTheme.icon }} />
                  <Stack>
                    <Typography
                      variant="caption"
                      color="var(--text3)"
                      fontSize="10px"
                    >
                      Duration
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="600"
                      fontSize="13px"
                      color="var(--text1)"
                    >
                      {formatDuration(duration)}
                    </Typography>
                  </Stack>
                </Stack>
                <Divider orientation="vertical" flexItem />
                <Stack
                  flexDirection="row"
                  alignItems="center"
                  gap="6px"
                  flex={1}
                >
                  <Grading sx={{ fontSize: 18, color: colorTheme.icon }} />
                  <Stack>
                    <Typography
                      variant="caption"
                      color="var(--text3)"
                      fontSize="10px"
                    >
                      Marks
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="600"
                      fontSize="13px"
                      color="var(--text1)"
                    >
                      {totalMarks || 0}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>

              {/* Questions Count */}
              <Stack
                flexDirection="row"
                alignItems="center"
                gap="8px"
                justifyContent="space-between"
              >
                <Stack flexDirection="row" alignItems="center" gap="8px">
                  <Quiz sx={{ fontSize: 18, color: "var(--text3)" }} />
                  <Typography
                    variant="body2"
                    color="var(--text3)"
                    fontSize="12px"
                  >
                    Questions
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
                  {totalQuestions || 0}
                </Typography>
              </Stack>
            </Stack>

            {/* Action Buttons */}
            <Stack
              flexDirection="row"
              gap="8px"
              pt="8px"
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip title="View Details" arrow>
                <IconButton
                  size="small"
                  onClick={() => router.push(`/dashboard/scheduleTest/${id}`)}
                  sx={{
                    flex: 1,
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    color: "var(--primary-color)",
                    "&:hover": {
                      backgroundColor: "var(--primary-color-acc-2)",
                      borderColor: "var(--primary-color)",
                    },
                  }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit Exam" arrow>
                <IconButton
                  size="small"
                  onClick={() => router.push(`/dashboard/scheduleTest/${id}`)}
                  sx={{
                    flex: 1,
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    color: "var(--text2)",
                    "&:hover": {
                      backgroundColor: "var(--bg-color)",
                      borderColor: "var(--primary-color)",
                      color: "var(--primary-color)",
                    },
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>
      </Card>

      {/* Batch List Dialog */}
      <Dialog
        open={showBatchDialog}
        onClose={() => setShowBatchDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "12px",
          }}
        >
          <Typography variant="h6" fontWeight="700">
            Scheduled Batches
          </Typography>
          <IconButton
            onClick={() => setShowBatchDialog(false)}
            size="small"
            sx={{ borderRadius: "8px" }}
          >
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <List sx={{ padding: 0 }}>
            {batchMeta && batchMeta.length > 0 ? (
              batchMeta.map((batch, index) => (
                <ListItem
                  key={batch.id}
                  sx={{
                    borderRadius: "8px",
                    marginBottom: index < batchMeta.length - 1 ? "8px" : 0,
                    backgroundColor: "var(--bg-color)",
                    "&:hover": {
                      backgroundColor: colorTheme.light,
                    },
                  }}
                >
                  <ListItemText
                    primary={batch.title}
                    secondary={`ID: ${batch.id.slice(0, 8)}...`}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                    secondaryTypographyProps={{
                      fontSize: "12px",
                    }}
                  />
                </ListItem>
              ))
            ) : (
              <Typography
                color="var(--text3)"
                textAlign="center"
                padding="20px"
              >
                No batches scheduled
              </Typography>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
}
