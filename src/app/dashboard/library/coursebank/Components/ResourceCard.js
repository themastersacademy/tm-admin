import React, { useState } from "react";
import {
  MoreVert,
  DeleteOutline,
  PlayCircleOutline,
  FileDownloadOutlined,
  InsertDriveFileOutlined,
  VideoLibraryOutlined,
  ImageOutlined,
  PictureAsPdfOutlined,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardActionArea,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  Chip,
} from "@mui/material";

export default function ResourceCard({ resource, onAction }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const { type, name, path } = resource;
  const isVideo = type === "VIDEO";

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    handleClose();
    onAction(action, resource);
  };

  const getIcon = () => {
    if (isVideo) return <VideoLibraryOutlined sx={{ fontSize: "32px" }} />;
    if (name.endsWith(".pdf"))
      return <PictureAsPdfOutlined sx={{ fontSize: "32px" }} />;
    if (name.match(/\.(jpg|jpeg|png|gif)$/i))
      return <ImageOutlined sx={{ fontSize: "32px" }} />;
    return <InsertDriveFileOutlined sx={{ fontSize: "32px" }} />;
  };

  const getColor = () => {
    if (isVideo) return "#F44336"; // Red for video
    if (name.endsWith(".pdf")) return "#FF9800"; // Orange for PDF
    if (name.match(/\.(jpg|jpeg|png|gif)$/i)) return "#4CAF50"; // Green for images
    return "#2196F3"; // Blue for others
  };

  const color = getColor();

  return (
    <Card
      elevation={0}
      sx={{
        width: "280px",
        borderRadius: "16px",
        border: "1px solid var(--border-color)",
        transition: "all 0.2s ease-in-out",
        backgroundColor: "var(--white)",
        position: "relative",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.08)",
          borderColor: color,
          "& .resource-icon": {
            transform: "scale(1.1)",
          },
        },
      }}
    >
      <CardActionArea
        onClick={() => handleAction(isVideo ? "play" : "preview")}
        sx={{ padding: "20px" }}
      >
        <Stack gap="16px">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box
              className="resource-icon"
              sx={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                backgroundColor: `${color}15`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: color,
                transition: "all 0.2s ease",
              }}
            >
              {getIcon()}
            </Box>
            <Box sx={{ width: "40px", height: "40px" }} />
          </Stack>

          <Box>
            <Typography
              sx={{
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--text1)",
                mb: "6px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontFamily: "Lato",
              }}
              title={name}
            >
              {name}
            </Typography>
            <Stack direction="row" alignItems="center" gap="8px">
              <Chip
                label={isVideo ? "Stream" : name.split(".").pop().toUpperCase()}
                size="small"
                sx={{
                  height: "22px",
                  fontSize: "10px",
                  fontWeight: 600,
                  backgroundColor: `${color}10`,
                  color: color,
                  borderRadius: "6px",
                }}
              />
              <Typography sx={{ fontSize: "11px", color: "var(--text3)" }}>
                {resource.createdAt
                  ? new Date(resource.createdAt).toLocaleDateString()
                  : ""}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </CardActionArea>

      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          position: "absolute",
          top: "20px",
          right: "20px",
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
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            minWidth: "160px",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            onAction(isVideo ? "play" : "preview", resource);
          }}
          sx={{ fontSize: "14px", gap: "12px" }}
        >
          {isVideo ? (
            <PlayCircleOutline fontSize="small" />
          ) : (
            <ImageOutlined fontSize="small" />
          )}
          {isVideo ? "Play Video" : "Preview"}
        </MenuItem>
        {!isVideo && (
          <MenuItem
            onClick={() => {
              handleClose();
              onAction("download", resource);
            }}
            sx={{ fontSize: "14px", gap: "12px" }}
          >
            <FileDownloadOutlined fontSize="small" />
            Download
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            handleClose();
            onAction("delete", resource);
          }}
          sx={{ fontSize: "14px", gap: "12px", color: "var(--delete-color)" }}
        >
          <DeleteOutline fontSize="small" />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
}
