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
  Chip,
} from "@mui/material";
import {
  Close,
  ClassOutlined,
  School,
  LocalOfferOutlined,
} from "@mui/icons-material";

export default function CreateBatchDialog({
  open,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}) {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.title || "");
        setTags(initialData.tags || []);
      } else {
        setTitle("");
        setTags([]);
      }
      setTagInput("");
      setErrors({});
    }
  }, [open, initialData]);

  const validate = () => {
    let tempErrors = {};
    if (!title.trim()) tempErrors.title = "Batch name is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({ title, tags });
    }
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
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
            <School sx={{ fontSize: "18px", color: "#fff" }} />
          </Stack>
          <Stack>
            <Typography
              sx={{ fontSize: "15px", fontWeight: 700, color: "var(--text1)" }}
            >
              {isEdit ? "Edit Batch" : "Create Batch"}
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "var(--text4)" }}>
              {isEdit ? "Update batch details" : "Add a new batch"}
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
              Batch Name*
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. Class 10 - Science"
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
                    <ClassOutlined sx={{ color: "var(--text4)", fontSize: "18px" }} />
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
              Departments (Tags)
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Add department and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalOfferOutlined sx={{ color: "var(--text4)", fontSize: "18px" }} />
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
            {tags.length > 0 && (
              <Stack direction="row" flexWrap="wrap" gap="6px" mt="4px">
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    onDelete={() => handleDeleteTag(tag)}
                    sx={{
                      backgroundColor: "rgba(24, 113, 99, 0.08)",
                      color: "var(--primary-color)",
                      fontWeight: 600,
                      fontSize: "11px",
                      height: "24px",
                      borderRadius: "6px",
                    }}
                  />
                ))}
              </Stack>
            )}
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
                "Update Batch"
              ) : (
                "Create Batch"
              )}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
