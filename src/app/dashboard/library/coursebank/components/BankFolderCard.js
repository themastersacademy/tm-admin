import React, { useState } from "react";
import {
  MoreVert,
  DeleteOutline,
  FolderOutlined,
  ArrowForwardIos,
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
import { useRouter } from "next/navigation";

export default function BankFolderCard({ bank, onDelete }) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    handleClose();
    onDelete(bank.bankID);
  };

  const itemCount = bank.resources?.length || 0;

  return (
    <Card
      elevation={0}
      sx={{
        width: "300px",
        borderRadius: "18px",
        border: "1px solid var(--border-color)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        backgroundColor: "var(--white)",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 20px 40px -10px rgba(102, 126, 234, 0.15)",
          borderColor: "#667eea",
          "& .folder-icon-box": {
            transform: "scale(1.05)",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          },
          "& .folder-icon": {
            color: "white",
          },
          "& .arrow-icon": {
            opacity: 1,
            transform: "translateX(0)",
          },
        },
      }}
    >
      {/* Gradient accent bar */}
      <Box
        sx={{
          height: "4px",
          background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
        }}
      />

      <CardActionArea
        onClick={() =>
          router.push(`/dashboard/library/coursebank/${bank.bankID}`)
        }
        sx={{ padding: "24px" }}
      >
        <Stack gap="20px">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box
              className="folder-icon-box"
              sx={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                background: "rgba(102, 126, 234, 0.1)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transition: "all 0.3s ease",
              }}
            >
              <FolderOutlined
                className="folder-icon"
                sx={{
                  fontSize: "32px",
                  color: "#667eea",
                  transition: "all 0.3s ease",
                }}
              />
            </Box>
            <Box sx={{ width: "40px", height: "40px" }} />
          </Stack>

          <Stack gap="12px">
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography
                sx={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "var(--text1)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily: "Lato",
                  flex: 1,
                  pr: 1,
                }}
                title={bank.title}
              >
                {bank.title}
              </Typography>
              <ArrowForwardIos
                className="arrow-icon"
                sx={{
                  fontSize: "14px",
                  color: "#667eea",
                  opacity: 0,
                  transform: "translateX(-10px)",
                  transition: "all 0.3s ease",
                }}
              />
            </Stack>

            <Stack direction="row" alignItems="center" gap={1.5}>
              <Chip
                label={`${itemCount} ${itemCount === 1 ? "Item" : "Items"}`}
                size="small"
                sx={{
                  height: "26px",
                  fontSize: "12px",
                  fontWeight: 600,
                  backgroundColor: "rgba(102, 126, 234, 0.1)",
                  color: "#667eea",
                  borderRadius: "8px",
                  "& .MuiChip-label": {
                    px: 1.5,
                  },
                }}
              />
              {bank.createdAt && (
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--text3)",
                    fontWeight: 500,
                  }}
                >
                  {new Date(bank.createdAt).toLocaleDateString("en-US", {
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
          top: "28px",
          right: "24px",
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
          onClick={handleDelete}
          sx={{
            gap: "12px",
            color: "var(--error-color)",
            fontSize: "14px",
            fontWeight: 500,
            padding: "10px 16px",
            "&:hover": { backgroundColor: "#FFEBEE" },
          }}
        >
          <DeleteOutline fontSize="small" />
          Delete Folder
        </MenuItem>
      </Menu>
    </Card>
  );
}
