"use client";
import {
  Card,
  CardActionArea,
  Stack,
  Typography,
  Chip,
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
        border: "#2e7d3230",
        icon: <CheckCircle sx={{ fontSize: "12px" }} />,
      };
    if (isEnded)
      return {
        label: "Ended",
        color: "#c62828",
        bg: "#ffebee",
        border: "#c6282830",
        icon: <Cancel sx={{ fontSize: "12px" }} />,
      };
    if (isUpcoming)
      return {
        label: "Scheduled",
        color: "#1565c0",
        bg: "#e3f2fd",
        border: "#1565c030",
        icon: <Schedule sx={{ fontSize: "12px" }} />,
      };
    return {
      label: "Draft",
      color: "#757575",
      bg: "#f5f5f5",
      border: "#75757530",
      icon: null,
    };
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
          borderRadius: "10px",
          overflow: "hidden",
          transition: "all 0.15s ease",
          "&:hover": {
            borderColor: "var(--primary-color)",
          },
        }}
      >
        <CardActionArea onClick={handleNavigate} sx={{ padding: "14px 16px" }}>
          <Stack gap="10px">
            {/* Title row: Icon + Title + Status chip */}
            <Stack
              direction="row"
              alignItems="flex-start"
              gap="10px"
            >
              <Stack
                sx={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(24, 113, 99, 0.08)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid rgba(24, 113, 99, 0.15)",
                  flexShrink: 0,
                }}
              >
                <Quiz sx={{ color: "var(--primary-color)", fontSize: 18 }} />
              </Stack>
              <Stack flex={1} minWidth={0}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "var(--text1)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    lineHeight: 1.3,
                  }}
                >
                  {title || "Untitled Exam"}
                </Typography>
              </Stack>
              <Chip
                icon={status.icon}
                label={status.label}
                size="small"
                sx={{
                  height: "20px",
                  fontSize: "10px",
                  fontWeight: 700,
                  backgroundColor: status.bg,
                  color: status.color,
                  border: `1px solid ${status.border}`,
                  "& .MuiChip-icon": { color: "inherit" },
                  "& .MuiChip-label": { padding: "0 6px" },
                }}
              />
            </Stack>

            {/* Schedule dates */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" gap="5px">
                <Schedule sx={{ fontSize: "13px", color: "var(--text4)" }} />
                <Typography sx={{ fontSize: "11px", color: "var(--text4)" }}>
                  {startTimeStamp
                    ? formatDateTime(startTimeStamp)
                    : "No schedule set"}
                </Typography>
              </Stack>
              {endTimeStamp && (
                <Typography sx={{ fontSize: "11px", color: "var(--text4)" }}>
                  Ends: {formatDateTime(endTimeStamp)}
                </Typography>
              )}
            </Stack>

            {/* Stats row */}
            <Stack
              direction="row"
              gap="8px"
              sx={{
                borderTop: "1px solid var(--border-color)",
                paddingTop: "10px",
              }}
            >
              <StatBadge
                icon={<Timer sx={{ fontSize: "13px" }} />}
                value={formatDuration(duration)}
                label="Duration"
                color="var(--primary-color)"
                bgColor="rgba(24, 113, 99, 0.06)"
                borderColor="rgba(24, 113, 99, 0.12)"
              />
              <StatBadge
                icon={<Grading sx={{ fontSize: "13px" }} />}
                value={`${totalMarks || 0}`}
                label="Marks"
                color="#4CAF50"
                bgColor="rgba(76, 175, 80, 0.06)"
                borderColor="rgba(76, 175, 80, 0.12)"
              />
              <StatBadge
                icon={<Quiz sx={{ fontSize: "13px" }} />}
                value={`${totalQuestions || 0}`}
                label="Questions"
                color="#2196F3"
                bgColor="rgba(33, 150, 243, 0.06)"
                borderColor="rgba(33, 150, 243, 0.12)"
              />
            </Stack>

            {/* Bottom row */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" alignItems="center" gap="6px">
                {batchList && batchList.length > 0 && (
                  <Chip
                    icon={<Groups sx={{ fontSize: "12px !important" }} />}
                    label={`${batchList.length} ${batchList.length === 1 ? "Batch" : "Batches"}`}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowBatchDialog(true);
                    }}
                    sx={{
                      height: "20px",
                      fontSize: "10px",
                      fontWeight: 600,
                      backgroundColor: "rgba(24, 113, 99, 0.08)",
                      color: "var(--primary-color)",
                      border: "1px solid rgba(24, 113, 99, 0.15)",
                      "& .MuiChip-icon": { color: "var(--primary-color)" },
                      "& .MuiChip-label": { padding: "0 6px" },
                    }}
                  />
                )}
              </Stack>
              <Stack
                direction="row"
                alignItems="center"
                gap="3px"
                sx={{ color: "var(--primary-color)" }}
              >
                <Typography
                  sx={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--primary-color)",
                  }}
                >
                  View Details
                </Typography>
                <East sx={{ fontSize: 12 }} />
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
        PaperProps={{ sx: { borderRadius: "10px" } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: "12px",
          }}
        >
          <Typography fontWeight="700" fontSize="15px" fontFamily="Lato">
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
                    borderRadius: "6px",
                    marginBottom: index < batchMeta.length - 1 ? "4px" : 0,
                    backgroundColor: "rgba(24, 113, 99, 0.04)",
                    border: "1px solid rgba(24, 113, 99, 0.08)",
                    "&:hover": {
                      backgroundColor: "rgba(24, 113, 99, 0.08)",
                    },
                  }}
                >
                  <ListItemText
                    primary={batch.title}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      fontSize: "13px",
                    }}
                  />
                </ListItem>
              ))
            ) : batchList && batchList.length > 0 ? (
              batchList.map((batchId, index) => (
                <ListItem
                  key={batchId}
                  sx={{
                    borderRadius: "6px",
                    marginBottom: index < batchList.length - 1 ? "4px" : 0,
                    backgroundColor: "rgba(24, 113, 99, 0.04)",
                    border: "1px solid rgba(24, 113, 99, 0.08)",
                  }}
                >
                  <ListItemText
                    primary={`Batch ${index + 1}`}
                    secondary={batchId}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      fontSize: "13px",
                    }}
                    secondaryTypographyProps={{
                      fontSize: "10px",
                      color: "var(--text4)",
                    }}
                  />
                </ListItem>
              ))
            ) : (
              <Typography
                color="var(--text3)"
                textAlign="center"
                padding="20px"
                fontSize="13px"
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

const StatBadge = ({ icon, value, label, color, bgColor, borderColor }) => (
  <Stack
    alignItems="center"
    justifyContent="center"
    gap="2px"
    flex={1}
    sx={{
      padding: "6px 4px",
      backgroundColor: bgColor,
      borderRadius: "6px",
      border: `1px solid ${borderColor}`,
    }}
  >
    <Stack sx={{ color }}>{icon}</Stack>
    <Typography
      sx={{
        fontSize: "12px",
        fontWeight: 700,
        color,
        fontFamily: "Lato",
        lineHeight: 1,
      }}
    >
      {value}
    </Typography>
    <Typography
      sx={{
        fontSize: "8px",
        fontWeight: 600,
        color: "var(--text4)",
        textTransform: "uppercase",
        letterSpacing: "0.3px",
      }}
    >
      {label}
    </Typography>
  </Stack>
);
