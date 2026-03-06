import {
  AccountBalance,
  CalendarToday,
  Class,
  Email,
  ArrowForward,
  Edit,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  Chip,
  Stack,
  Typography,
  IconButton,
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function InstituteCard({ institute, onEdit }) {
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
        flex: "1 1 280px",
        maxWidth: "380px",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        transition: "all 0.2s ease",
        background: "var(--white)",
        position: "relative",
        overflow: "visible",
        "&:hover": {
          borderColor: "var(--primary-color)",
          boxShadow: "0 4px 16px rgba(24, 113, 99, 0.08)",
          "& .edit-btn": { opacity: 1 },
        },
      }}
    >
      <CardActionArea
        onClick={() => router.push(`/dashboard/institute/${id}`)}
        sx={{
          padding: "16px",
          borderRadius: "12px",
          "&:hover .MuiCardActionArea-focusHighlight": { opacity: 0 },
        }}
      >
        <Stack gap="14px">
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" gap="10px" flex={1} minWidth={0}>
              <Avatar
                variant="rounded"
                sx={{
                  background: "var(--primary-color-acc-2)",
                  color: "var(--primary-color)",
                  width: 38,
                  height: 38,
                  borderRadius: "10px",
                  border: "1px solid rgba(24, 113, 99, 0.15)",
                  flexShrink: 0,
                }}
              >
                <AccountBalance sx={{ fontSize: "20px" }} />
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
                <Typography
                  sx={{
                    color: "var(--text4)",
                    fontSize: "11px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {email}
                </Typography>
              </Stack>
            </Stack>
            <Chip
              label={status || "Active"}
              size="small"
              sx={{
                backgroundColor: status === "ACTIVE" ? "rgba(76, 175, 80, 0.08)" : "#FFEBEE",
                color: status === "ACTIVE" ? "#4caf50" : "#C62828",
                fontWeight: 600,
                fontSize: "10px",
                height: "22px",
                borderRadius: "6px",
                border: `1px solid ${status === "ACTIVE" ? "rgba(76, 175, 80, 0.2)" : "rgba(198, 40, 40, 0.1)"}`,
                flexShrink: 0,
                ml: "8px",
              }}
            />
          </Stack>

          {/* Footer Stats */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              padding: "8px 10px",
              backgroundColor: "var(--bg-color, #fafafa)",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
            }}
          >
            <Stack direction="row" alignItems="center" gap="6px">
              <Class sx={{ fontSize: 14, color: "var(--primary-color)" }} />
              <Typography sx={{ fontWeight: 700, color: "var(--primary-color)", fontSize: "12px" }}>
                {batchCount || 0} Batches
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap="4px">
              <CalendarToday sx={{ fontSize: 12, color: "var(--text4)" }} />
              <Typography sx={{ color: "var(--text4)", fontSize: "11px", fontWeight: 500 }}>
                {formattedDate}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardActionArea>

      {/* Edit Button */}
      <IconButton
        className="edit-btn"
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(institute);
        }}
        sx={{
          position: "absolute",
          top: "12px",
          right: "12px",
          zIndex: 2,
          opacity: 0,
          width: 28,
          height: 28,
          border: "1px solid var(--border-color)",
          borderRadius: "6px",
          backgroundColor: "var(--white)",
          transition: "opacity 0.2s ease",
          "&:hover": {
            backgroundColor: "var(--primary-color-acc-2)",
            borderColor: "var(--primary-color)",
          },
        }}
      >
        <Edit sx={{ fontSize: "14px", color: "var(--text2)" }} />
      </IconButton>
    </Card>
  );
}
