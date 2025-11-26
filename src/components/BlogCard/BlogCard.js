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
  Article,
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

export default function BlogCard({
  title,
  description,
  createdAt,
  onView,
  onEdit,
  onDelete,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const wordCount = getWordCount(description);
  const readingTime = getReadingTime(description);
  const excerpt = getExcerpt(description, 120);
  const formattedDate = formatDate(createdAt);

  return (
    <Card
      sx={{
        width: "100%",
        maxWidth: "380px",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        backgroundColor: "var(--white)",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
          borderColor: "var(--primary-color)",
        },
      }}
      elevation={0}
    >
      <Stack padding="20px" gap="16px">
        {/* Header with Icon and Menu */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Stack
            sx={{
              width: "40px",
              height: "40px",
              backgroundColor: "rgba(var(--primary-rgb), 0.1)",
              borderRadius: "10px",
              justifyContent: "center",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <Article sx={{ fontSize: "20px", color: "var(--primary-color)" }} />
          </Stack>

          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{
              "&:hover": {
                backgroundColor: "rgba(var(--primary-rgb), 0.05)",
              },
            }}
          >
            <MoreVert sx={{ fontSize: "18px" }} />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                borderRadius: "8px",
                minWidth: "140px",
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                onView();
              }}
              sx={{ fontSize: "14px", gap: "8px", fontWeight: 500 }}
            >
              <Visibility fontSize="small" /> View
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                onEdit();
              }}
              sx={{ fontSize: "14px", gap: "8px", fontWeight: 500 }}
            >
              <Edit fontSize="small" /> Edit
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleMenuClose();
                onDelete();
              }}
              sx={{
                fontSize: "14px",
                gap: "8px",
                fontWeight: 500,
                color: "var(--delete-color)",
              }}
            >
              <Delete fontSize="small" /> Delete
            </MenuItem>
          </Menu>
        </Stack>

        {/* Title */}
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--text1)",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </Typography>

        {/* Excerpt */}
        {excerpt && (
          <Typography
            sx={{
              fontSize: "13px",
              color: "var(--text3)",
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {excerpt}
          </Typography>
        )}

        <Divider />

        {/* Metadata */}
        <Stack gap="8px">
          <Stack direction="row" alignItems="center" gap="8px">
            <CalendarToday sx={{ fontSize: "14px", color: "var(--text3)" }} />
            <Typography
              sx={{ fontSize: "12px", color: "var(--text3)", fontWeight: 500 }}
            >
              {formattedDate}
            </Typography>
          </Stack>

          <Stack direction="row" gap="16px">
            <Stack direction="row" alignItems="center" gap="6px">
              <TextFields sx={{ fontSize: "14px", color: "var(--text3)" }} />
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "var(--text3)",
                  fontWeight: 500,
                }}
              >
                {wordCount} words
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" gap="6px">
              <AccessTime sx={{ fontSize: "14px", color: "var(--text3)" }} />
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "var(--text3)",
                  fontWeight: 500,
                }}
              >
                {readingTime} min read
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}
