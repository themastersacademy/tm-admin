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
  IconButton,
} from "@mui/material";
import { ArrowBack, Home } from "@mui/icons-material";
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
      padding="16px"
      gap="12px"
      sx={{ backgroundColor: "var(--bg-color)", minHeight: "100vh" }}
    >
      {/* Breadcrumb Bar */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          backgroundColor: "var(--white)",
          padding: "10px 16px",
          borderRadius: "10px",
          border: "1px solid var(--border-color)",
        }}
      >
        <Stack direction="row" alignItems="center" gap="10px">
          <IconButton
            onClick={() => router.push(`/dashboard/goals/${id}`)}
            sx={{
              width: 28,
              height: 28,
              border: "1px solid var(--border-color)",
              borderRadius: "7px",
              "&:hover": {
                backgroundColor: "var(--primary-color)",
                borderColor: "var(--primary-color)",
                "& svg": { color: "#fff" },
              },
            }}
          >
            <ArrowBack sx={{ fontSize: "14px", color: "var(--text2)", transition: "color 0.15s" }} />
          </IconButton>
          <Breadcrumbs
            separator="›"
            sx={{
              fontSize: "12px",
              "& .MuiBreadcrumbs-separator": { color: "var(--text4)" },
            }}
          >
            <Link
              underline="hover"
              color="inherit"
              onClick={() => router.push(`/dashboard/goals/${id}`)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: "var(--text4)",
                fontSize: "12px",
                cursor: "pointer",
                "&:hover": { color: "var(--primary-color)" },
              }}
            >
              {isGoalLoading ? <Skeleton width={80} height={16} /> : goal.title || "Goal"}
            </Link>
            <Typography sx={{ fontSize: "12px", color: "var(--text1)", fontWeight: 600 }}>
              {isLoading ? <Skeleton width={100} height={16} /> : course.title || "Course"}
            </Typography>
          </Breadcrumbs>
        </Stack>

        <Button
          variant="contained"
          onClick={handlePublish}
          disabled={isLoading}
          disableElevation
          sx={{
            textTransform: "none",
            backgroundColor: course.isLive ? "#FF9800" : "#4CAF50",
            color: "#fff",
            borderRadius: "8px",
            padding: "5px 16px",
            fontWeight: 600,
            fontSize: "12px",
            height: "32px",
            "&:hover": {
              backgroundColor: course.isLive ? "#F57C00" : "#388E3C",
            },
            "&:disabled": {
              backgroundColor: "#9E9E9E",
              color: "#fff",
            },
          }}
        >
          {isLoading ? (
            <CircularProgress size={14} sx={{ color: "white" }} />
          ) : course.isLive ? (
            "Unpublish"
          ) : (
            "Publish Course"
          )}
        </Button>
      </Stack>

      {/* Title Row */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          backgroundColor: "var(--white)",
          padding: "12px 16px",
          borderRadius: "10px",
          border: "1px solid var(--border-color)",
        }}
      >
        <Stack direction="row" alignItems="center" gap="10px">
          {isLoading ? (
            <Skeleton width={200} height={22} />
          ) : (
            <>
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--text1)",
                }}
              >
                {course.title}
              </Typography>
              <Chip
                label={course.isLive ? "Published" : "Draft"}
                size="small"
                sx={{
                  height: "20px",
                  fontSize: "10px",
                  fontWeight: 700,
                  backgroundColor: course.isLive
                    ? "rgba(76, 175, 80, 0.08)"
                    : "rgba(0, 0, 0, 0.04)",
                  color: course.isLive ? "#4CAF50" : "#9E9E9E",
                  border: `1px solid ${course.isLive ? "#4caf5030" : "#00000015"}`,
                  "& .MuiChip-label": { padding: "0 6px" },
                }}
              />
            </>
          )}
        </Stack>
        {course.language?.length > 0 && (
          <Stack direction="row" gap="4px">
            {course.language.map((lang, i) => (
              <Chip
                key={i}
                label={lang}
                size="small"
                sx={{
                  height: "20px",
                  fontSize: "10px",
                  fontWeight: 600,
                  backgroundColor: "rgba(24, 113, 99, 0.06)",
                  color: "var(--primary-color)",
                  border: "1px solid rgba(24, 113, 99, 0.12)",
                  "& .MuiChip-label": { padding: "0 6px" },
                }}
              />
            ))}
          </Stack>
        )}
      </Stack>

      {/* Tabs Content */}
      <CustomTabs tabs={tabs} fetchCourse={fetchCourse} />
    </Stack>
  );
}
