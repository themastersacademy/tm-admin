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
        height: "auto",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        position: "relative",
        backgroundColor: "var(--white)",
        overflow: "hidden",
        transition: "all 0.2s ease",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          borderColor: "var(--primary-color)",
        },
      }}
      elevation={0}
    >
      {/* Status Badge */}
      {isLive && (
        <Chip
          size="small"
          label={isLive}
          sx={{
            borderRadius: "0px 8px 0px 8px",
            position: "absolute",
            top: "0px",
            right: "0px",
            backgroundColor: isLive === "Live" ? "#4CAF50" : "#9E9E9E",
            color: "var(--white)",
            fontWeight: 700,
            fontSize: "10px",
            height: "20px",
            zIndex: 2,
          }}
        />
      )}

      {/* Header Section */}
      <Stack
        padding="20px"
        gap="12px"
        sx={{
          backgroundColor: "var(--bg-color)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <Stack direction="row" alignItems="flex-start" gap="12px">
          <Stack
            sx={{
              width: "48px",
              height: "48px",
              backgroundColor: "var(--white)",
              borderRadius: "10px",
              justifyContent: "center",
              alignItems: "center",
              border: "1px solid var(--border-color)",
              flexShrink: 0,
            }}
          >
            <Image src={icon} alt={title} width={24} height={28} />
          </Stack>

          <Stack flex={1} gap="4px">
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "16px",
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

      {/* Content Section */}
      <Stack padding="20px" gap="16px" flex={1}>
        {totalContent > 0 ? (
          <>
            {/* Analytics Row */}
            <Stack direction="row" gap="10px" justifyContent="space-between">
              <StatItem
                icon={<School sx={{ fontSize: "16px", color: "#2196F3" }} />}
                value={coursesCount}
                label="Courses"
                bgColor="rgba(33, 150, 243, 0.08)"
              />
              <StatItem
                icon={<MenuBook sx={{ fontSize: "16px", color: "#9C27B0" }} />}
                value={subjectsCount}
                label="Subjects"
                bgColor="rgba(156, 39, 176, 0.08)"
              />
              <StatItem
                icon={<Article sx={{ fontSize: "16px", color: "#FF9800" }} />}
                value={blogsCount}
                label="Blogs"
                bgColor="rgba(255, 152, 0, 0.08)"
              />
            </Stack>

            {/* Total Summary */}
            <Stack
              padding="10px 12px"
              sx={{
                backgroundColor: "rgba(var(--primary-rgb), 0.06)",
                borderRadius: "8px",
                border: "1px solid rgba(var(--primary-rgb), 0.12)",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text2)",
                  }}
                >
                  Total Content
                </Typography>
                <Typography
                  sx={{
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "var(--primary-color)",
                    fontFamily: "Lato",
                  }}
                >
                  {totalContent}
                </Typography>
              </Stack>
            </Stack>
          </>
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            padding="20px 12px"
            gap="6px"
            sx={{
              backgroundColor: "var(--bg-color)",
              borderRadius: "8px",
              border: "1px dashed var(--border-color)",
            }}
          >
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text3)",
              }}
            >
              No content yet
            </Typography>
            <Typography
              sx={{
                fontSize: "11px",
                color: "var(--text4)",
                textAlign: "center",
              }}
            >
              Add courses, subjects, or blogs
            </Typography>
          </Stack>
        )}
      </Stack>

      {/* Footer with Button */}
      <Stack
        padding="16px 20px"
        sx={{
          borderTop: "1px solid var(--border-color)",
          backgroundColor: "var(--white)",
        }}
      >
        <Button
          variant="contained"
          endIcon={<TrendingFlat />}
          onClick={onClick}
          fullWidth
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            fontFamily: "Lato",
            fontSize: "13px",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "var(--primary-color-dark)",
              boxShadow: "none",
            },
          }}
        >
          {actionButton}
        </Button>
      </Stack>
    </Card>
  );
}

// Stat Item Component
const StatItem = ({ icon, value, label, bgColor }) => (
  <Stack
    flex={1}
    alignItems="center"
    gap="6px"
    padding="10px 6px"
    sx={{
      backgroundColor: bgColor,
      borderRadius: "8px",
    }}
  >
    <Stack
      sx={{
        width: "28px",
        height: "28px",
        backgroundColor: "var(--white)",
        borderRadius: "6px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {icon}
    </Stack>
    <Typography
      sx={{
        fontSize: "16px",
        fontWeight: 800,
        color: "var(--text1)",
        fontFamily: "Lato",
        lineHeight: 1,
      }}
    >
      {value}
    </Typography>
    <Typography
      sx={{
        fontSize: "10px",
        fontWeight: 600,
        color: "var(--text3)",
        textTransform: "uppercase",
        letterSpacing: "0.3px",
        textAlign: "center",
      }}
    >
      {label}
    </Typography>
  </Stack>
);
