"use client";
import {
  MoreVert,
  InsertDriveFile,
  EditRounded,
  DeleteRounded,
  AccessTime,
  HelpOutline,
} from "@mui/icons-material";
import {
  Card,
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

  // Format date if provided, else use current date as fallback or hide
  const formattedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  return (
    <Card
      onClick={onClick}
      elevation={0}
      sx={{
        width: "100%",
        // maxWidth: "350px", // Removed to allow grid to control width
        minWidth: "280px",
        p: "20px",
        borderRadius: "16px",
        border: "1px solid var(--border-color)",
        backgroundColor: "var(--white)",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "visible",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.08)",
          borderColor: "var(--primary-color)",
          "& .icon-box": {
            backgroundColor: "var(--primary-color)",
            color: "white",
            transform: "scale(1.1) rotate(-5deg)",
          },
        },
      }}
    >
      <Stack gap="20px">
        {/* Header: Icon & Menu */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box
            className="icon-box"
            sx={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "rgba(102, 126, 234, 0.08)",
              color: "var(--primary-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
            }}
          >
            <InsertDriveFile sx={{ fontSize: "24px" }} />
          </Box>

          <IconButton
            onClick={handleMenuClick}
            size="small"
            sx={{
              color: "var(--text3)",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Stack>

        {/* Content: Title & Stats */}
        <Stack gap="8px">
          <Typography
            variant="h6"
            sx={{
              fontFamily: "Lato",
              fontWeight: "700",
              fontSize: "18px",
              color: "var(--text1)",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              minHeight: "46px", // Ensure consistent height for 2 lines
            }}
          >
            {title}
          </Typography>

          <Stack direction="row" gap="12px" alignItems="center" flexWrap="wrap">
            <Chip
              icon={<HelpOutline sx={{ fontSize: "14px !important" }} />}
              label={`${totalQuestions} Questions`}
              size="small"
              sx={{
                height: "24px",
                backgroundColor: "rgba(102, 126, 234, 0.06)",
                color: "var(--primary-color)",
                fontSize: "11px",
                fontWeight: "600",
                borderRadius: "6px",
                "& .MuiChip-icon": { color: "inherit" },
              }}
            />
            {updatedAt && (
              <Stack direction="row" gap="4px" alignItems="center">
                <AccessTime sx={{ fontSize: "14px", color: "var(--text3)" }} />
                <Typography
                  sx={{
                    fontSize: "11px",
                    color: "var(--text3)",
                    fontWeight: "500",
                  }}
                >
                  {formattedDate}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>

      {/* Action Menu */}
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
              fontWeight: "600",
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
