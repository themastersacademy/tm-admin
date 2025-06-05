"use client";
import { Stack } from "@mui/material";
import CreateTestSeries from "@/src/components/CreateExam/CreateTestSeries";
import { useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useParams } from "next/navigation";

export default function ExamID() {
  const params = useParams();
  const examID = params.examID;
  const [testSeries, setTestSeries] = useState({});

  const fetchTestSeries = async () => {
    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/${examID}`
      );
      if (response.success) {
        setTestSeries(response.data);
      } else {
        console.error("Error fetching test series:", response.message);
      }
    } catch (error) {
      console.error("API fetch failed:", error);
    }
  };

  useEffect(() => {
    fetchTestSeries();
  }, [examID]);

  return (
    <Stack padding="20px">
      <CreateTestSeries
        testSeries={testSeries}
        setTestSeries={setTestSeries}
        examID={examID}
        isLive={testSeries.isLive}
        fetchTestSeries={fetchTestSeries}
      />
    </Stack>
  );
}
