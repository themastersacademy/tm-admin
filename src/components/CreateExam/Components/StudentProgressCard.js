"use client";
import {
  Avatar,
  Box,
  Chip,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  Person as PersonIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";

export default function StudentProgressCard({
  name,
  email,
  image,
  year,
  college,
  time,
  status,
  percent,
  examName,
  marks,
  onClick,
}) {
  const percentageValue = parseInt(percent) || 0;

  // Determine color based on percentage
  const getScoreColor = (score) => {
    if (score >= 80) return "#4caf50"; // Green
    if (score >= 50) return "#ff9800"; // Orange
    return "#f44336"; // Red
  };

  const scoreColor = getScoreColor(percentageValue);

  return (
    <Box
      onClick={onClick}
      sx={{
        width: "100%",
        backgroundColor: "var(--white)",
        borderRadius: "12px",
        border: "1px solid var(--border-color)",
        padding: "20px",
        transition: "all 0.2s ease-in-out",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          borderColor: "var(--primary-color)",
        },
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        gap: "20px",
        justifyContent: "space-between",
      }}
    >
      {/* Student Profile Section */}
      <Stack
        flexDirection="row"
        alignItems="center"
        gap="16px"
        sx={{ minWidth: "250px" }}
      >
        <Avatar
          src={image}
          sx={{
            width: "56px",
            height: "56px",
            borderRadius: "12px",
            backgroundColor: "var(--primary-color-acc-2)",
            color: "var(--primary-color)",
            border: "2px solid var(--white)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {!image && <PersonIcon />}
        </Avatar>
        <Stack gap="4px">
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "16px",
              fontWeight: "700",
              color: "var(--text1)",
              lineHeight: 1.2,
            }}
          >
            {name}
          </Typography>
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "13px",
              color: "var(--text4)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {email}
          </Typography>
        </Stack>
      </Stack>

      {/* Exam & Institute Info */}
      <Stack
        flexDirection="row"
        gap="30px"
        flex={1}
        justifyContent="center"
        sx={{
          borderLeft: { md: "1px solid var(--border-color)" },
          borderRight: { md: "1px solid var(--border-color)" },
          paddingX: { md: "20px" },
          width: { xs: "100%", md: "auto" },
        }}
      >
        <Stack gap="8px" flex={1}>
          <Stack flexDirection="row" alignItems="center" gap="6px">
            <SchoolIcon sx={{ fontSize: "16px", color: "var(--text4)" }} />
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text2)",
              }}
            >
              {college}
            </Typography>
          </Stack>
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "12px",
              color: "var(--text4)",
              paddingLeft: "22px",
            }}
          >
            {year}
          </Typography>
        </Stack>

        <Stack gap="8px" flex={1}>
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "14px",
              fontWeight: "600",
              color: "var(--text2)",
            }}
          >
            {examName}
          </Typography>
          <Stack flexDirection="row" alignItems="center" gap="6px">
            <CalendarIcon sx={{ fontSize: "14px", color: "var(--text4)" }} />
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "12px",
                color: "var(--text4)",
              }}
            >
              {time}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      {/* Performance & Status */}
      <Stack
        flexDirection="row"
        alignItems="center"
        gap="24px"
        sx={{ minWidth: "200px", justifyContent: "flex-end" }}
      >
        {status === "COMPLETED" ? (
          <Stack flexDirection="row" alignItems="center" gap="12px">
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <CircularProgress
                variant="determinate"
                value={percentageValue}
                size={44}
                thickness={4}
                sx={{ color: scoreColor }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: "absolute",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="caption"
                  component="div"
                  sx={{
                    fontWeight: "700",
                    color: scoreColor,
                    fontSize: "11px",
                  }}
                >
                  {percent}
                </Typography>
              </Box>
            </Box>
            <Stack>
              <Typography
                sx={{
                  fontFamily: "Lato",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "var(--text1)",
                }}
              >
                {marks}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Lato",
                  fontSize: "11px",
                  color: "var(--text4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Marks
              </Typography>
            </Stack>
          </Stack>
        ) : (
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "14px",
              color: "var(--text4)",
              fontStyle: "italic",
            }}
          >
            -- / --
          </Typography>
        )}

        <Chip
          label={status === "COMPLETED" ? "Passed" : status.replace("_", " ")}
          sx={{
            height: "28px",
            fontSize: "12px",
            fontWeight: "600",
            textTransform: "capitalize",
            backgroundColor:
              status === "COMPLETED"
                ? "rgba(76, 175, 80, 0.1)"
                : status === "IN_PROGRESS"
                ? "rgba(33, 150, 243, 0.1)"
                : "rgba(244, 67, 54, 0.1)",
            color:
              status === "COMPLETED"
                ? "#4caf50"
                : status === "IN_PROGRESS"
                ? "#2196f3"
                : "#f44336",
            border: `1px solid ${
              status === "COMPLETED"
                ? "#4caf50"
                : status === "IN_PROGRESS"
                ? "#2196f3"
                : "#f44336"
            }`,
          }}
        />
      </Stack>
    </Box>
  );
}
