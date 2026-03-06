"use client";
import {
  MoreVert,
  InsertDriveFile,
  EditRounded,
  DeleteRounded,
  HelpOutline,
} from "@mui/icons-material";
import {
  Card,
  CardActionArea,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { useState } from "react";

export default function SubjectCard({
  title,
  totalQuestions,
  updatedAt,
  onClick,
  onEdit,
  onDelete,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) event.stopPropagation();
    setAnchorEl(null);
  };

  const handleEdit = (event) => {
    event.stopPropagation();
    handleMenuClose();
    onEdit();
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    handleMenuClose();
    onDelete();
  };

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        borderRadius: "16px",
        border: "1px solid var(--border-color)",
        backgroundColor: "var(--white)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "visible",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.08)",
          borderColor: "var(--primary-color)",
          "& .subject-icon-box": {
            backgroundColor: "var(--primary-color)",
            color: "white",
            transform: "scale(1.1) rotate(-5deg)",
          },
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ padding: "20px" }}>
        <Stack gap="16px">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box
              className="subject-icon-box"
              sx={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "rgba(24, 113, 99, 0.08)",
                color: "var(--primary-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
            >
              <InsertDriveFile sx={{ fontSize: "24px" }} />
            </Box>
            <Box sx={{ width: "32px", height: "32px" }} />
          </Stack>

          <Stack gap="8px">
            <Typography
              sx={{
                fontFamily: "Lato",
                fontWeight: 700,
                fontSize: "15px",
                color: "var(--text1)",
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                pr: 1,
              }}
              title={title}
            >
              {title}
            </Typography>

            <Stack direction="row" alignItems="center" gap={1.5}>
              <Chip
                icon={<HelpOutline sx={{ fontSize: "14px !important" }} />}
                label={`${totalQuestions} Questions`}
                size="small"
                sx={{
                  height: "24px",
                  fontSize: "11px",
                  fontWeight: 600,
                  backgroundColor: "rgba(24, 113, 99, 0.06)",
                  color: "var(--primary-color)",
                  borderRadius: "6px",
                  "& .MuiChip-icon": { color: "inherit" },
                  "& .MuiChip-label": { px: 1 },
                }}
              />
              {updatedAt && (
                <Typography
                  sx={{
                    fontSize: "11px",
                    color: "var(--text3)",
                    fontWeight: 500,
                  }}
                >
                  {new Date(updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Stack>
      </CardActionArea>

      <IconButton
        onClick={handleMenuClick}
        size="small"
        sx={{
          position: "absolute",
          top: "20px",
          right: "16px",
          color: "var(--text3)",
          zIndex: 1,
          "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
        }}
      >
        <MoreVert fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.08))",
            mt: 1,
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            minWidth: "120px",
            "& .MuiMenuItem-root": {
              fontSize: "13px",
              fontWeight: 600,
              gap: "8px",
              py: 1,
              px: 2,
            },
          },
        }}
      >
        <MenuItem onClick={handleEdit} sx={{ color: "var(--text1)" }}>
          <EditRounded
            sx={{ fontSize: "16px", color: "var(--primary-color)" }}
          />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "var(--delete-color)" }}>
          <DeleteRounded sx={{ fontSize: "16px" }} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
}
