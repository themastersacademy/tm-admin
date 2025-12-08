"use client";
import {
  Button,
  CircularProgress,
  Skeleton,
  Stack,
  Typography,
  Breadcrumbs,
  Link,
  Chip,
  Box,
} from "@mui/material";
import { NavigateNext, Circle } from "@mui/icons-material";
import CustomTabs from "@/src/components/CustomTabs/CustomTabs";
import Basic from "../components/Basic";
import Videos from "../components/Videos";
import Subscription from "../components/Subscription";
import { useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useParams, useRouter } from "next/navigation";
import { useSnackbar } from "@/src/app/context/SnackbarContext";

export default function CourseID() {
  const [course, setCourse] = useState({});
  const [goal, setGoal] = useState({});
  const { id, courseID } = useParams();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoalLoading, setIsGoalLoading] = useState(false);

  useEffect(() => {
    fetchCourse();
    fetchGoal();
  }, [courseID, id]);

  const fetchGoal = async () => {
    setIsGoalLoading(true);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/${id}`
      );
      if (data.success) {
        setGoal(data.data);
      }
    } catch (error) {
      console.log(error);
    }
    setIsGoalLoading(false);
  };

  const fetchCourse = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/courses/get`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseID, goalID: id }),
        }
      );
      if (data.success) {
        setCourse(data.data);
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/courses/live-unlive`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseID, goalID: id }),
        }
      );
      if (data.success) {
        showSnackbar(data.message, "success", "", "3000");
        fetchCourse();
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const tabs = [
    {
      label: "Course Details",
      content: <Basic course={course} setCourse={setCourse} />,
    },
    {
      label: "Lessons",
      content: <Videos course={course} />,
    },
    {
      label: "Subscription",
      content: <Subscription course={course} setCourse={setCourse} />,
    },
  ];

  return (
    <Stack
      padding="24px"
      gap="24px"
      sx={{ backgroundColor: "var(--bg-color)", minHeight: "100vh" }}
    >
      {/* Custom Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          backgroundColor: "var(--white)",
          padding: "20px 24px",
          borderRadius: "16px",
          border: "1px solid var(--border-color)",
        }}
      >
        <Stack gap="8px">
          {/* Breadcrumbs */}
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            aria-label="breadcrumb"
          >
            <Link
              underline="hover"
              color="inherit"
              onClick={() => router.push(`/dashboard/goals/${id}`)}
              sx={{ cursor: "pointer", fontFamily: "Lato", fontSize: "14px" }}
            >
              {isGoalLoading ? <Skeleton width={60} /> : goal.title || "Goal"}
            </Link>
            <Typography
              color="text.primary"
              sx={{ fontFamily: "Lato", fontSize: "14px", fontWeight: 600 }}
            >
              {isLoading ? <Skeleton width={100} /> : course.title || "Course"}
            </Typography>
          </Breadcrumbs>

          {/* Title & Status */}
          <Stack direction="row" alignItems="center" gap="16px">
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "24px",
                fontWeight: 800,
                color: "var(--text1)",
              }}
            >
              {isLoading ? <Skeleton width={200} /> : course.title}
            </Typography>
            {!isLoading && (
              <Chip
                icon={
                  <Circle
                    sx={{
                      fontSize: "10px !important",
                      color: course.isLive ? "#2e7d32" : "#ed6c02",
                    }}
                  />
                }
                label={course.isLive ? "Published" : "Draft"}
                size="small"
                sx={{
                  backgroundColor: course.isLive
                    ? "rgba(46, 125, 50, 0.1)"
                    : "rgba(237, 108, 2, 0.1)",
                  color: course.isLive ? "#2e7d32" : "#ed6c02",
                  fontWeight: 700,
                  fontFamily: "Lato",
                  border: "1px solid",
                  borderColor: course.isLive
                    ? "rgba(46, 125, 50, 0.2)"
                    : "rgba(237, 108, 2, 0.2)",
                }}
              />
            )}
          </Stack>
        </Stack>

        {/* Actions */}
        <Button
          variant="contained"
          onClick={handlePublish}
          disabled={isLoading}
          disableElevation
          sx={{
            backgroundColor: course.isLive
              ? "var(--white)"
              : "var(--primary-color)",
            color: course.isLive ? "var(--text1)" : "var(--white)",
            border: course.isLive ? "1px solid var(--border-color)" : "none",
            textTransform: "none",
            fontWeight: 600,
            fontFamily: "Lato",
            padding: "8px 24px",
            "&:hover": {
              backgroundColor: course.isLive
                ? "var(--bg-color)"
                : "var(--primary-color-dark)",
            },
          }}
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : course.isLive ? (
            "Unpublish Course"
          ) : (
            "Publish Course"
          )}
        </Button>
      </Stack>

      {/* Tabs Content */}
      <Stack
        sx={{
          padding: "24px",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          backgroundColor: "var(--white)",
          minHeight: "60vh",
        }}
      >
        <CustomTabs tabs={tabs} fetchCourse={fetchCourse} />
      </Stack>
    </Stack>
  );
}
