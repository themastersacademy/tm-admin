"use client";
import { Stack } from "@mui/material";
import CreateExam from "@/src/components/CreateExam/CreateExam";
import { useState } from "react";

export default function ExamID() {
  const [exam, setExam] = useState({});

  return (
    <Stack padding="20px">
      <CreateExam exam={exam} setExam={setExam} />
    </Stack>
  );
}
