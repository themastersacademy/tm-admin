"use client";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";
import { AccountBalance } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useParams } from "next/navigation";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";

export default function StudentExam() {
  const [examAttempts, setExamAttempts] = useState([]);
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    const fetchExamAttempts = async () => {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${id}/all-exam-attempts`
      );
      setExamAttempts(response.data);
    };
    fetchExamAttempts();
  }, []);

  return (
    <Stack
      sx={{
        gap: "15px",
        marginTop: "20px",
        minHeight: "70vh",
        border: "1px solid var(--border-color)",
        backgroundColor: "var(--white)",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <Stack flexDirection="row" justifyContent="space-between">
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "18px",
            fontWeight: "700",
            color: "var(--text3)",
          }}
        >
          Exams
        </Typography>
      </Stack>
      <Stack columnGap="35px" rowGap="15px" flexWrap="wrap" flexDirection="row">
        {examAttempts.length > 0 ? (
          examAttempts.map((exam, index) => (
            <SecondaryCard
              key={index}
              icon={
                <AccountBalance
                  sx={{ color: "var(--sec-color)" }}
                  fontSize="large"
                />
              }
              title={exam.title}
              cardWidth="500px"
              subTitle={
                <Stack flexDirection="row" gap="20px">
                  <Typography
                    sx={{
                      color: "var(--text3)",
                      fontFamily: "Lato",
                      fontSize: "12px",
                    }}
                  >
                    {exam.obtainedMarks} / {exam.totalMarks}
                  </Typography>
                  <Typography
                    sx={{
                      color: "var(--text3)",
                      fontFamily: "Lato",
                      fontSize: "12px",
                    }}
                  >
                    {exam.totalQuestions} Questions
                  </Typography>
                  <Typography
                    sx={{
                      color: "var(--text3)",
                      fontFamily: "Lato",
                      fontSize: "12px",
                    }}
                  >
                    {exam.startTimeStamp
                      ? new Date(exam.startTimeStamp).toLocaleDateString()
                      : " "}
                  </Typography>
                  <Typography
                    sx={{
                      color: "var(--text3)",
                      fontFamily: "Lato",
                      fontSize: "14px",
                    }}
                  >
                    {exam.type}
                  </Typography>
                </Stack>
              }
            />
          ))
        ) : (
          <Stack
            width="100%"
            minHeight="500px"
            justifyContent="center"
            alignItems="center"
          >
            <NoDataFound info="No exams found" />
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
