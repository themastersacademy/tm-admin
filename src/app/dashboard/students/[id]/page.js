"use client";
import dynamic from "next/dynamic";
import CustomTabs from "@/src/components/CustomTabs/CustomTabs";
import { Stack, CircularProgress, Box } from "@mui/material";
import StudentProfileHeader from "./Components/StudentProfileHeader";
import StudentDashboard from "./Components/StudentDashboard";
import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "@/src/lib/apiFetch";

const StudentProfile = dynamic(() => import("./StudentProfile"), {
  loading: () => <TabLoading />,
});
const StudentExam = dynamic(() => import("./StudentExam"), {
  loading: () => <TabLoading />,
});
const StudentSubscription = dynamic(() => import("./StudentSubscrition"), {
  loading: () => <TabLoading />,
});
const StudentCourse = dynamic(() => import("./StudentCourse"), {
  loading: () => <TabLoading />,
});

const TabLoading = () => (
  <Stack
    alignItems="center"
    justifyContent="center"
    sx={{ minHeight: "400px", width: "100%" }}
  >
    <CircularProgress />
  </Stack>
);

export default function StudentprofileID() {
  const [student, setStudent] = useState({});
  const [dashboardStats, setDashboardStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [userResponse, examsResponse, subsResponse] = await Promise.all([
          apiFetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${params.id}`
          ),
          apiFetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${params.id}/all-exam-attempts`
          ),
          apiFetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${params.id}/get-subscription`
          ),
        ]);

        // Process User Data
        if (userResponse.success) {
          setStudent(userResponse.data);
        }

        // Process Stats
        const exams = examsResponse.data || [];
        const subscriptions = subsResponse.data || [];
        const activeSub = subscriptions.find((s) => s.status === "active");

        const totalExams = exams.length;
        const avgScore =
          exams.length > 0
            ? Math.round(
                exams.reduce((acc, exam) => {
                  const percentage =
                    (exam.obtainedMarks / exam.totalMarks) * 100;
                  return acc + percentage;
                }, 0) / exams.length
              )
            : 0;

        setDashboardStats({
          totalExams,
          avgScore,
          subscription: activeSub
            ? activeSub.plan.type === "MONTHLY"
              ? "Premium"
              : "Premium+"
            : "None",
          totalCourses: 0, // Will be updated when courses data is available
        });
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const tabs = useMemo(
    () => [
      { label: "Profile", content: <StudentProfile student={student} /> },
      { label: "Exams", content: <StudentExam student={student} /> },
      {
        label: "Subscriptions",
        content: <StudentSubscription student={student} />,
      },
      { label: "Courses", content: <StudentCourse student={student} /> },
    ],
    [student]
  );

  return (
    <Stack padding="20px" gap="20px">
      {/* Modern Profile Header */}
      <StudentProfileHeader
        student={student}
        isLoading={isLoading}
        onEditProfile={() => console.log("Edit profile")}
        onSendEmail={() => (window.location.href = `mailto:${student?.email}`)}
        onViewActivity={() => console.log("View activity")}
      />

      {/* Dashboard Overview */}
      <StudentDashboard stats={dashboardStats} isLoading={isLoading} />

      {/* Tabs Section */}
      <Stack
        sx={{
          backgroundColor: "var(--white)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "4px",
          minHeight: "60vh",
        }}
      >
        <CustomTabs tabs={tabs} width="560px" />
      </Stack>
    </Stack>
  );
}
