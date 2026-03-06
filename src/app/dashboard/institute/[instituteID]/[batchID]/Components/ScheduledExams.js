"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Stack, Typography } from "@mui/material";
import { apiFetch } from "@/src/lib/apiFetch";
import ScheduledExamCard from "@/src/components/ScheduledExamCard/ScheduledExamCard";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";

export default function ScheduledExams() {
  const params = useParams();
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExams = useCallback(() => {
    setIsLoading(true);
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/${params.instituteID}/${params.batchID}/get-scheduled-exams`
    ).then((data) => {
      if (data.success) {
        setExams(data.data);
      }
      setIsLoading(false);
    });
  }, [params.instituteID, params.batchID]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  return (
    <Stack
      sx={{
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        padding: "20px",
        backgroundColor: "var(--white)",
        minHeight: "80vh",
        gap: "20px",
        marginTop: "20px",
      }}
    >
      <Typography sx={{ fontSize: "20px", fontWeight: "700" }}>
        Scheduled Exams
      </Typography>
      <Stack
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {!isLoading ? (
          exams.length > 0 ? (
            exams.map((exam, index) => (
              <ScheduledExamCard key={index} exam={exam} />
            ))
          ) : (
            <Stack sx={{ gridColumn: "1 / -1", minHeight: "60vh" }}>
              <NoDataFound info="No scheduled exams for this batch" />
            </Stack>
          )
        ) : (
          <SecondaryCardSkeleton />
        )}
      </Stack>
    </Stack>
  );
}
