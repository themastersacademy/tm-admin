import { MenuBook, Article, School } from "@mui/icons-material";
import { Card, Chip, Stack, Typography, Box } from "@mui/material";
import Image from "next/image";

export default function GoalCard({
  icon,
  title,
  onClick,
  isLive,
  coursesCount = 0,
  subjectsCount = 0,
  blogsCount = 0,
  updatedAt,
}) {
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "Recently";
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const isLiveStatus = isLive === "Live";

  return (
    <Card
      sx={{
        width: "280px",
        height: "170px",
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        backgroundColor: "var(--white)",
        overflow: "hidden",
        transition: "all 0.15s ease",
        cursor: "pointer",
        borderTop: `3px solid ${isLiveStatus ? "var(--primary-color)" : "var(--border-color)"}`,
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          borderColor: "var(--primary-color)",
        },
      }}
      elevation={0}
      onClick={onClick}
    >
      <Stack padding="14px 16px" gap="8px" sx={{ height: "100%" }}>
        <Stack direction="row" alignItems="flex-start" gap="10px" sx={{ minHeight: "42px" }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "8px",
              backgroundColor: "var(--primary-color-acc-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(24, 113, 99, 0.15)",
              flexShrink: 0,
            }}
          >
            {icon ? (
              <Image src={icon} alt={title} width={18} height={20} />
            ) : (
              <School sx={{ fontSize: "18px", color: "var(--primary-color)" }} />
            )}
          </Box>
          <Stack flex={1} gap="1px" sx={{ minWidth: 0 }}>
            <Typography
              title={title}
              sx={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--text1)",
                lineHeight: 1.2,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </Typography>
            <Typography sx={{ fontSize: "10px", color: "var(--text4)" }}>
              {getRelativeTime(updatedAt)}
            </Typography>
          </Stack>
          <Chip
            label={isLive}
            size="small"
            sx={{
              height: "20px",
              fontSize: "10px",
              fontWeight: 700,
              backgroundColor: isLiveStatus
                ? "rgba(76, 175, 80, 0.08)"
                : "rgba(0, 0, 0, 0.04)",
              color: isLiveStatus ? "#4CAF50" : "#9E9E9E",
              border: `1px solid ${isLiveStatus ? "#4caf5030" : "#00000015"}`,
              "& .MuiChip-label": { padding: "0 6px" },
            }}
          />
        </Stack>

        {/* Stats */}
        <Stack
          direction="row"
          gap="8px"
          sx={{
            borderTop: "1px solid var(--border-color)",
            paddingTop: "10px",
            marginTop: "auto",
          }}
        >
          <StatBadge
            icon={<School sx={{ fontSize: "13px" }} />}
            value={coursesCount}
            label="Courses"
            color="var(--primary-color)"
            bgColor="rgba(24, 113, 99, 0.06)"
            borderColor="rgba(24, 113, 99, 0.12)"
          />
          <StatBadge
            icon={<MenuBook sx={{ fontSize: "13px" }} />}
            value={subjectsCount}
            label="Subjects"
            color="#4CAF50"
            bgColor="rgba(76, 175, 80, 0.06)"
            borderColor="rgba(76, 175, 80, 0.12)"
          />
          <StatBadge
            icon={<Article sx={{ fontSize: "13px" }} />}
            value={blogsCount}
            label="Blogs"
            color="#2196F3"
            bgColor="rgba(33, 150, 243, 0.06)"
            borderColor="rgba(33, 150, 243, 0.12)"
          />
        </Stack>
      </Stack>
    </Card>
  );
}

const StatBadge = ({ icon, value, label, color, bgColor, borderColor }) => (
  <Stack
    alignItems="center"
    gap="2px"
    flex={1}
    sx={{
      padding: "6px 4px",
      backgroundColor: bgColor,
      borderRadius: "6px",
      border: `1px solid ${borderColor}`,
    }}
  >
    <Stack sx={{ color }}>{icon}</Stack>
    <Typography
      sx={{
        fontSize: "14px",
        fontWeight: 800,
        color,
        fontFamily: "Lato",
        lineHeight: 1,
      }}
    >
      {value}
    </Typography>
    <Typography
      sx={{
        fontSize: "8px",
        fontWeight: 600,
        color: "var(--text4)",
        textTransform: "uppercase",
        letterSpacing: "0.3px",
      }}
    >
      {label}
    </Typography>
  </Stack>
);
