"use client";
import CourseCard from "@/src/components/CourseCard/CourseCard";
import StyledSelect from "@/src/components/StyledSelect/StyledSelect";
import { Add, Close, East } from "@mui/icons-material";
import videoThumbnail from "@/public/Images/videoThumbnail.svg";
import {
  Button,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import DialogBox from "@/src/components/DialogBox/DialogBox";

export default function BatchCourse() {
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [courseList, setCourseList] = useState([
    {
      title: "Linear Algebra",
      thumbnail: videoThumbnail.src,
      Language: "English",
      lesson: "16 Lessons",
      hours: "48 Hours",
    },
    {
      title: "Calculus",
      thumbnail: videoThumbnail.src,
      Language: "English",
      lesson: "20 Lessons",
      hours: "60 Hours",
    },
    {
      title: "Discrete Mathematics",
      thumbnail: videoThumbnail.src,
      Language: "English",
      lesson: "14 Lessons",
      hours: "40 Hours",
    },
  ]);

  const handleCourseDialog = (open) => setIsCourseDialogOpen(open);
  return (
    <Stack
      sx={{
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        padding: "20px",
        backgroundColor: "var(--white)",
        minHeight: "100vh",
        gap: "20px",
        marginTop: "20px",
      }}
    >
      <Stack flexDirection="row" justifyContent="space-between">
        <Typography sx={{ fontSize: "20px", fontWeight: "700" }}>
          Courses
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleCourseDialog(true)}
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
            fontFamily: "Lato",
          }}
          disableElevation
        >
          Course
        </Button>
      </Stack>
      <CourseDialog
        courseList={courseList}
        isCourseDialogOpen={isCourseDialogOpen}
        handleCourseDialog={handleCourseDialog}
      />
      <Stack flexDirection="row" flexWrap="wrap" rowGap="15px" columnGap="30px">
        {courseList.map((course, index) => (
          <CourseCard
            key={index}
            {...course}
            actionButton={
              <Button
                variant="text"
                sx={{
                  textTransform: "none",
                  color: "var(--sec-color)",
                  fontFamily: "Lato",
                  fontSize: "12px",
                  padding: "4px",
                }}
              >
                Remove
              </Button>
            }
          />
        ))}
      </Stack>
    </Stack>
  );
}

const CourseDialog = ({
  isCourseDialogOpen,
  handleCourseDialog,
  courseList,
  selectedCourses,
}) => {
  return (
    <DialogBox
      isOpen={isCourseDialogOpen}
      title="Add courses"
      icon={
        <IconButton
          sx={{ padding: "4px", borderRadius: "8px" }}
          onClick={() => handleCourseDialog(false)}
        >
          <Close />
        </IconButton>
      }
      actionButton={
        <Button
          variant="text"
          endIcon={<East />}
          sx={{
            textTransform: "none",
            color: "var(--primary-color)",
          }}
        >
          Add
        </Button>
      }
    >
      <DialogContent>
        <Stack width="100%">
          <StyledSelect title="Select Goal"  />
        </Stack>
      </DialogContent>
    </DialogBox>
  );
};
