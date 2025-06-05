import DialogBox from "@/src/components/DialogBox/DialogBox";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { Close, East } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  DialogContent,
  IconButton,
} from "@mui/material";
import { useState, useEffect } from "react";

export default function VideoDialog({
  isOpen,
  onCourseCreate,
  creatingCourse,
  onClose,
}) {
  const [title, setTitle] = useState("");

  // Reset title when dialog closes
  useEffect(() => {
    if (!isOpen) setTitle("");
  }, [isOpen]);

  return (
    <DialogBox
      isOpen={isOpen}
      title="Add Course"
      actionText="Create"
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
          variant="text"
          endIcon={<East />}
          sx={{ textTransform: "none", color: "var(--primary-color)" }}
          disabled={creatingCourse || !title.trim()} // Disable if title is empty or loading
          onClick={() => onCourseCreate(title)}
        >
          {creatingCourse ? (
            <CircularProgress size={24} color="var(--primary)" />
          ) : (
            "Add Course"
          )}
        </Button>
      }
    >
      <DialogContent>
        <StyledTextField
          placeholder="Enter video Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </DialogContent>
    </DialogBox>
  );
}