"use client";
import {
  Stack,
  Typography,
  IconButton,
  Chip,
  Skeleton,
  Box,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack,
  Settings,
  ContentCopy,
  School,
  People,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BatchHeader({
  batchTitle,
  instituteName,
  batchCode,
  onCopyCode,
  onSettings,
  isLoading,
  studentCount,
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyCode();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "16px 20px",
      }}
    >
      {/* Left */}
      <Stack direction="row" alignItems="center" gap="12px">
        <IconButton
          onClick={() => router.back()}
          sx={{
            width: 34,
            height: 34,
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "var(--primary-color)",
              borderColor: "var(--primary-color)",
              "& svg": { color: "#fff" },
            },
          }}
        >
          <ArrowBack sx={{ fontSize: "18px", color: "var(--text2)", transition: "color 0.2s" }} />
        </IconButton>

        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "10px",
            backgroundColor: "var(--primary-color-acc-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(24, 113, 99, 0.15)",
            flexShrink: 0,
          }}
        >
          <School sx={{ fontSize: "20px", color: "var(--primary-color)" }} />
        </Box>

        <Stack>
          <Stack direction="row" alignItems="center" gap="8px">
            <Typography sx={{ fontFamily: "Lato", fontSize: "18px", fontWeight: 700, color: "var(--text1)" }}>
              {batchTitle || <Skeleton variant="text" width={150} />}
            </Typography>
            <Chip
              icon={<People sx={{ fontSize: "13px !important" }} />}
              label={`${studentCount || 0} Students`}
              size="small"
              sx={{
                backgroundColor: "var(--primary-color-acc-2)",
                color: "var(--primary-color)",
                fontWeight: 700,
                fontSize: "11px",
                height: "22px",
                border: "1px solid rgba(24, 113, 99, 0.2)",
                "& .MuiChip-icon": { color: "var(--primary-color)", ml: "4px" },
              }}
            />
          </Stack>
          <Typography sx={{ fontSize: "12px", color: "var(--text4)" }}>
            {instituteName || <Skeleton variant="text" width={120} />}
          </Typography>
        </Stack>
      </Stack>

      {/* Right */}
      <Stack direction="row" gap="8px" alignItems="center">
        <IconButton
          onClick={onSettings}
          sx={{
            width: 34,
            height: 34,
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "var(--primary-color-acc-2)",
              borderColor: "var(--primary-color)",
            },
          }}
        >
          <Settings sx={{ fontSize: "18px", color: "var(--text2)" }} />
        </IconButton>

        <Tooltip title={copied ? "Copied!" : "Copy batch code"} arrow>
          <Stack
            direction="row"
            alignItems="center"
            gap="6px"
            onClick={handleCopy}
            sx={{
              padding: "6px 12px",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "var(--primary-color)",
                backgroundColor: "var(--primary-color-acc-2)",
              },
            }}
          >
            <Typography sx={{ fontSize: "13px", fontWeight: 700, fontFamily: "monospace", color: "var(--text1)", letterSpacing: "1px" }}>
              {batchCode || <Skeleton variant="text" width={60} />}
            </Typography>
            <ContentCopy sx={{ fontSize: "14px", color: copied ? "#4caf50" : "var(--text3)" }} />
          </Stack>
        </Tooltip>
      </Stack>
    </Stack>
  );
}
