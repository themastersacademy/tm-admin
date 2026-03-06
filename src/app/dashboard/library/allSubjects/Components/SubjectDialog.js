"use client";
import { Close, Category, InfoOutlined } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
  TextField,
  Dialog,
  Grid,
  Box,
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
  const MAX_LENGTH = 80;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          padding: "24px 28px",
          backgroundColor: "var(--primary-color)",
          color: "white",
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Category sx={{ fontSize: "28px" }} />
          <Typography variant="h5" fontWeight={700} fontFamily="Lato">
            {isEdit ? "Edit Subject" : "Create New Subject"}
          </Typography>
        </Stack>
        <IconButton
          onClick={onClose}
          sx={{
            color: "white",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
          }}
        >
          <Close />
        </IconButton>
      </Stack>

      {/* Content */}
      <Grid container>
        {/* Left: Form */}
        <Grid item xs={12} md={7} sx={{ padding: "32px" }}>
          <Stack gap={3}>
            <Stack gap={1}>
              <Typography fontSize="14px" fontWeight={600} color="var(--text1)">
                Subject Name
              </Typography>
              <TextField
                autoFocus
                fullWidth
                placeholder="e.g., Mathematics, Physics, Chemistry"
                value={title}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_LENGTH) {
                    setTitle(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading && title.trim()) {
                    onSubmit();
                  }
                }}
                InputProps={{
                  sx: {
                    borderRadius: "12px",
                    backgroundColor: "var(--bg-color)",
                    fontSize: "15px",
                    "& fieldset": {
                      borderColor: "var(--border-color)",
                    },
                    "&:hover fieldset": {
                      borderColor: "var(--primary-color)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--primary-color)",
                    },
                  },
                }}
              />
              <Stack direction="row" justifyContent="space-between">
                <Typography fontSize="12px" color="var(--text3)">
                  {title.length}/{MAX_LENGTH} characters
                </Typography>
                {title.trim().length > 0 && (
                  <Typography fontSize="12px" color="var(--success-color)">
                    Valid name
                  </Typography>
                )}
              </Stack>
            </Stack>

            <Stack
              gap={1.5}
              sx={{
                padding: "16px",
                borderRadius: "12px",
                backgroundColor: "rgba(24, 113, 99, 0.04)",
                border: "1px solid rgba(24, 113, 99, 0.15)",
              }}
            >
              <Stack direction="row" gap={1} alignItems="center">
                <InfoOutlined
                  sx={{ fontSize: "18px", color: "var(--primary-color)" }}
                />
                <Typography
                  fontSize="14px"
                  fontWeight={600}
                  color="var(--primary-color)"
                >
                  {isEdit ? "About Editing" : "Tips"}
                </Typography>
              </Stack>
              <Stack gap={0.5}>
                {isEdit ? (
                  <Typography fontSize="13px" color="var(--text2)">
                    Renaming a subject will update it across all linked
                    questions and tests.
                  </Typography>
                ) : (
                  <>
                    <Typography fontSize="13px" color="var(--text2)">
                      Use descriptive names for easy identification
                    </Typography>
                    <Typography fontSize="13px" color="var(--text2)">
                      Subjects help organize questions into categories
                    </Typography>
                    <Typography fontSize="13px" color="var(--text2)">
                      You can add questions to subjects after creation
                    </Typography>
                  </>
                )}
              </Stack>
            </Stack>

            <Stack direction="row" gap={2} mt={1}>
              <Button
                onClick={onClose}
                variant="outlined"
                fullWidth
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  height: "44px",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--text2)",
                  borderColor: "var(--border-color)",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={onSubmit}
                variant="contained"
                disabled={isLoading || !title.trim()}
                fullWidth
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  height: "44px",
                  fontSize: "15px",
                  fontWeight: 600,
                  backgroundColor: "var(--primary-color)",
                  boxShadow: "0 4px 15px rgba(24, 113, 99, 0.3)",
                  "&:hover": {
                    backgroundColor: "var(--primary-color-dark)",
                    boxShadow: "0 6px 20px rgba(24, 113, 99, 0.4)",
                  },
                  "&.Mui-disabled": {
                    background: "var(--border-color)",
                    color: "var(--text3)",
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={20} sx={{ color: "white" }} />
                ) : isEdit ? (
                  "Save Changes"
                ) : (
                  "Create Subject"
                )}
              </Button>
            </Stack>
          </Stack>
        </Grid>

        {/* Right: Preview */}
        <Grid
          item
          xs={12}
          md={5}
          sx={{
            padding: "32px",
            backgroundColor: "var(--bg-color)",
            borderLeft: "1px solid var(--border-color)",
          }}
        >
          <Stack gap={2}>
            <Typography fontSize="14px" fontWeight={600} color="var(--text1)">
              Preview
            </Typography>

            <Box
              sx={{
                padding: "20px",
                borderRadius: "16px",
                border: "1px solid var(--border-color)",
                backgroundColor: "white",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
                },
              }}
            >
              <Stack gap={2}>
                <Stack direction="row" gap={2} alignItems="center">
                  <Box
                    sx={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      backgroundColor: "var(--primary-color)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "white",
                    }}
                  >
                    <Category sx={{ fontSize: "24px" }} />
                  </Box>
                  <Stack flex={1}>
                    <Typography
                      fontSize="15px"
                      fontWeight={600}
                      color="var(--text1)"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {title || "Your Subject Name"}
                    </Typography>
                    <Typography fontSize="12px" color="var(--text3)">
                      0 Questions
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Dialog>
  );
}
