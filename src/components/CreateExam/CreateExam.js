"use client";
import { Skeleton, Stack } from "@mui/material";
import CustomTabs from "../CustomTabs/CustomTabs";
import ExamInfoCard from "./Components/ExamInfoCard";
import calendar from "@/public/Icons/weekCalendar.svg";
import ExamQuestions from "./Components/ExamQuestions";
import ExamSettings from "./Components/ExamSettings";
import ExamStudents from "./Components/ExamStudents";
import Header from "../Header/Header";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { apiFetch } from "@/src/lib/apiFetch";

export default function CreateExam({ exam, setExam }) {
  const params = useParams();
  const examID = params.examID;
  const totalQuestions = exam?.questionSection?.reduce(
    (total, section) => total + (section.questions?.length || 0),
    0
  );

  const getExam = () => {
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/${examID}`).then(
      (data) => {
        if (data.success) {
          setExam(data.data);
        } else {
          showSnackbar(data.message, "error", "", "3000");
        }
      }
    );
  };

  useEffect(() => {
    getExam();
  }, []);

  const tabs = [
    {
      label: "Questions",
      content: <ExamQuestions type="group" isLive={exam.isLive} />,
    },
    {
      label: "Settings",
      content: (
        <ExamSettings
          exam={exam}
          setExam={setExam}
          type="group"
          isLive={exam.isLive}
        />
      ),
    },
    { label: "Students", content: <ExamStudents /> },
  ];

  return (
    <Stack gap="20px">
      <Header title="Exam Group" back />
      <Stack
        sx={{
          backgroundColor: "var(--white)",
          border: "1px solid",
          borderColor: "var(--border-color)",
          borderRadius: "10px",
          padding: "20px",
          gap: "25px",
          minHeight: "100vh",
        }}
      >
        <ExamInfoCard
          examTitle={exam.title || <Skeleton variant="text" width="120px" />}
          icon={calendar.src}
          date={
            exam.startTimeStamp
              ? new Date(exam.startTimeStamp).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "No Date Available"
          }
          questions={
            totalQuestions !== undefined ? (
              `${totalQuestions || 0} Questions`
            ) : (
              <Skeleton variant="text" width={100} />
            )
          }
          duration={
            exam.duration !== undefined ? (
              `${exam.duration || 0} Minutes`
            ) : (
              <Skeleton variant="text" width={100} />
            )
          }
          isLive={exam.isLive}
          mode="exam"
          exam={exam}
          type="group"
          examID={examID}
          fetchTestSeries={getExam}
        />
        <CustomTabs tabs={tabs} width="308px" />
      </Stack>
    </Stack>
  );
}
