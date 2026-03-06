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

  const { type, name } = resource;
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
    if (isVideo) return <VideoLibraryOutlined sx={{ fontSize: "18px" }} />;
    if (name.endsWith(".pdf"))
      return <PictureAsPdfOutlined sx={{ fontSize: "18px" }} />;
    if (name.match(/\.(jpg|jpeg|png|gif)$/i))
      return <ImageOutlined sx={{ fontSize: "18px" }} />;
    return <InsertDriveFileOutlined sx={{ fontSize: "18px" }} />;
  };

  const getColor = () => {
    if (isVideo) return "#F44336";
    if (name.endsWith(".pdf")) return "#FF9800";
    if (name.match(/\.(jpg|jpeg|png|gif)$/i)) return "#4CAF50";
    return "#2196F3";
  };

  const color = getColor();

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        borderRadius: "10px",
        border: "1px solid var(--border-color)",
        backgroundColor: "var(--white)",
        position: "relative",
        overflow: "visible",
        "&:hover": {
          borderColor: color,
        },
      }}
    >
      <CardActionArea
        onClick={() => handleAction(isVideo ? "play" : "preview")}
        sx={{ padding: "12px" }}
      >
        <Stack direction="row" alignItems="center" gap="10px">
          <Box
            sx={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: `${color}12`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: color,
              flexShrink: 0,
            }}
          >
            {getIcon()}
          </Box>

          <Stack gap="2px" sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text1)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                lineHeight: 1.3,
              }}
              title={name}
            >
              {name}
            </Typography>
            <Stack direction="row" alignItems="center" gap="6px">
              <Chip
                label={isVideo ? "Stream" : name.split(".").pop().toUpperCase()}
                size="small"
                sx={{
                  height: "18px",
                  fontSize: "9px",
                  fontWeight: 600,
                  backgroundColor: `${color}10`,
                  color: color,
                  borderRadius: "4px",
                  "& .MuiChip-label": { px: "6px" },
                }}
              />
              {resource.createdAt && (
                <Typography sx={{ fontSize: "10px", color: "var(--text4)" }}>
                  {new Date(resource.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Stack>
      </CardActionArea>

      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          position: "absolute",
          top: "10px",
          right: "8px",
          color: "var(--text3)",
          zIndex: 1,
          padding: "4px",
          "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
        }}
      >
        <MoreVert sx={{ fontSize: "16px" }} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.08))",
            mt: 1,
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            minWidth: "140px",
            "& .MuiMenuItem-root": {
              fontSize: "13px",
              fontWeight: 600,
              gap: "8px",
              py: 1,
              px: 2,
            },
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
          sx={{ color: "var(--text1)" }}
        >
          {isVideo ? (
            <PlayCircleOutline sx={{ fontSize: "16px", color }} />
          ) : (
            <ImageOutlined sx={{ fontSize: "16px", color }} />
          )}
          {isVideo ? "Play" : "Preview"}
        </MenuItem>
        {!isVideo && (
          <MenuItem
            onClick={() => {
              handleClose();
              onAction("download", resource);
            }}
            sx={{ color: "var(--text1)" }}
          >
            <FileDownloadOutlined
              sx={{ fontSize: "16px", color: "var(--primary-color)" }}
            />
            Download
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            handleClose();
            onAction("delete", resource);
          }}
          sx={{ color: "var(--delete-color)" }}
        >
          <DeleteOutline sx={{ fontSize: "16px" }} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
}
