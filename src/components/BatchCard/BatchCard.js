import {
  ContentCopy,
  Lock,
  LockOpen,
  People,
  School,
  Edit,
  Delete,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BatchCard({ batch, instituteID, onEdit, onDelete }) {
  const router = useRouter();
  const {
    id,
    title,
    batchCode,
    status,
    enrolledStudentCount = 0,
    capacity = 1,
  } = batch;

  const [copied, setCopied] = useState(false);

  const handleCopyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(batchCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLocked = status === "LOCKED";
  const progress = Math.min((enrolledStudentCount / capacity) * 100, 100);

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        transition: "all 0.2s ease",
        background: "var(--white)",
        position: "relative",
        overflow: "visible",
        "&:hover": {
          borderColor: "var(--primary-color)",
          boxShadow: "0 4px 16px rgba(24, 113, 99, 0.08)",
          "& .action-btns": { opacity: 1 },
        },
      }}
    >
      <CardActionArea
        onClick={() => router.push(`/dashboard/institute/${instituteID}/${id}`)}
        sx={{
          padding: "14px 16px",
          borderRadius: "12px",
          "&:hover .MuiCardActionArea-focusHighlight": { opacity: 0 },
        }}
      >
        <Stack gap="12px">
          {/* Header: icon + title + status */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" gap="10px" flex={1} minWidth={0}>
              <Avatar
                variant="rounded"
                sx={{
                  background: "var(--primary-color-acc-2)",
                  color: "var(--primary-color)",
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  border: "1px solid rgba(24, 113, 99, 0.15)",
                  flexShrink: 0,
                }}
              >
                <School sx={{ fontSize: "18px" }} />
              </Avatar>
              <Stack minWidth={0} flex={1}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "var(--text1)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontFamily: "Lato",
                  }}
                >
                  {title}
                </Typography>
                <Stack direction="row" alignItems="center" gap="4px">
                  <Typography sx={{ fontSize: "11px", color: "var(--text4)", fontFamily: "monospace" }}>
                    {batchCode}
                  </Typography>
                  <Tooltip title={copied ? "Copied!" : "Copy"} arrow>
                    <IconButton
                      component="div"
                      size="small"
                      onClick={handleCopyCode}
                      onMouseDown={(e) => e.stopPropagation()}
                      sx={{ padding: "2px", color: copied ? "#4caf50" : "var(--text4)" }}
                    >
                      <ContentCopy sx={{ fontSize: 11 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Stack>
            <Chip
              icon={isLocked ? <Lock sx={{ fontSize: "12px !important" }} /> : <LockOpen sx={{ fontSize: "12px !important" }} />}
              label={status || "LOCKED"}
              size="small"
              sx={{
                backgroundColor: isLocked ? "rgba(198, 40, 40, 0.06)" : "rgba(76, 175, 80, 0.08)",
                color: isLocked ? "#c62828" : "#4caf50",
                fontWeight: 600,
                fontSize: "10px",
                height: "22px",
                borderRadius: "6px",
                border: `1px solid ${isLocked ? "rgba(198, 40, 40, 0.15)" : "rgba(76, 175, 80, 0.2)"}`,
                "& .MuiChip-icon": { color: "inherit", ml: "4px" },
                flexShrink: 0,
                ml: "8px",
              }}
            />
          </Stack>

          {/* Enrollment bar */}
          <Stack
            sx={{
              padding: "8px 10px",
              backgroundColor: "var(--bg-color, #fafafa)",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb="4px">
              <Stack direction="row" alignItems="center" gap="4px">
                <People sx={{ fontSize: 13, color: "var(--text4)" }} />
                <Typography sx={{ fontSize: "11px", color: "var(--text4)", fontWeight: 600 }}>
                  Students
                </Typography>
              </Stack>
              <Typography sx={{ fontWeight: 700, fontSize: "11px", color: "var(--text1)" }}>
                {enrolledStudentCount}
                <span style={{ color: "var(--text4)", fontWeight: 400 }}> / {capacity}</span>
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 5,
                borderRadius: 3,
                backgroundColor: "#f0f0f0",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: progress >= 100 ? "#f44336" : "var(--primary-color)",
                  borderRadius: 3,
                },
              }}
            />
          </Stack>
        </Stack>
      </CardActionArea>

      {/* Action Buttons - show on hover */}
      <Stack
        className="action-btns"
        direction="row"
        gap="4px"
        sx={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 2,
          opacity: 0,
          transition: "opacity 0.2s ease",
        }}
      >
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onEdit(batch); }}
          sx={{
            width: 26, height: 26,
            border: "1px solid var(--border-color)",
            borderRadius: "6px",
            backgroundColor: "var(--white)",
            "&:hover": { backgroundColor: "var(--primary-color-acc-2)", borderColor: "var(--primary-color)" },
          }}
        >
          <Edit sx={{ fontSize: "13px", color: "var(--text2)" }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onDelete(batch); }}
          sx={{
            width: 26, height: 26,
            border: "1px solid var(--border-color)",
            borderRadius: "6px",
            backgroundColor: "var(--white)",
            "&:hover": { color: "#f44336", borderColor: "#f44336", backgroundColor: "rgba(244,67,54,0.04)" },
          }}
        >
          <Delete sx={{ fontSize: "13px", color: "inherit" }} />
        </IconButton>
      </Stack>
    </Card>
  );
}
