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
  Divider,
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
        width: "350px",
        border: "1px solid var(--border-color)",
        borderRadius: "16px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        background: "var(--white)",
        position: "relative",
        overflow: "visible",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px -4px rgba(0, 0, 0, 0.08)",
          borderColor: "transparent",
          "& .action-arrow": {
            opacity: 1,
            transform: "translateX(0)",
          },
        },
      }}
    >
      <Box sx={{ position: "relative", height: "100%" }}>
        <CardActionArea
          onClick={() => router.push(`/dashboard/institute/${id}`)}
          sx={{
            height: "100%",
            padding: "24px",
            borderRadius: "16px",
            "&:hover .MuiCardActionArea-focusHighlight": {
              opacity: 0,
            },
          }}
        >
          <Stack gap="20px">
            {/* Header with Icon and Status */}
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Avatar
                variant="rounded"
                sx={{
                  background:
                    "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)",
                  color: "#F57C00",
                  width: 52,
                  height: 52,
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 152, 0, 0.1)",
                }}
              >
                <AccountBalance sx={{ fontSize: "26px" }} />
              </Avatar>
              <Stack direction="row" gap={1}>
                {/* Spacer for the absolute positioned edit button */}
                <Box width={32} />
                <Chip
                  label={status || "Active"}
                  size="small"
                  sx={{
                    backgroundColor:
                      status === "ACTIVE" ? "#E8F5E9" : "#FFEBEE",
                    color: status === "ACTIVE" ? "#2E7D32" : "#C62828",
                    fontWeight: 700,
                    fontSize: "11px",
                    height: "26px",
                    borderRadius: "6px",
                    border: "1px solid",
                    borderColor:
                      status === "ACTIVE"
                        ? "rgba(46, 125, 50, 0.1)"
                        : "rgba(198, 40, 40, 0.1)",
                  }}
                />
              </Stack>
            </Stack>

            {/* Title and Email */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: "18px",
                  color: "var(--text1)",
                  mb: 0.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily: "Lato",
                }}
              >
                {title}
              </Typography>
              <Stack flexDirection="row" alignItems="center" gap="8px">
                <Email sx={{ fontSize: 15, color: "var(--text3)" }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: "var(--text3)",
                    fontSize: "13px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontWeight: 500,
                  }}
                >
                  {email}
                </Typography>
              </Stack>
            </Box>

            <Divider
              sx={{
                borderStyle: "dashed",
                borderColor: "var(--border-color)",
              }}
            />

            {/* Stats Footer */}
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack
                flexDirection="row"
                alignItems="center"
                gap="8px"
                sx={{
                  backgroundColor: "rgba(33, 150, 243, 0.08)",
                  padding: "6px 10px",
                  borderRadius: "6px",
                }}
              >
                <Class sx={{ fontSize: 16, color: "#1976D2" }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: "#1565C0",
                    fontSize: "12px",
                  }}
                >
                  {batchCount || 0} Batches
                </Typography>
              </Stack>

              <Stack flexDirection="row" alignItems="center" gap="6px">
                <CalendarToday sx={{ fontSize: 14, color: "var(--text3)" }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: "var(--text3)",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  {formattedDate}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </CardActionArea>

        {/* Edit Button - Positioned Absolutely */}
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(institute);
          }}
          sx={{
            position: "absolute",
            top: "24px",
            right: "80px", // Adjusted based on Chip position
            zIndex: 2,
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            padding: "4px",
            backgroundColor: "var(--white)",
            "&:hover": {
              backgroundColor: "var(--bg-color)",
            },
          }}
        >
          <Edit sx={{ fontSize: "16px", color: "var(--text2)" }} />
        </IconButton>
      </Box>
    </Card>
  );
}
