import React, { useState } from "react";
import {
  MoreVert,
  DeleteOutline,
  DriveFileRenameOutline,
  FolderOutlined,
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

export default function BankFolderCard({ bank, onDelete, onRename }) {
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

  const handleRename = (event) => {
    event.stopPropagation();
    handleClose();
    onRename(bank);
  };

  const itemCount = bank.resources?.length || 0;

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        borderRadius: "16px",
        border: "1px solid var(--border-color)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        backgroundColor: "var(--white)",
        position: "relative",
        overflow: "visible",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.08)",
          borderColor: "var(--primary-color)",
          "& .folder-icon-box": {
            backgroundColor: "var(--primary-color)",
            color: "white",
            transform: "scale(1.1) rotate(-5deg)",
          },
        },
      }}
    >
      <CardActionArea
        onClick={() =>
          router.push(`/dashboard/library/coursebank/${bank.bankID}`)
        }
        sx={{ padding: "20px" }}
      >
        <Stack gap="16px">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box
              className="folder-icon-box"
              sx={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "rgba(24, 113, 99, 0.08)",
                color: "var(--primary-color)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transition: "all 0.3s ease",
              }}
            >
              <FolderOutlined sx={{ fontSize: "24px" }} />
            </Box>
            <Box sx={{ width: "32px", height: "32px" }} />
          </Stack>

          <Stack gap="8px">
            <Typography
              sx={{
                fontSize: "15px",
                fontWeight: 700,
                color: "var(--text1)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontFamily: "Lato",
                lineHeight: 1.3,
                pr: 1,
              }}
              title={bank.title}
            >
              {bank.title}
            </Typography>

            <Stack direction="row" alignItems="center" gap={1.5}>
              <Chip
                label={`${itemCount} ${itemCount === 1 ? "Item" : "Items"}`}
                size="small"
                sx={{
                  height: "24px",
                  fontSize: "11px",
                  fontWeight: 600,
                  backgroundColor: "rgba(24, 113, 99, 0.06)",
                  color: "var(--primary-color)",
                  borderRadius: "6px",
                  "& .MuiChip-label": {
                    px: 1.5,
                  },
                }}
              />
              {bank.createdAt && (
                <Typography
                  sx={{
                    fontSize: "11px",
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
        <MenuItem onClick={handleRename} sx={{ color: "var(--text1)" }}>
          <DriveFileRenameOutline
            sx={{ fontSize: "16px", color: "var(--primary-color)" }}
          />
          Rename
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "var(--delete-color)" }}>
          <DeleteOutline sx={{ fontSize: "16px" }} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
}
