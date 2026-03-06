"use client";
import { Stack, Typography, Chip, Box } from "@mui/material";
import { EmojiEvents } from "@mui/icons-material";

export default function GoalsHeader({
  actions,
  totalCount = 0,
  stats = { total: 0, live: 0, draft: 0 },
}) {
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
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "10px",
            backgroundColor: "var(--primary-color-acc-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(24, 113, 99, 0.15)",
            flexShrink: 0,
          }}
        >
          <EmojiEvents sx={{ fontSize: "20px", color: "var(--primary-color)" }} />
        </Box>
        <Stack>
          <Stack direction="row" alignItems="center" gap="8px">
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--text1)",
              }}
            >
              Goals
            </Typography>
            <Chip
              label={totalCount}
              size="small"
              sx={{
                backgroundColor: "var(--primary-color-acc-2)",
                color: "var(--primary-color)",
                fontWeight: 700,
                fontSize: "11px",
                height: "22px",
                minWidth: "28px",
                border: "1px solid rgba(24, 113, 99, 0.2)",
              }}
            />
          </Stack>
          <Stack direction="row" alignItems="center" gap="12px">
            <Typography sx={{ fontSize: "12px", color: "var(--text4)" }}>
              {stats.live} published
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "var(--text4)" }}>
              {stats.draft} draft
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      {/* Right */}
      <Stack direction="row" gap="8px" alignItems="center">
        {actions}
      </Stack>
    </Stack>
  );
}
