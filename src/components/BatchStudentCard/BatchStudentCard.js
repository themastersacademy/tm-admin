import {
  Delete,
  Person,
  Edit,
  LocalOffer,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

export default function BatchStudentCard({ student, onRemove, onEdit, index = 0 }) {
  const { studentMeta, joinedAt, tag } = student;
  const { name, email } = studentMeta;
  const isEven = index % 2 === 0;

  const formattedDate = joinedAt
    ? new Date(joinedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "2-digit",
      })
    : "-";

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        width: "100%",
        backgroundColor: isEven ? "var(--white)" : "var(--bg-color, #fafafa)",
        borderRadius: "6px",
        padding: "7px 12px",
        gap: "12px",
        transition: "all 0.15s ease",
        "&:hover": {
          backgroundColor: "rgba(24, 113, 99, 0.04)",
          "& .action-buttons": { opacity: 1 },
        },
      }}
    >
      {/* # */}
      <Typography
        sx={{
          fontSize: "11px",
          fontWeight: 600,
          color: "var(--text4)",
          minWidth: "24px",
          textAlign: "center",
        }}
      >
        {index + 1}
      </Typography>

      {/* Avatar + Name */}
      <Stack direction="row" alignItems="center" gap="8px" sx={{ minWidth: "180px", flex: 1 }}>
        <Avatar
          src={studentMeta?.image}
          sx={{
            width: 30,
            height: 30,
            borderRadius: "8px",
            backgroundColor: "var(--primary-color-acc-2)",
            color: "var(--primary-color)",
            fontSize: "13px",
          }}
        >
          {!studentMeta?.image && <Person sx={{ fontSize: "16px" }} />}
        </Avatar>
        <Stack sx={{ minWidth: 0 }}>
          <Typography
            title={name}
            sx={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text1)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "160px",
            }}
          >
            {name}
          </Typography>
          <Typography
            sx={{
              fontSize: "10px",
              color: "var(--text4)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "160px",
            }}
          >
            {email}
          </Typography>
        </Stack>
      </Stack>

      {/* Roll No */}
      <Typography
        sx={{
          fontSize: "11px",
          fontWeight: 600,
          color: "var(--text2)",
          minWidth: "70px",
          textAlign: "center",
          display: { xs: "none", md: "block" },
        }}
      >
        {student.rollNo || "-"}
      </Typography>

      {/* Tag */}
      <Box sx={{ minWidth: "80px", display: { xs: "none", md: "flex" }, justifyContent: "center" }}>
        {tag ? (
          <Chip
            icon={<LocalOffer sx={{ fontSize: "11px !important" }} />}
            label={tag}
            size="small"
            sx={{
              height: "20px",
              fontSize: "10px",
              fontWeight: 600,
              backgroundColor: "var(--primary-color-acc-2)",
              color: "var(--primary-color)",
              border: "1px solid rgba(24, 113, 99, 0.2)",
              "& .MuiChip-icon": { color: "var(--primary-color)", ml: "4px" },
              "& .MuiChip-label": { padding: "0 6px" },
            }}
          />
        ) : (
          <Typography sx={{ fontSize: "11px", color: "var(--text4)" }}>-</Typography>
        )}
      </Box>

      {/* Joined Date */}
      <Typography
        sx={{
          fontSize: "10px",
          color: "var(--text4)",
          minWidth: "65px",
          textAlign: "center",
          display: { xs: "none", lg: "block" },
        }}
      >
        {formattedDate}
      </Typography>

      {/* Actions */}
      <Stack
        className="action-buttons"
        direction="row"
        gap="4px"
        sx={{
          opacity: 0,
          transition: "opacity 0.15s ease",
          minWidth: "56px",
          justifyContent: "flex-end",
        }}
      >
        {onEdit && (
          <Tooltip title="Edit" arrow>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(student);
              }}
              sx={{
                width: 24,
                height: 24,
                borderRadius: "6px",
                backgroundColor: "var(--primary-color-acc-2)",
                border: "1px solid rgba(24, 113, 99, 0.2)",
                "&:hover": { backgroundColor: "rgba(24, 113, 99, 0.15)" },
              }}
            >
              <Edit sx={{ fontSize: "12px", color: "var(--primary-color)" }} />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Remove" arrow>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(student.id);
            }}
            sx={{
              width: 24,
              height: 24,
              borderRadius: "6px",
              backgroundColor: "#ffebee",
              border: "1px solid #ffcdd2",
              "&:hover": { backgroundColor: "#ffcdd2" },
            }}
          >
            <Delete sx={{ fontSize: "12px", color: "#f44336" }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}
