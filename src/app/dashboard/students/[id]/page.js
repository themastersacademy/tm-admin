"use client";
import CustomTabs from "@/src/components/CustomTabs/CustomTabs";
import { Stack } from "@mui/material";
import StudentProfile from "./StudentProfile";
import StudentExam from "./StudentExam";
import StudentSubscription from "./StudentSubscrition";
import StudentCourse from "./StudentCourse";
import StudentProfileHeader from "./Components/StudentProfileHeader";
import StudentDashboard from "./Components/StudentDashboard";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { apiFetch } from "@/src/lib/apiFetch";

export default function StudentprofileID() {
  const [student, setStudent] = useState({});
  const [dashboardStats, setDashboardStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();

  const getStudentProfile = async () => {
    setIsLoading(true);
    await apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${params.id}`
    ).then((data) => {
      setStudent(data.data);
      fetchDashboardStats();
      setIsLoading(false);
    });
  };

  const fetchDashboardStats = async () => {
    try {
      // Fetch exam attempts
      const examsResponse = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${params.id}/all-exam-attempts`
      );
      const exams = examsResponse.data || [];

      // Fetch subscriptions
      const subsResponse = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${params.id}/get-subscription`
      );
      const subscriptions = subsResponse.data || [];
      const activeSub = subscriptions.find((s) => s.status === "active");

      // Calculate stats
      const totalExams = exams.length;
      const avgScore =
        exams.length > 0
          ? Math.round(
              exams.reduce((acc, exam) => {
                const percentage = (exam.obtainedMarks / exam.totalMarks) * 100;
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
      console.error("Error fetching dashboard stats:", error);
    }
  };

  useEffect(() => {
    getStudentProfile();
  }, []);

  const tabs = [
    { label: "Profile", content: <StudentProfile student={student} /> },
    { label: "Exams", content: <StudentExam student={student} /> },
    {
      label: "Subscriptions",
      content: <StudentSubscription student={student} />,
    },
    { label: "Courses", content: <StudentCourse student={student} /> },
  ];
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
