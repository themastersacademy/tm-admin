import {
  AccountBalance,
  CalendarToday,
  Class,
  Email,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function InstituteCard({ institute }) {
  const router = useRouter();
  const { id, title, email, batchCount, status, createdAt } = institute;

  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card
      elevation={0}
      sx={{
        width: "350px",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.1)",
          borderColor: "var(--primary-color)",
        },
      }}
    >
      <CardActionArea
        onClick={() => router.push(`/dashboard/institute/${id}`)}
        sx={{ height: "100%", padding: "20px" }}
      >
        <Stack gap="16px">
          {/* Header with Icon and Status */}
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
              <AccountBalance />
            </Avatar>
            <Chip
              label={status || "Active"}
              size="small"
              sx={{
                backgroundColor: status === "ACTIVE" ? "#e8f5e9" : "#ffebee",
                color: status === "ACTIVE" ? "#2e7d32" : "#c62828",
                fontWeight: 600,
                fontSize: "11px",
                height: "24px",
              }}
            />
          </Stack>

          {/* Title and Email */}
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
            <Stack flexDirection="row" alignItems="center" gap="6px">
              <Email sx={{ fontSize: 14, color: "var(--text3)" }} />
              <Typography
                variant="body2"
                sx={{
                  color: "var(--text3)",
                  fontSize: "13px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {email}
              </Typography>
            </Stack>
          </Box>

          <Divider sx={{ borderStyle: "dashed" }} />

          {/* Stats Footer */}
          <Stack
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack flexDirection="row" alignItems="center" gap="6px">
              <Class sx={{ fontSize: 16, color: "var(--primary-color)" }} />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "var(--text2)",
                  fontSize: "13px",
                }}
              >
                {batchCount || 0} Batches
              </Typography>
            </Stack>

            <Stack flexDirection="row" alignItems="center" gap="6px">
              <CalendarToday sx={{ fontSize: 14, color: "var(--text3)" }} />
              <Typography
                variant="caption"
                sx={{ color: "var(--text3)", fontSize: "12px" }}
              >
                {formattedDate}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardActionArea>
    </Card>
  );
}
