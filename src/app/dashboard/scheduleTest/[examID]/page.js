"use client";
import ExamInfoCard from "@/src/components/CreateExam/Components/ExamInfoCard";
import CustomTabs from "@/src/components/CustomTabs/CustomTabs";
import Header from "@/src/components/Header/Header";
import { Skeleton, Stack } from "@mui/material";
import mocks from "@/public/Icons/series.svg";
import ExamQuestions from "@/src/components/CreateExam/Components/ExamQuestions";
import ExamSettings from "@/src/components/CreateExam/Components/ExamSettings";
import ExamStudents from "@/src/components/CreateExam/Components/ExamStudents";
import { useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useParams } from "next/navigation";

export default function TestID() {
  const [testList, setTestList] = useState([]);
  const params = useParams();

  const tabs = [
    {
      label: "Questions",
      content: <ExamQuestions type="scheduled" isLive={testList.isLive} />,
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
      content: <ExamStudents />,
    },
  ];
  const totalQuestions = testList?.questionSection?.reduce(
    (total, section) => total + (section.questions?.length || 0),
    0
  );

  const fetchScheduledTest = () => {
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/${params.examID}`
    ).then((data) => {
      if (data.success) {
        setTestList(data.data);
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
    });
  };

  useEffect(() => {
    fetchScheduledTest();
  }, []);

  return (
    <Stack gap="20px" padding="20px">
      <Header title="Schedule Test" back />
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
          examTitle={testList.title || <Skeleton variant="text" width={100} />}
          icon={mocks.src}
          date={
            testList.startTimeStamp ? (
              new Date(testList.startTimeStamp).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            ) : totalQuestions !== undefined ? (
              "No Date Available"
            ) : (
              <Skeleton variant="text" width={100} />
            )
          }
          questions={
            totalQuestions !== undefined ? (
              `${totalQuestions || 0} Questions`
            ) : (
              <Skeleton variant="text" width={100} />
            )
          }
          duration={
            testList.duration !== undefined ? (
              `${testList.duration || 0} Minutes`
            ) : (
              <Skeleton variant="text" width={100} />
            )
          }
          type="scheduled"
          examID={testList.id}
          isLive={testList.isLive}
          fetchTestSeries={fetchScheduledTest}
        />
        <CustomTabs tabs={tabs} width="308px" />
      </Stack>
    </Stack>
  );
}
