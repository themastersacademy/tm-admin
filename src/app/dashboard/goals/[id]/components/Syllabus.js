"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Add,
  Close,
  East,
  InsertDriveFile,
  RemoveCircle,
  TrendingFlat,
} from "@mui/icons-material";
import {
  Stack,
  Typography,
  Button,
  MenuItem,
  IconButton,
  CircularProgress,
  DialogContent,
} from "@mui/material";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import CourseCard from "@/src/components/CourseCard/CourseCard";
import CourseCardSkeleton from "@/src/components/CourseCardSkeleton/CourseCardSkeleton";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import StyledSelect from "@/src/components/StyledSelect/StyledSelect";
import VideoDialog from "./VideoDialog";
import defaultThumbnail from "@/public/Images/defaultThumbnail.svg";

export default function Syllabus({ goal, fetchGoal, goalLoading }) {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const [dialog, setDialog] = useState({
    open: false,
    loading: false,
    title: "",
  });
  const [videoDialog, setVideoDialog] = useState({
    open: false,
    loading: false,
  });
  const [subjects, setSubjects] = useState({ all: [], selected: "" });

  useEffect(() => {
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/subjects/get-all-subjects`
    )
      .then((data) =>
        setSubjects((prev) => ({ ...prev, all: data.data?.subjects || [] }))
      )
      .catch(() => showSnackbar("Failed to fetch subjects", "error"));
  }, []);

  const handleSubjectAction = async (action, subjectID = null) => {
    if (!subjects.selected && action === "add") {
      return showSnackbar("Select subject", "error");
    }

    setDialog((prev) => ({ ...prev, loading: true }));
    const response = await apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/${action}-subject`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalID: goal.goalID,
          subjectID: action === "remove" ? subjectID : subjects.selected,
        }),
      }
    );

    if (response.success) {
      showSnackbar(response.message, "success");
      fetchGoal();
      setDialog({ open: false, loading: false });
      if (action === "add") setSubjects((prev) => ({ ...prev, selected: "" }));
    } else {
      showSnackbar(response.message, "error");
    }
  };

  const handleCourseCreate = async (title) => {
    if (!title) return showSnackbar("Fill all data", "error");

    setVideoDialog((prev) => ({ ...prev, loading: true }));
    const response = await apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/courses/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, goalID: goal.goalID }),
      }
    );

    if (response.success) {
      showSnackbar(response.message, "success");
      fetchGoal();
    } else {
      showSnackbar("Failed to create course", "error");
    }
    setVideoDialog({ open: false, loading: false });
  };

  const openDialog = (type) => {
    if (type === "subject") setDialog({ open: true, loading: false });
    else setVideoDialog({ open: true, loading: false });
  };

  const closeDialog = (type) => {
    if (type === "subject") setDialog({ open: false, loading: false });
    else setVideoDialog({ open: false, loading: false });
  };

  return (
    <Stack
      sx={{
        backgroundColor: "var(--white)",
        padding: "20px",
        gap: "20px",
        minHeight: "100vh",
        borderRadius: "10px",
        border: "1px solid var(--border-color)",
      }}
    >
      {/* Subject Header */}
      <SectionHeader title="Subject" onAdd={() => openDialog("subject")} />

      {/* Subject Dialog */}
      <DialogBox
        isOpen={dialog.open}
        title="Add Subject"
        icon={
          <IconButton
            onClick={() => closeDialog("subject")}
            sx={{ borderRadius: "8px", padding: "4px" }}
          >
            <Close />
          </IconButton>
        }
        actionButton={
          <Button
            variant="text"
            endIcon={<East />}
            onClick={() => handleSubjectAction("add")}
            disabled={dialog.loading}
            sx={{ textTransform: "none", color: "var(--primary-color)" }}
          >
            {dialog.loading ? <CircularProgress size={20} /> : "Add Subject"}
          </Button>
        }
      >
        <DialogContent>
          <StyledSelect
            title="Select Subject"
            value={subjects.selected}
            onChange={(e) =>
              setSubjects((prev) => ({ ...prev, selected: e.target.value }))
            }
            options={subjects.all}
            getLabel={(s) => s.title}
            getValue={(s) => s.subjectID}
          />
        </DialogContent>
      </DialogBox>

      {/* Subject List */}
      <SubjectList
        subjectList={goal.subjectList}
        loading={goalLoading}
        onRemove={handleSubjectAction}
      />

      {/* Video Courses Header */}
      <SectionHeader title="Video Courses" onAdd={() => openDialog("video")} />

      {/* Video Course Dialog */}
      <VideoDialog
        isOpen={videoDialog.open}
        onClose={() => closeDialog("video")}
        onCourseCreate={handleCourseCreate}
        creatingCourse={videoDialog.loading}
      />

      {/* Courses List */}
      <CourseList
        courses={goal.coursesList}
        loading={goalLoading}
        onEdit={(courseID) =>
          router.push(`/dashboard/goals/${goal.goalID}/courses/${courseID}`)
        }
      />
    </Stack>
  );
}

const SectionHeader = ({ title, onAdd }) => (
  <Stack flexDirection="row" justifyContent="space-between">
    <Typography
      sx={{ fontSize: "16px", fontWeight: 700, color: "var(--text3)" }}
    >
      {title}
    </Typography>
    <Button
      variant="contained"
      startIcon={<Add />}
      onClick={onAdd}
      sx={{ backgroundColor: "var(--primary-color)", textTransform: "none" }}
    >
      {title}
    </Button>
  </Stack>
);

const SubjectList = ({ subjectList, loading, onRemove }) => (
  <Stack flexWrap="wrap" flexDirection="row" rowGap="20px" columnGap="50px">
    {loading ? (
      [...Array(3)].map((_, i) => <SecondaryCardSkeleton key={i} />)
    ) : subjectList && subjectList.length ? (
      subjectList.map((subject, i) => (
        <SecondaryCard
          key={i}
          icon={<InsertDriveFile sx={{ color: "var(--sec-color)" }} />}
          title={subject.title}
          cardWidth="350px"
          options={[
            <MenuItem
              key={i}
              onClick={() => onRemove("remove", subject.subjectID)}
              sx={{
                color: "var(--delete-color)",
                gap: "5px",
                fontSize: "14px",
              }}
            >
              <RemoveCircle fontSize="small" /> Remove
            </MenuItem>,
          ]}
        />
      ))
    ) : (
      <NoDataFound info="No subjects added" />
    )}
  </Stack>
);

const CourseList = ({ courses, loading, onEdit }) => (
  <Stack flexDirection="row" flexWrap="wrap" rowGap="20px" columnGap="30px">
    {loading ? (
      [...Array(4)].map((_, i) => <CourseCardSkeleton key={i} />)
    ) : courses && courses.length ? (
      courses.map((course, i) => (
        <CourseCard
          key={i}
          title={course.title}
          thumbnail={course.thumbnail || defaultThumbnail.src}
          Language={course.language}
          lessons={`${course.lessons} Lessons`}
          hours={`${course.duration} Hours`}
          actionButton={
            <Button
              variant="text"
              endIcon={<TrendingFlat />}
              onClick={() => onEdit(course.id)}
              sx={{
                textTransform: "none",
                color: "var(--primary-color)",
                marginTop: "auto",
              }}
            >
              Edit
            </Button>
          }
        />
      ))
    ) : (
      <NoDataFound info="No courses found" />
    )}
  </Stack>
);
