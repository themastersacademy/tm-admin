"use client";
import { useState, useEffect } from "react";
import {
  Button,
  CircularProgress,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import {
  Close,
  East,
  VideoLibrary,
  Description,
  Language,
} from "@mui/icons-material";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";

export default function CreateCourseDialog({
  isOpen,
  onCourseCreate,
  creatingCourse,
  onClose,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    language: "English",
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        description: "",
        language: "English",
      });
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onCourseCreate(formData);
  };

  return (
    <DialogBox
      isOpen={isOpen}
      title="Create New Course"
      actionText="Create Course"
      icon={
        <IconButton
          sx={{ borderRadius: "10px", padding: "6px" }}
          onClick={onClose}
        >
          <Close />
        </IconButton>
      }
      actionButton={
        <Button
          variant="contained"
          endIcon={<East />}
          sx={{
            textTransform: "none",
            backgroundColor: "var(--primary-color)",
            borderRadius: "8px",
            padding: "8px 24px",
          }}
          disabled={creatingCourse || !formData.title.trim()}
          onClick={handleSubmit}
          disableElevation
        >
          {creatingCourse ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Create Course"
          )}
        </Button>
      }
    >
      <DialogContent sx={{ padding: "24px" }}>
        <Stack gap="20px">
          {/* Banner / Info */}
          <Box
            sx={{
              backgroundColor: "var(--primary-color-acc-1)",
              borderRadius: "12px",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <Box
              sx={{
                backgroundColor: "var(--white)",
                borderRadius: "50%",
                padding: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <VideoLibrary
                sx={{ color: "var(--primary-color)", fontSize: "24px" }}
              />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: "Lato",
                  fontWeight: 700,
                  fontSize: "14px",
                  color: "var(--text1)",
                }}
              >
                Start a New Course
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Lato",
                  fontSize: "12px",
                  color: "var(--text2)",
                }}
              >
                Fill in the details below to create a structured video course
                for your students.
              </Typography>
            </Box>
          </Box>

          {/* Title Field */}
          <Stack gap="8px">
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--text1)",
              }}
            >
              Course Title*
            </Typography>
            <StyledTextField
              placeholder="e.g., Advanced Thermodynamics"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              fullWidth
            />
          </Stack>

          {/* Description Field */}
          <Stack gap="8px">
            <Stack flexDirection="row" gap="8px" alignItems="center">
              <Description sx={{ fontSize: "16px", color: "var(--text3)" }} />
              <Typography
                sx={{
                  fontFamily: "Lato",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "var(--text1)",
                }}
              >
                Description
              </Typography>
            </Stack>
            <StyledTextField
              placeholder="Briefly describe what this course is about..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </Stack>

          {/* Language Field */}
          <Stack gap="8px">
            <Stack flexDirection="row" gap="8px" alignItems="center">
              <Language sx={{ fontSize: "16px", color: "var(--text3)" }} />
              <Typography
                sx={{
                  fontFamily: "Lato",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "var(--text1)",
                }}
              >
                Primary Language
              </Typography>
            </Stack>
            <FormControl fullWidth size="small">
              <Select
                value={formData.language}
                onChange={(e) => handleChange("language", e.target.value)}
                sx={{
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-color)",
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  fontFamily: "Lato",
                  fontSize: "14px",
                }}
              >
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Tamil">Tamil</MenuItem>
                <MenuItem value="Hindi">Hindi</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </DialogContent>
    </DialogBox>
  );
}
