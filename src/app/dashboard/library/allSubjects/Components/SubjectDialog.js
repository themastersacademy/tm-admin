"use client";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { Close, East, Category } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  InputAdornment,
  Box,
  Dialog,
  Fade,
} from "@mui/material";

export default function SubjectDialog({
  isOpen,
  onClose,
  title,
  setTitle,
  onSubmit,
  isLoading,
  isEdit,
}) {
  return (
    <Dialog
      open={isOpen}
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
              boxShadow: "0 8px 16px rgba(33, 150, 243, 0.2)",
            }}
          >
            <Category sx={{ fontSize: "32px", color: "#fff" }} />
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
              {isEdit ? "Edit Subject" : "Create New Subject"}
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "var(--text3)" }}>
              {isEdit
                ? "Update subject details"
                : "Add a new subject to the library"}
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
                Subject Details
              </Typography>

              <StyledTextField
                fullWidth
                placeholder="Subject Name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Category sx={{ color: "var(--text3)" }} />
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
              onClick={onSubmit}
              disabled={isLoading || !title.trim()}
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
                  <span>{isEdit ? "Save Changes" : "Create Subject"}</span>
                  <East sx={{ fontSize: "20px" }} />
                </Stack>
              )}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
