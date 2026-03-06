import {
  Card,
  Stack,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  MoreVert,
  Visibility,
  Edit,
  Delete,
  CalendarToday,
  AccessTime,
  TextFields,
} from "@mui/icons-material";
import { useState } from "react";
import {
  getWordCount,
  getReadingTime,
  getExcerpt,
  formatDate,
} from "@/src/utils/blogHelpers";

const ACCENT_COLORS = [
  "var(--primary-color)",
  "#FF8851",
  "var(--sec-color)",
  "#4A90D9",
  "#7C5CBF",
  "#E85D75",
];

export default function BlogCard({
  title,
  description,
  createdAt,
  index = 0,
  onView,
  onEdit,
  onDelete,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const wordCount = getWordCount(description);
  const readingTime = getReadingTime(description);
  const excerpt = getExcerpt(description, 100);
  const formattedDate = formatDate(createdAt);
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];

  return (
    <Card
      onClick={onView}
      sx={{
        width: "100%",
        border: "1px solid var(--border-color)",
        borderTop: `3px solid ${accent}`,
        borderRadius: "10px",
        backgroundColor: "var(--white)",
        cursor: "pointer",
        transition: "all 0.15s ease",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          borderColor: "var(--primary-color)",
        },
      }}
      elevation={0}
    >
      <Stack padding="14px 16px" gap="10px" flex={1}>
        {/* Title + Menu */}
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          gap="8px"
        >
          <Typography
            title={title}
            sx={{
              fontFamily: "Lato",
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--text1)",
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              flex: 1,
              minHeight: "36px",
            }}
          >
            {title}
          </Typography>

          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{
              padding: "2px",
              flexShrink: 0,
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <MoreVert sx={{ fontSize: "18px", color: "var(--text3)" }} />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            onClick={(e) => e.stopPropagation()}
            disableScrollLock
            slotProps={{
              paper: {
                style: {
                  border: "1px solid var(--border-color)",
                  borderRadius: "7px",
                  padding: "0px",
                },
              },
            }}
            sx={{ "& .MuiList-root": { padding: "3px" } }}
            elevation={0}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                onView();
              }}
              sx={{ fontSize: "13px", gap: "8px", fontWeight: 500 }}
            >
              <Visibility sx={{ fontSize: "16px" }} /> View
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                onEdit();
              }}
              sx={{ fontSize: "13px", gap: "8px", fontWeight: 500 }}
            >
              <Edit sx={{ fontSize: "16px" }} /> Edit
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleMenuClose();
                onDelete();
              }}
              sx={{
                fontSize: "13px",
                gap: "8px",
                fontWeight: 500,
                color: "var(--delete-color)",
              }}
            >
              <Delete sx={{ fontSize: "16px" }} /> Delete
            </MenuItem>
          </Menu>
        </Stack>

        {/* Excerpt */}
        {excerpt && (
          <Typography
            sx={{
              fontSize: "12px",
              color: "var(--text4)",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {excerpt}
          </Typography>
        )}

        {/* Stats Row */}
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
            icon={<CalendarToday sx={{ fontSize: "13px" }} />}
            value={formattedDate}
            color="var(--primary-color)"
            bgColor="rgba(24, 113, 99, 0.06)"
            borderColor="rgba(24, 113, 99, 0.12)"
          />
          <StatBadge
            icon={<TextFields sx={{ fontSize: "13px" }} />}
            value={`${wordCount}`}
            label="words"
            color="#4CAF50"
            bgColor="rgba(76, 175, 80, 0.06)"
            borderColor="rgba(76, 175, 80, 0.12)"
          />
          <StatBadge
            icon={<AccessTime sx={{ fontSize: "13px" }} />}
            value={`${readingTime} min`}
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
    justifyContent="center"
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
        fontSize: "11px",
        fontWeight: 700,
        color,
        fontFamily: "Lato",
        lineHeight: 1,
        textAlign: "center",
      }}
    >
      {value}
    </Typography>
    {label && (
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
    )}
  </Stack>
);
