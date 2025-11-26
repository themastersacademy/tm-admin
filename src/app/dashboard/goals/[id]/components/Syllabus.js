"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Add, Close, East, InfoOutlined } from "@mui/icons-material";
import {
  Stack,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  DialogContent,
  Tabs,
  Tab,
  Box,
  styled,
} from "@mui/material";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import CourseCardSkeleton from "@/src/components/CourseCardSkeleton/CourseCardSkeleton";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import CreateCourseDialog from "./CreateCourseDialog";
import defaultThumbnail from "@/public/Images/defaultThumbnail.svg";
import SubjectCard from "./SubjectCard";
import VideoCourseCard from "./VideoCourseCard";
import SubjectSelection from "./SubjectSelection";

const StyledTabs = styled(Tabs)({
  backgroundColor: "var(--bg-color)",
  borderRadius: "12px",
  padding: "4px",
  minHeight: "44px",
  width: "fit-content",
  "& .MuiTabs-indicator": {
    display: "none",
  },
});

const StyledTab = styled(Tab)({
  textTransform: "none",
  fontFamily: "Lato",
  fontWeight: 600,
  fontSize: "14px",
  borderRadius: "8px",
  minHeight: "36px",
  padding: "8px 20px",
  color: "var(--text2)",
  transition: "all 0.2s ease",
  "&.Mui-selected": {
    color: "var(--primary-color)",
    backgroundColor: "var(--white)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
});

export default function Syllabus({ goal, fetchGoal, goalLoading }) {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
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

  // Local state for optimistic updates
  const [localSubjects, setLocalSubjects] = useState([]);
  const [localCourses, setLocalCourses] = useState([]);

  useEffect(() => {
    if (goal.subjectList) setLocalSubjects(goal.subjectList);
    if (goal.coursesList) setLocalCourses(goal.coursesList);
  }, [goal]);

  useEffect(() => {
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/subjects/get-all-subjects`
    )
      .then((data) =>
        setSubjects((prev) => ({ ...prev, all: data.data?.subjects || [] }))
      )
      .catch(() => showSnackbar("Failed to fetch subjects", "error"));
  }, [showSnackbar]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSubjectAction = async (action, subjectID = null) => {
    if (!subjects.selected && action === "add") {
      return showSnackbar("Select subject", "error");
    }

    const selectedSubjectID =
      action === "remove" ? subjectID : subjects.selected;

    // Optimistic Update
    const previousSubjects = [...localSubjects];
    if (action === "add") {
      const subjectToAdd = subjects.all.find(
        (s) => s.subjectID === selectedSubjectID
      );
      if (subjectToAdd) {
        setLocalSubjects((prev) => [...prev, subjectToAdd]);
        setDialog({ open: false, loading: false }); // Close dialog immediately
        setSubjects((prev) => ({ ...prev, selected: "" }));
      }
    } else {
      setLocalSubjects((prev) =>
        prev.filter((s) => s.subjectID !== selectedSubjectID)
      );
    }

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/${action}-subject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goalID: goal.goalID,
            subjectID: selectedSubjectID,
          }),
        }
      );

      if (response.success) {
        showSnackbar(response.message, "success");
        fetchGoal(); // Sync with server
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      // Revert on failure
      setLocalSubjects(previousSubjects);
      showSnackbar(error.message || "Action failed", "error");
    }
  };

  const handleCourseCreate = async (formData) => {
    if (!formData.title) return showSnackbar("Title is required", "error");

    setVideoDialog((prev) => ({ ...prev, loading: true }));

    const response = await apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/courses/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          language: [formData.language],
          goalID: goal.goalID,
        }),
      }
    );

    if (response.success) {
      showSnackbar(response.message, "success");
      fetchGoal();
      setVideoDialog({ open: false, loading: false });
    } else {
      showSnackbar("Failed to create course", "error");
      setVideoDialog((prev) => ({ ...prev, loading: false }));
    }
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
        padding: "24px",
        gap: "24px",
        borderRadius: "16px",
        border: "1px solid var(--border-color)",
      }}
    >
      {/* Tabs Header */}
      <Stack
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <StyledTabs value={activeTab} onChange={handleTabChange}>
          <StyledTab label="Subjects" />
          <StyledTab label="Video Courses" />
        </StyledTabs>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => openDialog(activeTab === 0 ? "subject" : "video")}
          disableElevation
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
            borderRadius: "8px",
            fontWeight: 600,
            fontFamily: "Lato",
            height: "40px",
          }}
        >
          Add {activeTab === 0 ? "Subject" : "Course"}
        </Button>
      </Stack>

      {/* Info Banner for Subjects */}
      {activeTab === 0 && (
        <Box
          sx={{
            background:
              "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-dark, #0056b3) 100%)",
            borderRadius: "16px",
            padding: "24px",
            position: "relative",
            overflow: "hidden",
            color: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              right: "-20px",
              bottom: "-20px",
              opacity: 0.1,
              transform: "rotate(-15deg)",
            }}
          >
            <InfoOutlined sx={{ fontSize: "180px", color: "#fff" }} />
          </Box>

          <Stack
            gap="8px"
            sx={{ position: "relative", zIndex: 1, maxWidth: "80%" }}
          >
            <Stack flexDirection="row" gap="12px" alignItems="center">
              <Box
                sx={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  padding: "8px",
                  borderRadius: "10px",
                  display: "flex",
                }}
              >
                <InfoOutlined sx={{ fontSize: "24px" }} />
              </Box>
              <Typography
                sx={{ fontFamily: "Lato", fontSize: "18px", fontWeight: 700 }}
              >
                Why are Subjects important?
              </Typography>
            </Stack>

            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "14px",
                lineHeight: "1.6",
                opacity: 0.9,
                marginTop: "8px",
              }}
            >
              Subjects form the core structure of your curriculum. Adding
              subjects allows you to organize exams, study materials, and video
              courses effectively, ensuring a structured learning path for
              students.
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && (
          <SubjectList
            subjectList={localSubjects}
            loading={goalLoading && localSubjects.length === 0}
            onRemove={(id) => handleSubjectAction("remove", id)}
          />
        )}
        {activeTab === 1 && (
          <CourseList
            courses={localCourses}
            loading={goalLoading && localCourses.length === 0}
            onEdit={(courseID) =>
              router.push(`/dashboard/goals/${goal.goalID}/courses/${courseID}`)
            }
          />
        )}
      </Box>

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
            variant="contained"
            endIcon={<East />}
            onClick={() => handleSubjectAction("add")}
            disabled={dialog.loading}
            disableElevation
            sx={{
              textTransform: "none",
              backgroundColor: "var(--primary-color)",
              borderRadius: "8px",
              padding: "8px 24px",
            }}
          >
            {dialog.loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Add Subject"
            )}
          </Button>
        }
      >
        <DialogContent sx={{ padding: "20px" }}>
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "14px",
              color: "var(--text2)",
              marginBottom: "16px",
            }}
          >
            Select a subject from the list below to add it to this goal. Use the
            search bar to find specific subjects quickly.
          </Typography>
          <SubjectSelection
            value={subjects.selected}
            onChange={(e) =>
              setSubjects((prev) => ({ ...prev, selected: e.target.value }))
            }
            options={subjects.all}
            alreadyAdded={localSubjects.map((s) => s.subjectID)}
            getLabel={(s) => s.title}
            getValue={(s) => s.subjectID}
          />
        </DialogContent>
      </DialogBox>

      {/* Create Course Dialog */}
      <CreateCourseDialog
        isOpen={videoDialog.open}
        onClose={() => closeDialog("video")}
        onCourseCreate={handleCourseCreate}
        creatingCourse={videoDialog.loading}
      />
    </Stack>
  );
}

const SubjectList = ({ subjectList, loading, onRemove }) => (
  <Stack flexWrap="wrap" flexDirection="row" gap="20px">
    {loading ? (
      [...Array(3)].map((_, i) => <SecondaryCardSkeleton key={i} />)
    ) : subjectList && subjectList.length ? (
      subjectList.map((subject, i) => (
        <SubjectCard
          key={subject.subjectID || i}
          title={subject.title}
          onRemove={() => onRemove(subject.subjectID)}
        />
      ))
    ) : (
      <NoDataFound info="No subjects added yet" />
    )}
  </Stack>
);

const CourseList = ({ courses, loading, onEdit }) => (
  <Stack flexDirection="row" flexWrap="wrap" gap="24px">
    {loading ? (
      [...Array(4)].map((_, i) => <CourseCardSkeleton key={i} />)
    ) : courses && courses.length ? (
      courses.map((course, i) => (
        <VideoCourseCard
          key={course.id || i}
          title={course.title}
          thumbnail={course.thumbnail || defaultThumbnail.src}
          language={course.language}
          lessons={`${course.lessons || 0} Lessons`}
          hours={`${course.duration || 0} Hours`}
          onEdit={() => onEdit(course.id)}
        />
      ))
    ) : (
      <NoDataFound info="No video courses created yet" />
    )}
  </Stack>
);
