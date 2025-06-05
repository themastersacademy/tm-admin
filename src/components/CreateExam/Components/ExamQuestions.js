"use client";
import SectionCard from "@/src/components/CreateExam/Components/SectionCard";
import { Add } from "@mui/icons-material";
import { Button, Stack, Tooltip, Typography } from "@mui/material";
import question from "@/public/Icons/question.svg";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import NoDataFound from "../../NoDataFound/NoDataFound";
import QuestionCardSkeleton from "../../QuestionCardSkeleton/QuestionCardSkeleton";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { apiFetch } from "@/src/lib/apiFetch";

export default function ExamQuestions({ type, isLive }) {
  const params = useParams();
  const goalID = params.id;
  const examID = params.examID;
  const menuOptions = ["Remove"];
  const { showSnackbar } = useSnackbar();
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [questionList, setQuestionList] = useState([]);

  const createSection = async ({ params = {} }) => {
    try {
      await apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examID: examID,
          type: type,
          ...params,
        }),
      }).then((data) => {
        if (data.success) {
          fetchExamData();
        } else {
          showSnackbar(data.message, "error", "", "3000");
        }
      });
    } catch (error) {
      showSnackbar("Error occured", "error", "", "3000");
    }
  };

  const fetchExamData = async () => {
    setIsLoading(true);
    try {
      await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/${examID}`
      ).then((data) => {
        if (data.success) {
          setSections(data.data.questionSection);
        } else {
          showSnackbar(data.message, "error", "", "3000");
        }
        setIsLoading(false);
      });
    } catch (error) {
      showSnackbar("Error fetching sections", "error", "", "3000");
    }
  };

  const fetchQuestions = () => {
    setIsLoading(true);
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/questions/get`).then(
      (data) => {
        if (data.success) {
          setQuestionList(data.data);
        } else {
          showSnackbar(data.message, "error", "", "3000");
        }
        setIsLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchExamData();
    fetchQuestions();
  }, []);

  const deleteSection = (sectionIndex) => {
    try {
      apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/delete-section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionIndex: sectionIndex,
          examID: examID,
          goalID: goalID,
          type: type,
        }),
      }).then((data) => {
        if (data.success) {
          showSnackbar(data.message, "success", "", "3000");
          fetchExamData();
        } else {
          showSnackbar(data.message, "error", "", "3000");
        }
      });
    } catch (error) {
      showSnackbar("Error deleting section", "error", "", "3000");
    }
  };

  return (
    <Tooltip
      title={isLive ? "You cannot Edit when exam is live" : ""}
      followCursor
      placement="right"
    >
      <Stack marginTop="20px" gap="15px" sx={{}}>
        <Stack flexDirection="row" gap="15px">
          <Tooltip
            title={isLive ? "You cannot create section when exam is live" : ""}
            followCursor
          >
            <Button
              variant="contained"
              endIcon={<Add />}
              onClick={createSection}
              sx={{
                width: "120px",
                backgroundColor: "var(--primary-color)",
                textTransform: "none",
                fontFamily: "Lato",
                cursor: isLive ? "not-allowed" : "auto",
                "&:hover": {
                  backgroundColor: "var(--primary-color)",
                },
              }}
              disabled={isLive}
              disableElevation
            >
              Section
            </Button>
          </Tooltip>
          <Stack
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              border: "1px solid",
              borderColor: "var(--border-color)",
              width: "150px",
              borderRadius: "4px",
              padding: "0px 15px",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "14px",
                color: "var(--sec-color)",
                fontWeight: "500",
              }}
            >
              Selected
            </Typography>
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "14px",
                color: "var(--text4)",
              }}
            >
              {sections.length}
            </Typography>
          </Stack>
        </Stack>
        {!isLoading ? (
          sections.length > 0 ? (
            sections.map((section, index) => (
              <SectionCard
                key={index}
                icon={
                  <Image src={question.src} alt="icon" width={24} height={24} />
                }
                sectionTitle={section.title}
                selected={section.selected || "0"}
                nMark={section.nMark}
                pMark={section.pMark}
                button="Questions"
                options={menuOptions}
                sections={sections}
                setSections={setSections}
                sectionIndex={index}
                questionList={questionList}
                setQuestionList={setQuestionList}
                isLoading={isLoading}
                createSection={createSection}
                deleteSection={deleteSection}
                type={type}
                isLive={isLive}
              />
            ))
          ) : (
            <Stack width={"100%"} minHeight={"50vh"} justifyContent="center">
              <NoDataFound info="No Question Created yet" />
            </Stack>
          )
        ) : (
          <QuestionCardSkeleton />
        )}
      </Stack>
    </Tooltip>
  );
}
