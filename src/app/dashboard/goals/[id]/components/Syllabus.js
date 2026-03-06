"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { Add, Close, East } from "@mui/icons-material";
import {
  Stack,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  styled,
} from "@mui/material";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import SubjectContext from "@/src/app/context/SubjectContext";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import CourseCardSkeleton from "@/src/components/CourseCardSkeleton/CourseCardSkeleton";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import CreateCourseDialog from "./CreateCourseDialog";
import defaultThumbnail from "@/public/Images/defaultThumbnail.svg";
import SubjectCard from "./SubjectCard";
import VideoCourseCard from "./VideoCourseCard";
import SubjectSelection from "./SubjectSelection";

const StyledTabs = styled(Tabs)({
  backgroundColor: "var(--white)",
  borderRadius: "8px",
  border: "1px solid var(--border-color)",
  padding: "3px",
  minHeight: "32px",
  width: "fit-content",
  "& .MuiTabs-indicator": {
    display: "none",
  },
});

const StyledTab = styled(Tab)({
  textTransform: "none",
  fontFamily: "Lato",
  fontWeight: 600,
  fontSize: "12px",
  borderRadius: "6px",
  minHeight: "28px",
  padding: "4px 16px",
  color: "var(--text3)",
  transition: "all 0.15s ease",
  "&.Mui-selected": {
    color: "var(--primary-color)",
    backgroundColor: "var(--primary-color-acc-2)",
  },
});

export default function Syllabus({ goal, fetchGoal, goalLoading }) {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const { subjectList, fetchSubject } = useContext(SubjectContext);
  const [activeTab, setActiveTab] = useState(0);
  const [dialog, setDialog] = useState({
    open: false,
    loading: false,
  });
  const [videoDialog, setVideoDialog] = useState({
    open: false,
    loading: false,
  });
  const [selectedSubjectID, setSelectedSubjectID] = useState("");

  const [localSubjects, setLocalSubjects] = useState([]);
  const [localCourses, setLocalCourses] = useState([]);

  useEffect(() => {
    if (goal.subjectList) setLocalSubjects(goal.subjectList);
    if (goal.coursesList) setLocalCourses(goal.coursesList);
  }, [goal]);

  useEffect(() => {
    if (subjectList.length === 0) {
      fetchSubject();
    }
  }, [subjectList, fetchSubject]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSubjectAction = async (action, subjectID = null) => {
    if (!selectedSubjectID && action === "add") {
      return showSnackbar("Select subject", "error");
    }

    const targetSubjectID =
      action === "remove" ? subjectID : selectedSubjectID;

    const previousSubjects = [...localSubjects];
    if (action === "add") {
      const subjectToAdd = subjectList.find(
        (s) => s.subjectID === targetSubjectID
      );
      if (subjectToAdd) {
        setLocalSubjects((prev) => [...prev, subjectToAdd]);
        setDialog({ open: false, loading: false });
        setSelectedSubjectID("");
      }
    } else {
      setLocalSubjects((prev) =>
        prev.filter((s) => s.subjectID !== targetSubjectID)
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
            subjectID: targetSubjectID,
          }),
        }
      );

      if (response.success) {
        showSnackbar(response.message, "success");
        fetchGoal();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
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
        padding: "16px",
        gap: "16px",
        borderRadius: "10px",
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
          startIcon={<Add sx={{ fontSize: "16px" }} />}
          onClick={() => openDialog(activeTab === 0 ? "subject" : "video")}
          disableElevation
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "12px",
            height: "34px",
            padding: "6px 16px",
            "&:hover": {
              backgroundColor: "var(--primary-color-dark)",
            },
          }}
        >
          Add {activeTab === 0 ? "Subject" : "Course"}
        </Button>
      </Stack>

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
      <Dialog
        open={dialog.open}
        onClose={() => closeDialog("subject")}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px", maxWidth: "500px" } }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          padding="14px 20px"
          sx={{ borderBottom: "1px solid var(--border-color)" }}
        >
          <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "var(--text1)" }}>
            Add Subject
          </Typography>
          <IconButton
            onClick={() => closeDialog("subject")}
            size="small"
            sx={{ width: 28, height: 28 }}
          >
            <Close sx={{ fontSize: "16px" }} />
          </IconButton>
        </Stack>
        <DialogContent sx={{ padding: "16px 20px" }}>
          <SubjectSelection
            value={selectedSubjectID}
            onChange={(e) => setSelectedSubjectID(e.target.value)}
            options={subjectList}
            alreadyAdded={localSubjects.map((s) => s.subjectID)}
            getLabel={(s) => s.title}
            getValue={(s) => s.subjectID}
          />
        </DialogContent>
        <DialogActions sx={{ padding: "12px 20px", borderTop: "1px solid var(--border-color)" }}>
          <Button
            onClick={() => closeDialog("subject")}
            sx={{
              textTransform: "none",
              color: "var(--text2)",
              fontWeight: 600,
              fontSize: "12px",
              height: "34px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              padding: "6px 16px",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSubjectAction("add")}
            disabled={dialog.loading || !selectedSubjectID}
            disableElevation
            sx={{
              textTransform: "none",
              backgroundColor: "var(--primary-color)",
              borderRadius: "8px",
              padding: "6px 16px",
              fontWeight: 600,
              fontSize: "12px",
              height: "34px",
              "&:hover": { backgroundColor: "var(--primary-color-dark)" },
              "&:disabled": { backgroundColor: "var(--text3)", color: "#fff", opacity: 0.5 },
            }}
          >
            {dialog.loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              "Add Subject"
            )}
          </Button>
        </DialogActions>
      </Dialog>

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
  <Stack flexWrap="wrap" flexDirection="row" gap="12px">
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
  <Stack flexDirection="row" flexWrap="wrap" gap="16px">
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
