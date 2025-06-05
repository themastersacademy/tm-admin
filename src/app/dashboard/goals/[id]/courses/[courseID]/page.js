"use client";
import { Button, CircularProgress, Skeleton, Stack } from "@mui/material";
import CustomTabs from "@/src/components/CustomTabs/CustomTabs";
import Basic from "../Components/Basic";
import Videos from "../Components/Videos";
import Subscription from "../Components/Subscription";
import { useEffect, useState } from "react";
import Header from "@/src/components/Header/Header";
import { apiFetch } from "@/src/lib/apiFetch";
import { useParams } from "next/navigation";
import { useSnackbar } from "@/src/app/context/SnackbarContext";

export default function CourseID() {
  const [course, setCourse] = useState({});
  const { id, courseID } = useParams();
  const { showSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [courseID, id]);

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
      label: "Basic",
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
    <Stack padding="20px" gap="20px">
      <Header
        title={
          course.title ? (
            course.title
          ) : (
            <Skeleton variant="text" sx={{ width: "100px" }} />
          )
        }
        button={[
          <Button
            key="p"
            variant="contained"
            sx={{
              backgroundColor: "var(--sec-color)",
              textTransform: "none",
              width: "100px",
            }}
            disableElevation
            onClick={() => {
              handlePublish();
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={22} sx={{ color: "white" }} />
            ) : course.isLive === true ? (
              "Draft"
            ) : (
              "Publish"
            )}
          </Button>,
        ]}
        back
      />
      <Stack
        sx={{
          padding: "20px",
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          minHeight: "100vh",
          backgroundColor: "var(--white)",
        }}
      >
        <CustomTabs tabs={tabs} fetchCourse={fetchCourse} />
      </Stack>
    </Stack>
  );
}
