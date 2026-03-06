"use client";
import { Stack, Typography, Chip, IconButton } from "@mui/material";
import { Book, ArrowBack } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function SubjectHeader({
  subject,
  stats = {},
  totalCount = 0,
  actions,
}) {
  const router = useRouter();

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        padding: "12px 16px",
      }}
    >
      {/* Left: Back + Title */}
      <Stack direction="row" alignItems="center" gap="10px">
        <IconButton
          onClick={() => router.back()}
          size="small"
          sx={{
            width: "30px",
            height: "30px",
            border: "1px solid var(--border-color)",
            "&:hover": {
              backgroundColor: "var(--bg-color)",
              borderColor: "var(--primary-color)",
            },
          }}
        >
          <ArrowBack sx={{ fontSize: "16px", color: "var(--text3)" }} />
        </IconButton>
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
          <Book sx={{ fontSize: "17px", color: "var(--primary-color)" }} />
        </Stack>
        <Typography
          sx={{ fontSize: "15px", fontWeight: 700, color: "var(--text1)" }}
        >
          {subject?.title || "Subject"}
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

      {/* Right: Actions */}
      <Stack direction="row" gap="8px" alignItems="center">
        {actions}
      </Stack>
    </Stack>
  );
}
