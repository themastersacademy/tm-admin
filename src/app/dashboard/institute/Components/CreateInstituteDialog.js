import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Stack,
  Typography,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  Business,
  EmailOutlined,
  DomainAdd,
} from "@mui/icons-material";

export default function CreateInstituteDialog({
  open,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}) {
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.title || "");
        setEmail(initialData.email || "");
      } else {
        setTitle("");
        setEmail("");
      }
      setErrors({});
    }
  }, [open, initialData]);

  const validate = () => {
    let tempErrors = {};
    if (!title.trim()) tempErrors.title = "Institute name is required";
    if (!email.trim()) tempErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = "Email is invalid";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({ title, email });
    }
  };

  const isEdit = !!initialData;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "14px",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <Stack direction="row" alignItems="center" gap="10px">
          <Stack
            sx={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "var(--primary-color)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <DomainAdd sx={{ fontSize: "18px", color: "#fff" }} />
          </Stack>
          <Stack>
            <Typography
              sx={{ fontSize: "15px", fontWeight: 700, color: "var(--text1)" }}
            >
              {isEdit ? "Edit Institute" : "Create Institute"}
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "var(--text4)" }}>
              {isEdit ? "Update institute details" : "Set up a new institute"}
            </Typography>
          </Stack>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <Close sx={{ fontSize: "18px" }} />
        </IconButton>
      </Stack>

      <DialogContent sx={{ padding: "20px" }}>
        <Stack gap="16px">
          <Stack gap="6px">
            <Typography
              sx={{ fontSize: "12px", fontWeight: 700, color: "var(--text2)" }}
            >
              Institute Name*
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Institute Name"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: "" });
              }}
              error={!!errors.title}
              helperText={errors.title}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business sx={{ color: "var(--text4)", fontSize: "18px" }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "8px",
                  fontSize: "13px",
                  backgroundColor: "var(--bg-color)",
                  "& fieldset": { border: "none" },
                },
              }}
            />
          </Stack>

          <Stack gap="6px">
            <Typography
              sx={{ fontSize: "12px", fontWeight: 700, color: "var(--text2)" }}
            >
              Email*
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Official Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined sx={{ color: "var(--text4)", fontSize: "18px" }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "8px",
                  fontSize: "13px",
                  backgroundColor: "var(--bg-color)",
                  "& fieldset": { border: "none" },
                },
              }}
            />
          </Stack>

          {/* Actions */}
          <Stack direction="row" gap="10px" pt="8px">
            <Button
              fullWidth
              onClick={onClose}
              sx={{
                height: "38px",
                borderRadius: "8px",
                color: "var(--text2)",
                fontWeight: 600,
                fontSize: "13px",
                textTransform: "none",
                backgroundColor: "var(--bg-color)",
                "&:hover": { backgroundColor: "var(--border-color)" },
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={isLoading}
              disableElevation
              sx={{
                height: "38px",
                borderRadius: "8px",
                backgroundColor: "var(--primary-color)",
                fontWeight: 600,
                fontSize: "13px",
                textTransform: "none",
                "&:hover": { backgroundColor: "var(--primary-color-dark)" },
                "&.Mui-disabled": { backgroundColor: "#e0e0e0" },
              }}
            >
              {isLoading ? (
                <CircularProgress size={18} sx={{ color: "var(--white)" }} />
              ) : isEdit ? (
                "Update Institute"
              ) : (
                "Create Institute"
              )}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
