"use client";
import {
  Stack,
  Typography,
  Button,
  IconButton,
  Chip,
  Box,
  Skeleton,
} from "@mui/material";
import { Add, ArrowBack, AccountBalance } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function InstituteDetailHeader({
  instituteName,
  instituteEmail,
  batchCount,
  onCreateBatch,
  isLoading,
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
          <AccountBalance sx={{ fontSize: "20px", color: "var(--primary-color)" }} />
        </Box>

        <Stack>
          <Stack direction="row" alignItems="center" gap="8px">
            <Typography sx={{ fontFamily: "Lato", fontSize: "18px", fontWeight: 700, color: "var(--text1)" }}>
              {instituteName || <Skeleton variant="text" width={150} />}
            </Typography>
            <Chip
              label={`${batchCount} Batches`}
              size="small"
              sx={{
                backgroundColor: "var(--primary-color-acc-2)",
                color: "var(--primary-color)",
                fontWeight: 700,
                fontSize: "11px",
                height: "22px",
                border: "1px solid rgba(24, 113, 99, 0.2)",
              }}
            />
          </Stack>
          <Typography sx={{ fontSize: "12px", color: "var(--text4)" }}>
            {instituteEmail || <Skeleton variant="text" width={200} />}
          </Typography>
        </Stack>
      </Stack>

      {/* Right */}
      <Button
        variant="contained"
        startIcon={<Add sx={{ fontSize: "18px" }} />}
        onClick={onCreateBatch}
        disableElevation
        sx={{
          backgroundColor: "var(--primary-color)",
          color: "#fff",
          textTransform: "none",
          borderRadius: "8px",
          padding: "8px 18px",
          fontWeight: 600,
          fontSize: "13px",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "var(--primary-color-dark)",
            boxShadow: "0 2px 8px rgba(24, 113, 99, 0.2)",
          },
        }}
      >
        Create Batch
      </Button>
    </Stack>
  );
}
