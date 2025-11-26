"use client";
import ExamCard from "./ExamCard";
import { Stack } from "@mui/material";
import weekcalendar from "@/public/Icons/weekCalendar.svg";
import series from "@/public/Icons/series.svg";
import { useParams, useRouter } from "next/navigation";

export default function Exam({ goal }) {
  const params = useParams();
  const id = params.id;

  const router = useRouter();
  return (
    <Stack
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid",
        borderColor: "var(--border-color)",
        borderRadius: "10px",
        padding: "20px",
        gap: "20px",
      }}
    >
      <Stack flexDirection="row" gap="20px" flexWrap="wrap">
        <ExamCard
          icon={weekcalendar.src}
          title="Exam Groups"
          description="Create and manage groups of exams. Organize tests by subject, topic, or difficulty level for structured learning."
          onClick={() => {
            router.push(`/dashboard/goals/${goal.goalID}/examgroups`);
          }}
          color="#1976d2"
          bgColor="#e3f2fd"
        />
        <ExamCard
          icon={series.src}
          title="TMA Test Series"
          description="Design comprehensive test series packages. Bundle multiple exams together to offer complete preparation courses."
          onClick={() => {
            router.push(`/dashboard/goals/${goal.goalID}/testseries`);
          }}
          color="#7b1fa2"
          bgColor="#f3e5f5"
        />
      </Stack>
    </Stack>
  );
}
