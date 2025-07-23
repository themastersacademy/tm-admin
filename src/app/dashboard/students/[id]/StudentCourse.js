"use cilent";
import { Add, Close, East } from "@mui/icons-material";
import {
  Button,
  Chip,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useParams } from "next/navigation";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import DialogCourseCard from "@/src/components/DialogCourseCard/DialogCourseCard";
import CourseCard from "@/src/components/CourseCard/CourseCard";
import { useCourses } from "@/src/app/context/CourseProvider";
import StyledSwitch from "@/src/components/StyledSwitch/StyledSwitch";
import { enqueueSnackbar } from "notistack";

export default function StudentCourse() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { courseDetails, loading, refetch } = useCourses();

  const dialogOpen = () => setIsDialogOpen(true);
  const dialogClose = () => setIsDialogOpen(false);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${id}/get-course-enrollment`
      );
      if (data.success) {
        console.log(data);
        const enrichedCourses = data.data.map((enrolledCourse) => {
          const matchedCourse = courseDetails?.find(
            (course) => course.courseID === enrolledCourse.courseID
          );
          return {
            ...enrolledCourse,
            title: matchedCourse?.title || enrolledCourse.title,
            thumbnail: matchedCourse?.thumbnail || enrolledCourse.thumbnail,
            lessons: matchedCourse?.lessons || enrolledCourse.lessons,
          };
        });
        setCourses(enrichedCourses);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [courseDetails, id]);

  const handleCourseStatusChange = async ({ id, status }) => {
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${id}/update-enrollment-status`,
        {
          method: "POST",
          body: JSON.stringify({
            enrollmentID: id,
            isActive: status,
          }),
        }
      );
      if (data.success) {
        fetchCourses();
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses, loading, courseDetails]);

  return (
    <Stack
      sx={{
        gap: "15px",
        marginTop: "20px",
        minHeight: "80vh",
        border: "1px solid var(--border-color)",
        backgroundColor: "var(--white)",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <Stack flexDirection="row" justifyContent="space-between">
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "18px",
            fontWeight: "700",
            color: "var(--text3)",
          }}
        >
          Courses
        </Typography>
        <Stack flexDirection="row" gap="20px">
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
            }}
            onClick={dialogOpen}
            disableElevation
          >
            Add
          </Button>
        </Stack>
      </Stack>
      <Stack flexDirection="row" flexWrap="wrap" rowGap="15px" columnGap="25px">
        {!isLoading ? (
          courses.length > 0 ? (
            courses.map((item, index) => (
              <CourseCard
                key={index}
                courseID={item?.courseID}
                // title={`${item?.title} - Rs. ${item?.price}`}
                title={item.title}
                thumbnail={item.thumbnail}
                lessons={`${item.lessons} Lessons`}
                hours={`${item.duration} ${
                  item.type === "MONTHLY" ? "Months" : "Years"
                }`}
                price={item.price}
                actionButton={
                  <Stack flexDirection="row" gap="5px" alignItems="center">
                    <Chip
                      label={item.status || "Active"} 
                      sx={{
                        backgroundColor: "var(--sec-color-acc-2)",
                        color: "var(--sec-color)",
                        textTransform: "capitalize",
                        borderRadius: "8px",
                      }}
                    />
                    <StyledSwitch
                      checked={item.status === "active"}
                      onChange={(e) => {
                        console.log(item?.id);
                        console.log(e.target.checked);
                        handleCourseStatusChange({
                          id: item?.id,
                          status: e.target.checked,
                        });
                      }}
                    />
                  </Stack>
                }
              />
            ))
          ) : (
            <Stack
              minHeight="500px"
              width="100%"
              justifyContent="center"
              alignItems="center"
            >
              <NoDataFound info="No courses enrolled" />
            </Stack>
          )
        ) : (
          <Stack flexDirection="row" gap="25px">
            <SecondaryCardSkeleton />
            <SecondaryCardSkeleton />
          </Stack>
        )}
      </Stack>
      <AddCourse
        isDialogOpen={isDialogOpen}
        dialogClose={dialogClose}
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
        userID={id}
        fetchCourses={fetchCourses}
      />
    </Stack>
  );
}

const AddCourse = ({
  isDialogOpen,
  dialogClose,
  userID,
  selectedPlan,
  setSelectedPlan,
  fetchCourses,
}) => {
  const [courseList, setCourseList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [expandedCourseID, setExpandedCourseID] = useState(null);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);

  const handleCardClick = (course, plan) => {
    setExpandedCourseID(course.courseID);
    setSelectedCourse(course);
    setSelectedPlan(plan);
  };

  const handlePlanChange = (planIndex) => {
    const selected = selectedCourse.subscription.plans[planIndex];
    setSelectedPlan(selected);
    setSelectedPlanIndex(planIndex);
  };

  const fetchCourse = () => {
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/course/get-all`).then(
      (data) => {
        if (data.success) {
          setCourseList(data.data);
        } else {
          console.log(data.message);
        }
      }
    );
  };
  useEffect(() => {
    fetchCourse();
  }, []);

  const handleAddSubscription = () => {
    if (
      !selectedCourse ||
      selectedPlanIndex === undefined ||
      selectedPlanIndex === null
    ) {
      return;
    }

    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userID}/add-course-enrollment`,
      {
        method: "POST",
        body: JSON.stringify({
          courseID: selectedCourse.courseID,
          goalID: selectedCourse.goalID,
          subscriptionPlanIndex: selectedPlanIndex,
        }),
      }
    ).then((data) => {
      if (data.success) {
        fetchCourses();
        dialogClose();
      } else {
        enqueueSnackbar({
          message: data.message,
          variant: "error",
          autoHideDuration: 3000,
        });
      }
    });
  };

  return (
    <DialogBox
      isOpen={isDialogOpen}
      onClose={dialogClose}
      title="Add Course"
      actionButton={
        <Button
          variant="text"
          endIcon={<East />}
          sx={{
            color: "var(--primary-color)",
            textTransform: "none",
          }}
          disabled={!selectedCourse}
          disableElevation
          onClick={handleAddSubscription}
        >
          Add Course
        </Button>
      }
      icon={
        <IconButton
          onClick={dialogClose}
          sx={{ borderRadius: "8px", padding: "4px" }}
        >
          <Close sx={{ color: "var(--text2)" }} />
        </IconButton>
      }
    >
      <DialogContent>
        <Stack gap="10px">
          {courseList.map((item, index) => (
            <DialogCourseCard
              key={index}
              course={item}
              onSelect={handleCardClick}
              showPlanSelect={expandedCourseID === item.courseID}
              selectedPlan={selectedPlan}
              setSelectedPlan={setSelectedPlan}
              handlePlanChange={handlePlanChange}
              selectedPlanIndex={selectedPlanIndex}
            />
          ))}
        </Stack>
      </DialogContent>
    </DialogBox>
  );
};
