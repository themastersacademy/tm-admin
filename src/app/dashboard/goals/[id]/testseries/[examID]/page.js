"use client";
import dynamic from "next/dynamic";
import CustomTabs from "@/src/components/CustomTabs/CustomTabs";
import ExamDetailHeader from "@/src/app/dashboard/scheduleTest/[examID]/Components/ExamDetailHeader";
import { Stack, CircularProgress } from "@mui/material";
import { useEffect, useState, useCallback, useMemo } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useParams } from "next/navigation";
import { useSnackbar } from "@/src/app/context/SnackbarContext";

const ExamQuestions = dynamic(
  () => import("@/src/components/CreateExam/Components/ExamQuestions"),
  { loading: () => <TabLoading /> }
);
const ExamSettings = dynamic(
  () => import("@/src/components/CreateExam/Components/ExamSettings"),
  { loading: () => <TabLoading /> }
);
const ExamStudents = dynamic(
  () => import("@/src/components/CreateExam/Components/ExamStudents"),
  { loading: () => <TabLoading /> }
);

const TabLoading = () => (
  <Stack
    alignItems="center"
    justifyContent="center"
    sx={{ minHeight: "400px", width: "100%" }}
  >
    <CircularProgress />
  </Stack>
);

export default function TestSeriesID() {
  const [testList, setTestList] = useState({});
  const [examAttempts, setExamAttempts] = useState([]);
  const [sections, setSections] = useState([]);
  const [questionList, setQuestionList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const { showSnackbar } = useSnackbar();

  const fetchTestSeries = useCallback(
    async (signal) => {
      setIsLoading(true);
      try {
        const abortSignal = signal instanceof AbortSignal ? signal : null;
        const data = await apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/${params.examID}`,
          { signal: abortSignal }
        );
        if (data.success) {
          setTestList(data.data);
        } else {
          showSnackbar(data.message, "error", "", "3000");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch test series:", error);
          showSnackbar("Failed to load test series data", "error", "", "3000");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [params.examID, showSnackbar]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchTestSeries(controller.signal);
    return () => controller.abort();
  }, [fetchTestSeries]);

  const tabs = useMemo(
    () => [
      {
        label: "Questions",
        content: (
          <ExamQuestions
            type="mock"
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
            type="mock"
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
    ],
    [
      testList,
      sections,
      questionList,
      examAttempts,
      setSections,
      setQuestionList,
      setTestList,
      setExamAttempts,
    ]
  );

  const totalQuestions =
    testList?.questionSection?.reduce(
      (total, section) => total + (section.questions?.length || 0),
      0
    ) || 0;

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
        type="mock"
        fetchTestSeries={fetchTestSeries}
      />
      <CustomTabs tabs={tabs} width="100%" />
    </Stack>
  );
}
