"use client";
import CustomTabs from "@/src/components/CustomTabs/CustomTabs";
import { Stack } from "@mui/material";
import StudentProfile from "./StudentProfile";
import StudentExam from "./StudentExam";
import StudentSubscription from "./StudentSubscrition";
import StudentCourse from "./StudentCourse";
import Header from "@/src/components/Header/Header";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { apiFetch } from "@/src/lib/apiFetch";

export default function StudentprofileID() {
  const [student, setStudent] = useState({});
  const params = useParams();

  const getStudentProfile = async () => {
    await apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${params.id}`
    ).then((data) => {
      setStudent(data.data);
    });
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
      <Header title="Student Profile" back />
      <Stack
        sx={{
          borderRadius: "10px",
          minHeight: "100vh",
          gap: "20px",
          width: "100%",
        }}
      >
        <CustomTabs tabs={tabs} width="408px" />
      </Stack>
    </Stack>
  );
}
