import {
  Delete,
  Email,
  Person,
  CalendarToday,
  Badge,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

export default function BatchStudentCard({ student, onRemove }) {
  const { studentMeta, joinedAt } = student;
  const { name, email } = studentMeta;

  const formattedDate = joinedAt
    ? new Date(joinedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

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
      <Stack padding="20px" gap="16px">
        {/* Header with Avatar and Remove Action */}
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
            <Person />
          </Avatar>
          <Tooltip title="Remove Student" arrow>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(student.id);
              }}
              sx={{
                color: "var(--delete-color)",
                backgroundColor: "#ffebee",
                "&:hover": {
                  backgroundColor: "#ffcdd2",
                },
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Student Info */}
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
            {name}
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
          {student.rollNo && (
            <Stack flexDirection="row" alignItems="center" gap="6px" mt={0.5}>
              <Badge sx={{ fontSize: 14, color: "var(--primary-color)" }} />
              <Typography
                variant="caption"
                sx={{
                  color: "var(--primary-color)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                Roll No: {student.rollNo}
              </Typography>
            </Stack>
          )}
        </Box>

        <Divider sx={{ borderStyle: "dashed" }} />

        {/* Footer with Joined Date */}
        <Stack flexDirection="row" alignItems="center" gap="6px">
          <CalendarToday sx={{ fontSize: 14, color: "var(--text3)" }} />
          <Typography
            variant="caption"
            sx={{ color: "var(--text3)", fontSize: "12px" }}
          >
            Joined: {formattedDate}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
