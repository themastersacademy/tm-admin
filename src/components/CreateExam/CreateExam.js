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
import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/src/lib/apiFetch";

export default function CreateExam({ exam, setExam }) {
  const params = useParams();
  const examID = params.examID;
  const [examAttempts, setExamAttempts] = useState([]);
  const [questionList, setQuestionList] = useState([]);

  const setSections = (updater) => {
    setExam((prev) => {
      const currentSections = prev.questionSection || [];
      const newSections =
        typeof updater === "function" ? updater(currentSections) : updater;
      return { ...prev, questionSection: newSections };
    });
  };

  const totalQuestions = exam?.questionSection?.reduce(
    (total, section) => total + (section.questions?.length || 0),
    0
  );

  const getExam = useCallback(() => {
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/${examID}`).then(
      (data) => {
        if (data.success) {
          setExam(data.data);
        } else {
          showSnackbar(data.message, "error", "", "3000");
        }
      }
    );
  }, [examID, setExam]);

  useEffect(() => {
    getExam();
  }, [getExam]);

  const tabs = [
    {
      label: "Questions",
      content: (
        <ExamQuestions
          type="group"
          isLive={exam.isLive}
          sections={exam.questionSection || []}
          setSections={setSections}
          questionList={questionList}
          setQuestionList={setQuestionList}
        />
      ),
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
    {
      label: "Analytics",
      content: (
        <ExamStudents
          showStudentList={false}
          examAttempts={examAttempts}
          setExamAttempts={setExamAttempts}
        />
      ),
    },
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
