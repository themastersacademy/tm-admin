"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Stack,
  Typography,
  Button,
  IconButton,
  Divider,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";

export default function AnnouncementDialog({
  isOpen,
  onClose,
  announcement,
  onSuccess,
}) {
  const { showSnackbar } = useSnackbar();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (announcement) {
        setTitle(announcement.title);
        setMessage(announcement.message);
        setType(announcement.type);
        setIsActive(announcement.isActive);
      } else {
        setTitle("");
        setMessage("");
        setType("info");
        setIsActive(true);
      }
    }
  }, [isOpen, announcement]);

  const handleSave = async () => {
    if (!title || !message) {
      showSnackbar("Title and message are required", "error", "", "3000");
      return;
    }

    setIsSaving(true);

    try {
      const method = announcement ? "PUT" : "POST";
      const body = announcement
        ? {
            announcementID: announcement.announcementID,
            title,
            message,
            type,
            isActive,
          }
        : { title, message, type, isActive };

      const data = await apiFetch("/api/homepage/announcements", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (data.success) {
        showSnackbar(
          announcement ? "Announcement updated" : "Announcement created",
          "success",
          "",
          "3000"
        );
        onSuccess();
        onClose();
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
    } catch (error) {
      console.error("Error saving announcement:", error);
      showSnackbar("Error saving announcement", "error", "", "3000");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          border: "1px solid var(--border-color)",
        },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        padding="24px 24px 20px 24px"
      >
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--text1)",
          }}
        >
          {announcement ? "Edit Announcement" : "Create Announcement"}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Stack>

      <Divider />

      <DialogContent sx={{ padding: "24px" }}>
        <Stack gap="20px">
          <Stack gap="8px">
            <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
              Title *
            </Typography>
            <StyledTextField
              placeholder="Enter announcement title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Stack>

          <Stack gap="8px">
            <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
              Message *
            </Typography>
            <StyledTextField
              placeholder="Enter announcement message"
              value={message}
              multiline
              rows={3}
              onChange={(e) => setMessage(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "auto",
                  alignItems: "flex-start",
                  padding: "12px 14px",
                },
              }}
            />
          </Stack>

          <Stack gap="8px">
            <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
              Type
            </Typography>
            <StyledTextField
              select
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value="info">Info</MenuItem>
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="error">Error</MenuItem>
            </StyledTextField>
          </Stack>

          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            }
            label="Active (visible to users)"
          />
        </Stack>
      </DialogContent>

      <Divider />

      <Stack
        direction="row"
        justifyContent="flex-end"
        gap="12px"
        padding="20px 24px"
      >
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={isSaving}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            padding: "8px 24px",
            fontWeight: 600,
            borderColor: "var(--border-color)",
            color: "var(--text2)",
            "&:hover": {
              borderColor: "var(--text3)",
              backgroundColor: "transparent",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving || !title || !message}
          sx={{
            background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
            color: "#FFFFFF",
            textTransform: "none",
            borderRadius: "8px",
            padding: "8px 24px",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": {
              background: "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
              boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
            },
            "&:disabled": {
              backgroundColor: "var(--text3)",
              color: "var(--white)",
              opacity: 0.5,
            },
          }}
        >
          {isSaving ? "Saving..." : announcement ? "Update" : "Create"}
        </Button>
      </Stack>
    </Dialog>
  );
}
