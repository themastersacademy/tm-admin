"use client";
import { Skeleton, Stack } from "@mui/material";
import CustomTabs from "../CustomTabs/CustomTabs";
import ExamInfoCard from "./Components/ExamInfoCard";
import Header from "../Header/Header";
import mocks from "@/public/Icons/series.svg";
import ExamQuestions from "./Components/ExamQuestions";
import ExamSettings from "./Components/ExamSettings";
import ExamStudents from "./Components/ExamStudents";

export default function CreateTestSeries({
  testSeries,
  setTestSeries,
  examID,
  isLive,
  fetchTestSeries,
}) {
  const totalQuestions = testSeries?.questionSection?.reduce(
    (total, section) => total + (section.questions?.length || 0),
    0
  );
  const tabs = [
    {
      label: "Questions",
      content: <ExamQuestions type="mock" isLive={isLive} />,
    },
    {
      label: "Settings",
      content: (
        <ExamSettings
          exam={testSeries}
          setExam={setTestSeries}
          type="mock"
          isLive={isLive}
        />
      ),
    },
    { label: "Students", content: <ExamStudents /> },
  ];

  return (
    <Stack gap="20px">
      <Header title="Test series" back />
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
          examTitle={
            testSeries.title || <Skeleton variant="text" width={100} />
          }
          icon={mocks.src}
          date={
            testSeries.startTimeStamp ? (
              new Date(testSeries.startTimeStamp).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            ) : (
              "No Date Available"
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
            testSeries.duration !== undefined ? (
              `${testSeries.duration || 0} Minutes`
            ) : (
              <Skeleton variant="text" width={100} />
            )
          }
          type="mock"
          examID={examID}
          isLive={isLive}
          fetchTestSeries={fetchTestSeries}
        />
        <CustomTabs tabs={tabs} width="308px" />
      </Stack>
    </Stack>
  );
}
