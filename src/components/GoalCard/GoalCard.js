import { TrendingFlat, MenuBook, Article, School } from "@mui/icons-material";
import { Button, Card, Chip, Stack, Typography } from "@mui/material";
import Image from "next/image";

export default function GoalCard({
  icon,
  title,
  actionButton,
  onClick,
  isLive,
  coursesCount = 0,
  subjectsCount = 0,
  blogsCount = 0,
  updatedAt,
}) {
  // Format timestamp to relative time
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

  const totalContent = coursesCount + subjectsCount + blogsCount;

  return (
    <Card
      sx={{
        width: "280px",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        backgroundColor: "var(--white)",
        overflow: "hidden",
        transition: "all 0.2s ease",
        cursor: "pointer",
        position: "relative",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 24px rgba(255, 152, 0, 0.12)",
          borderColor: "#FF9800",
        },
      }}
      elevation={0}
      onClick={onClick}
    >
      {/* Status Badge */}
      {isLive && (
        <Chip
          size="small"
          label={isLive}
          sx={{
            borderRadius: "0px 6px 0px 6px",
            position: "absolute",
            top: "0px",
            right: "0px",
            backgroundColor: isLive === "Live" ? "#4CAF50" : "#9E9E9E",
            color: "var(--white)",
            fontWeight: 600,
            fontSize: "10px",
            height: "18px",
            zIndex: 2,
          }}
        />
      )}

      {/* Header Section */}
      <Stack
        padding="16px"
        gap="8px"
        sx={{
          background: "linear-gradient(135deg, #FFF3E0 0%, #FFFFFF 100%)",
          borderBottom: "1px solid rgba(255, 152, 0, 0.1)",
        }}
      >
        <Stack direction="row" alignItems="center" gap="12px">
          <Stack
            sx={{
              width: "42px",
              height: "42px",
              background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
              borderRadius: "10px",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 2px 8px rgba(255, 152, 0, 0.2)",
              flexShrink: 0,
            }}
          >
            <Image src={icon} alt={title} width={22} height={24} />
          </Stack>

          <Stack flex={1} gap="2px">
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "15px",
                fontWeight: 700,
                color: "var(--text1)",
                lineHeight: 1.3,
              }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                fontSize: "11px",
                color: "var(--text3)",
                fontWeight: 500,
              }}
            >
              {getRelativeTime(updatedAt)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      {/* Content Section - Compact Stats */}
      <Stack padding="16px" gap="12px">
        {totalContent > 0 ? (
          <Stack
            direction="row"
            gap="8px"
            justifyContent="space-between"
            alignItems="center"
          >
            <StatBadge
              icon={<School sx={{ fontSize: "14px" }} />}
              value={coursesCount}
              label="Courses"
              color="#FF9800"
            />
            <StatBadge
              icon={<MenuBook sx={{ fontSize: "14px" }} />}
              value={subjectsCount}
              label="Subjects"
              color="#4CAF50"
            />
            <StatBadge
              icon={<Article sx={{ fontSize: "14px" }} />}
              value={blogsCount}
              label="Blogs"
              color="#2196F3"
            />
          </Stack>
        ) : (
          <Stack
            alignItems="center"
            padding="12px"
            gap="4px"
            sx={{
              backgroundColor: "rgba(255, 152, 0, 0.04)",
              borderRadius: "8px",
              border: "1px dashed rgba(255, 152, 0, 0.2)",
            }}
          >
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text3)",
              }}
            >
              No content yet
            </Typography>
          </Stack>
        )}

        {/* View Button */}
        <Button
          variant="outlined"
          endIcon={<TrendingFlat sx={{ fontSize: "18px" }} />}
          fullWidth
          sx={{
            borderColor: "#FF9800",
            color: "#FF9800",
            textTransform: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            fontFamily: "Lato",
            fontSize: "13px",
            fontWeight: 600,
            "&:hover": {
              borderColor: "#F57C00",
              backgroundColor: "rgba(255, 152, 0, 0.04)",
            },
          }}
        >
          {actionButton}
        </Button>
      </Stack>
    </Card>
  );
}

// Compact Stat Badge Component
const StatBadge = ({ icon, value, label, color }) => (
  <Stack
    alignItems="center"
    gap="4px"
    flex={1}
    sx={{
      padding: "8px 6px",
      backgroundColor: `${color}08`,
      borderRadius: "8px",
      border: `1px solid ${color}20`,
    }}
  >
    <Stack
      sx={{
        width: "24px",
        height: "24px",
        backgroundColor: "var(--white)",
        borderRadius: "6px",
        justifyContent: "center",
        alignItems: "center",
        color: color,
      }}
    >
      {icon}
    </Stack>
    <Typography
      sx={{
        fontSize: "16px",
        fontWeight: 800,
        color: color,
        fontFamily: "Lato",
        lineHeight: 1,
      }}
    >
      {value}
    </Typography>
    <Typography
      sx={{
        fontSize: "9px",
        fontWeight: 600,
        color: "var(--text3)",
        textTransform: "uppercase",
        letterSpacing: "0.3px",
      }}
    >
      {label}
    </Typography>
  </Stack>
);
