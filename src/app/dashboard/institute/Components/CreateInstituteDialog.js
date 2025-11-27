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
  Fade,
  CircularProgress,
  Box,
} from "@mui/material";
import {
  Close,
  Business,
  EmailOutlined,
  DomainAdd,
  CheckCircleOutline,
} from "@mui/icons-material";

export default function CreateInstituteDialog({
  open,
  onClose,
  onSubmit,
  isLoading,
}) {
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setTitle("");
      setEmail("");
      setErrors({});
    }
  }, [open]);

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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 24px 48px rgba(0,0,0,0.1)",
        },
      }}
      TransitionComponent={Fade}
      transitionDuration={400}
    >
      {/* Header Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #FFF3E0 0%, #FFFFFF 100%)",
          padding: "32px 32px 24px",
          borderBottom: "1px solid rgba(255, 152, 0, 0.1)",
          position: "relative",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: "24px",
            top: "24px",
            color: "var(--text3)",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
          }}
        >
          <Close />
        </IconButton>

        <Stack direction="row" gap="20px" alignItems="center">
          <Stack
            sx={{
              width: "64px",
              height: "64px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 8px 16px rgba(255, 152, 0, 0.2)",
            }}
          >
            <DomainAdd sx={{ fontSize: "32px", color: "#fff" }} />
          </Stack>
          <Stack>
            <Typography
              sx={{
                fontSize: "24px",
                fontWeight: 800,
                color: "var(--text1)",
                fontFamily: "Lato",
                mb: "4px",
              }}
            >
              Create New Institute
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "var(--text3)" }}>
              Set up a new institute workspace
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <DialogContent sx={{ padding: "32px" }}>
        <Stack gap="24px">
          {/* Input Fields */}
          <Stack gap="20px">
            <Stack gap="8px">
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text2)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  ml: "4px",
                }}
              >
                Institute Details
              </Typography>

              <TextField
                fullWidth
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
                      <Business sx={{ color: "var(--text3)" }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: "12px",
                    backgroundColor: "var(--bg-color)",
                    "& fieldset": { border: "1px solid transparent" },
                    "&:hover fieldset": {
                      border: "1px solid var(--primary-color) !important",
                    },
                    "&.Mui-focused fieldset": {
                      border: "1px solid var(--primary-color) !important",
                    },
                    transition: "all 0.2s ease",
                  },
                }}
              />

              <TextField
                fullWidth
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
                      <EmailOutlined sx={{ color: "var(--text3)" }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: "12px",
                    backgroundColor: "var(--bg-color)",
                    "& fieldset": { border: "1px solid transparent" },
                    "&:hover fieldset": {
                      border: "1px solid var(--primary-color) !important",
                    },
                    "&.Mui-focused fieldset": {
                      border: "1px solid var(--primary-color) !important",
                    },
                    transition: "all 0.2s ease",
                  },
                }}
              />
            </Stack>
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" gap="12px" pt="12px">
            <Button
              fullWidth
              onClick={onClose}
              sx={{
                height: "52px",
                borderRadius: "12px",
                color: "var(--text2)",
                fontWeight: 600,
                fontSize: "15px",
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
              sx={{
                height: "52px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
                fontWeight: 700,
                fontSize: "15px",
                textTransform: "none",
                boxShadow: "0 8px 20px rgba(255, 152, 0, 0.25)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
                  boxShadow: "0 12px 24px rgba(255, 152, 0, 0.35)",
                },
                "&.Mui-disabled": {
                  background: "#e0e0e0",
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: "var(--text2)" }} />
              ) : (
                <Stack direction="row" alignItems="center" gap="8px">
                  <span>Create Institute</span>
                  <CheckCircleOutline sx={{ fontSize: "20px" }} />
                </Stack>
              )}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
