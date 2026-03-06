"use client";
import {
  Card,
  CardActionArea,
  Stack,
  Typography,
  Chip,
  Box,
  IconButton,
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
  CheckCircle,
  Cancel,
  Close,
  Groups,
  East,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ScheduledExamCard({
  exam,
  onClick,
  viewPath,
  editPath,
}) {
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
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const isUpcoming = startTimeStamp && startTimeStamp > Date.now();
  const isEnded = !isLifeTime && endTimeStamp && endTimeStamp < Date.now();
  const isOngoing = isLive && !isEnded;

  const getStatus = () => {
    if (isOngoing)
      return {
        label: "Live",
        color: "#2e7d32",
        bg: "#e8f5e9",
        icon: <CheckCircle sx={{ fontSize: "14px" }} />,
      };
    if (isEnded)
      return {
        label: "Ended",
        color: "#c62828",
        bg: "#ffebee",
        icon: <Cancel sx={{ fontSize: "14px" }} />,
      };
    if (isUpcoming)
      return {
        label: "Scheduled",
        color: "#1565c0",
        bg: "#e3f2fd",
        icon: <Schedule sx={{ fontSize: "14px" }} />,
      };
    return { label: "Draft", color: "#757575", bg: "#f5f5f5", icon: null };
  };

  const status = getStatus();

  const handleNavigate = () => {
    if (onClick) onClick();
    else if (viewPath) router.push(viewPath);
    else router.push(`/dashboard/scheduleTest/${id}`);
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          width: "100%",
          border: "1px solid var(--border-color)",
          borderRadius: "14px",
          overflow: "hidden",
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 8px 24px -8px rgba(0,0,0,0.12)",
            borderColor: "var(--primary-color)",
          },
        }}
      >
        <CardActionArea onClick={handleNavigate} sx={{ padding: "18px" }}>
          <Stack gap="14px">
            {/* Top: Status + Batch chips */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Chip
                icon={status.icon}
                label={status.label}
                size="small"
                sx={{
                  height: "24px",
                  backgroundColor: status.bg,
                  color: status.color,
                  fontWeight: 600,
                  fontSize: "11px",
                  "& .MuiChip-icon": { color: "inherit" },
                }}
              />
              {batchList && batchList.length > 0 && (
                <Chip
                  icon={<Groups sx={{ fontSize: "14px !important" }} />}
                  label={`${batchList.length} ${batchList.length === 1 ? "Batch" : "Batches"}`}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBatchDialog(true);
                  }}
                  sx={{
                    height: "24px",
                    backgroundColor: "rgba(24, 113, 99, 0.08)",
                    color: "var(--primary-color)",
                    fontWeight: 600,
                    fontSize: "11px",
                    border: "1px solid rgba(24, 113, 99, 0.2)",
                    "& .MuiChip-icon": { color: "var(--primary-color)" },
                    "&:hover": {
                      backgroundColor: "var(--primary-color)",
                      color: "#fff",
                      "& .MuiChip-icon": { color: "#fff" },
                    },
                  }}
                />
              )}
            </Stack>

            {/* Title + Icon row */}
            <Stack direction="row" alignItems="flex-start" gap="12px">
              <Stack
                sx={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(24, 113, 99, 0.08)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <Quiz sx={{ color: "var(--primary-color)", fontSize: 22 }} />
              </Stack>
              <Stack flex={1} minWidth={0}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "15px",
                    color: "var(--text1)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    lineHeight: 1.4,
                    minHeight: "21px",
                  }}
                >
                  {title || "Untitled Exam"}
                </Typography>
                {startTimeStamp && (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "var(--text3)",
                      mt: "4px",
                    }}
                  >
                    {formatDateTime(startTimeStamp)}
                  </Typography>
                )}
              </Stack>
            </Stack>

            {/* Stats row */}
            <Stack
              direction="row"
              sx={{
                backgroundColor: "var(--bg-color)",
                borderRadius: "10px",
                padding: "10px 14px",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                gap="6px"
                flex={1}
                justifyContent="center"
              >
                <Timer sx={{ fontSize: 16, color: "var(--text3)" }} />
                <Stack>
                  <Typography
                    sx={{
                      fontSize: "10px",
                      color: "var(--text3)",
                      lineHeight: 1.2,
                    }}
                  >
                    Duration
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--text1)",
                      lineHeight: 1.3,
                    }}
                  >
                    {formatDuration(duration)}
                  </Typography>
                </Stack>
              </Stack>
              <Box
                sx={{ width: "1px", backgroundColor: "var(--border-color)" }}
              />
              <Stack
                direction="row"
                alignItems="center"
                gap="6px"
                flex={1}
                justifyContent="center"
              >
                <Grading sx={{ fontSize: 16, color: "var(--text3)" }} />
                <Stack>
                  <Typography
                    sx={{
                      fontSize: "10px",
                      color: "var(--text3)",
                      lineHeight: 1.2,
                    }}
                  >
                    Marks
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--text1)",
                      lineHeight: 1.3,
                    }}
                  >
                    {totalMarks || 0}
                  </Typography>
                </Stack>
              </Stack>
              <Box
                sx={{ width: "1px", backgroundColor: "var(--border-color)" }}
              />
              <Stack
                direction="row"
                alignItems="center"
                gap="6px"
                flex={1}
                justifyContent="center"
              >
                <Quiz sx={{ fontSize: 16, color: "var(--text3)" }} />
                <Stack>
                  <Typography
                    sx={{
                      fontSize: "10px",
                      color: "var(--text3)",
                      lineHeight: 1.2,
                    }}
                  >
                    Questions
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--text1)",
                      lineHeight: 1.3,
                    }}
                  >
                    {totalQuestions || 0}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            {/* Bottom: End time + View button */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              {endTimeStamp ? (
                <Typography sx={{ fontSize: "11px", color: "var(--text3)" }}>
                  Ends: {formatDateTime(endTimeStamp)}
                </Typography>
              ) : (
                <Box />
              )}
              <Stack
                direction="row"
                alignItems="center"
                gap="4px"
                sx={{
                  color: "var(--primary-color)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--primary-color)",
                  }}
                >
                  View Details
                </Typography>
                <East sx={{ fontSize: 14 }} />
              </Stack>
            </Stack>
          </Stack>
        </CardActionArea>
      </Card>

      {/* Batch List Dialog */}
      <Dialog
        open={showBatchDialog}
        onClose={() => setShowBatchDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: "12px",
          }}
        >
          <Typography variant="h6" fontWeight="700" fontSize="16px">
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
                    marginBottom: index < batchMeta.length - 1 ? "6px" : 0,
                    backgroundColor: "var(--bg-color)",
                    "&:hover": {
                      backgroundColor: "rgba(24, 113, 99, 0.06)",
                    },
                  }}
                >
                  <ListItemText
                    primary={batch.title}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                  />
                </ListItem>
              ))
            ) : batchList && batchList.length > 0 ? (
              batchList.map((batchId, index) => (
                <ListItem
                  key={batchId}
                  sx={{
                    borderRadius: "8px",
                    marginBottom: index < batchList.length - 1 ? "6px" : 0,
                    backgroundColor: "var(--bg-color)",
                  }}
                >
                  <ListItemText
                    primary={`Batch ${index + 1}`}
                    secondary={batchId}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                    secondaryTypographyProps={{
                      fontSize: "11px",
                      color: "var(--text3)",
                    }}
                  />
                </ListItem>
              ))
            ) : (
              <Typography
                color="var(--text3)"
                textAlign="center"
                padding="20px"
                fontSize="14px"
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
