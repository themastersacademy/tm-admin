"use client";
import ExamInfoCard from "@/src/components/CreateExam/Components/ExamInfoCard";
import CustomTabs from "@/src/components/CustomTabs/CustomTabs";
import Header from "@/src/components/Header/Header";
import ExamDetailHeader from "./Components/ExamDetailHeader";
import { Skeleton, Stack } from "@mui/material";
import mocks from "@/public/Icons/series.svg";
import ExamQuestions from "@/src/components/CreateExam/Components/ExamQuestions";
import ExamSettings from "@/src/components/CreateExam/Components/ExamSettings";
import ExamStudents from "@/src/components/CreateExam/Components/ExamStudents";
import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useParams } from "next/navigation";
import { useSnackbar } from "@/src/app/context/SnackbarContext";

export default function TestID() {
  const [testList, setTestList] = useState({});
  const [examAttempts, setExamAttempts] = useState([]);
  const [sections, setSections] = useState([]);
  const [questionList, setQuestionList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const { showSnackbar } = useSnackbar();

  const fetchScheduledTest = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/${params.examID}`
      );
      if (data.success) {
        setTestList(data.data);
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
    } catch (error) {
      console.error("Failed to fetch exam:", error);
      showSnackbar("Failed to load exam data", "error", "", "3000");
    } finally {
      setIsLoading(false);
    }
  }, [params.examID, showSnackbar]);

  useEffect(() => {
    fetchScheduledTest();
  }, [fetchScheduledTest]);

  const tabs = [
    {
      label: "Questions",
      content: (
        <ExamQuestions
          type="scheduled"
          isLive={testList.isLive}
          sections={sections}
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
          exam={testList}
          setExam={setTestList}
          isLive={testList.isLive}
          type="scheduled"
        />
      ),
    },
    {
      label: "Students",
      content: (
        <ExamStudents
          examAttempts={examAttempts}
          setExamAttempts={setExamAttempts}
        />
      ),
    },
  ];

  const totalQuestions =
    testList?.questionSection?.reduce(
      (total, section) => total + (section.questions?.length || 0),
      0
    ) || 0;

  const getFormattedDate = () => {
    if (isLoading) return <Skeleton variant="text" width={100} />;
    if (!testList.startTimeStamp) return "No Date Available";

    return new Date(testList.startTimeStamp).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Stack gap="20px" padding="20px">
      <ExamDetailHeader
        examTitle={testList.title}
        isLoading={isLoading}
        totalQuestions={totalQuestions}
        totalSections={testList?.questionSection?.length || 0}
        duration={testList.duration}
        isLive={testList.isLive}
        createdAt={testList.createdAt}
        examID={testList.id}
        type="scheduled"
        fetchTestSeries={fetchScheduledTest}
      />
      <CustomTabs tabs={tabs} width="100%" />
    </Stack>
  );
}
