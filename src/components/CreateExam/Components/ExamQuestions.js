"use client";
import SectionCard from "@/src/components/CreateExam/Components/SectionCard";
import { Add } from "@mui/icons-material";
import { Button, Stack, Tooltip, Typography } from "@mui/material";
import question from "@/public/Icons/question.svg";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import NoDataFound from "../../NoDataFound/NoDataFound";
import QuestionCardSkeleton from "../../QuestionCardSkeleton/QuestionCardSkeleton";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { apiFetch } from "@/src/lib/apiFetch";

export default function ExamQuestions({
  type,
  isLive,
  sections,
  setSections,
  questionList,
  setQuestionList,
}) {
  console.log(sections, questionList);
  const params = useParams();
  const goalID = params.id;
  const examID = params.examID;
  const menuOptions = useMemo(() => ["Remove"], []);
  const { showSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null); // null means all closed

  // Handle accordion toggle - only one open at a time
  const handleToggleSection = (sectionIndex) => {
    setExpandedSection((prev) => (prev === sectionIndex ? null : sectionIndex));
  };

  // Use refs to track if data has been fetched
  const hasFetchedExamData = useRef(false);
  const hasFetchedQuestions = useRef(false);

  const fetchExamData = useCallback(async () => {
    if (hasFetchedExamData.current && sections?.length > 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/${examID}`
      );
      if (response.success) {
        setSections(response.data.questionSection);
        hasFetchedExamData.current = true;
      }
    } catch (error) {
      showSnackbar("Error fetching sections", "error", "", "3000");
    } finally {
      setIsLoading(false);
    }
  }, [examID, setSections, showSnackbar, sections?.length]);

  const createSection = useCallback(
    async ({ params = {} }) => {
      try {
        const response = await apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/section`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              examID: examID,
              type: type,
              ...params,
            }),
          }
        );

        if (response.success) {
          if (
            params.sectionIndex !== undefined &&
            params.sectionIndex !== null
          ) {
            // Update existing section
            const updatedSections = [...sections];
            if (updatedSections[params.sectionIndex]) {
              updatedSections[params.sectionIndex] = {
                ...updatedSections[params.sectionIndex],
                ...params,
                title:
                  params.sectionTitle ||
                  updatedSections[params.sectionIndex].title,
              };
              setSections(updatedSections);
              showSnackbar(
                "Section updated successfully",
                "success",
                "",
                "3000"
              );
            }
          } else {
            // Create new section
            const newSection = {
              sectionIndex: sections.length,
              sectionTitle: params.sectionTitle || "",
              questions: [],
              ...params,
            };
            setSections([...sections, newSection]);
            showSnackbar("Section created successfully", "success", "", "3000");
          }
        } else {
          showSnackbar(response.message, "error", "", "3000");
        }
      } catch (error) {
        showSnackbar("Error occured", "error", "", "3000");
      }
    },
    [examID, type, sections, setSections, showSnackbar]
  );
  const fetchQuestions = useCallback(async () => {
    if (hasFetchedQuestions.current && questionList.length > 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/questions/get`
      );
      if (response.success) {
        setQuestionList(response.data);
        hasFetchedQuestions.current = true;
      }
    } catch (error) {
      showSnackbar("Error fetching questions", "error", "", "3000");
    } finally {
      setIsLoading(false);
    }
  }, [setQuestionList, showSnackbar, questionList.length]);

  useEffect(() => {
    // Only fetch if not already fetched
    if (!hasFetchedExamData.current) {
      fetchExamData();
    }
    if (!hasFetchedQuestions.current) {
      fetchQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency - only run on mount

  const deleteSection = useCallback(
    (sectionIndex) => {
      try {
        apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/delete-section`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sectionIndex: sectionIndex,
              examID: examID,
              goalID: goalID,
              type: type,
            }),
          }
        ).then((data) => {
          if (data.success) {
            // Optimistically remove the section from state
            const updatedSections = sections
              .filter((_, index) => index !== sectionIndex)
              .map((section, index) => ({
                ...section,
                sectionIndex: index, // Reindex sections
              }));
            setSections(updatedSections);
            showSnackbar(data.message, "success", "", "3000");
          } else {
            showSnackbar(data.message, "error", "", "3000");
          }
        });
      } catch (error) {
        showSnackbar("Error deleting section", "error", "", "3000");
      }
    },
    [examID, goalID, type, sections, setSections, showSnackbar]
  );

  return (
    <Tooltip
      title={isLive ? "You cannot Edit when exam is live" : ""}
      followCursor
      placement="right"
    >
      <Stack marginTop="24px" gap="24px">
        <Stack flexDirection="row" gap="20px" alignItems="center">
          <Tooltip
            title={isLive ? "You cannot create section when exam is live" : ""}
            followCursor
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={createSection}
              sx={{
                padding: "10px 24px",
                backgroundColor: "var(--primary-color)",
                textTransform: "none",
                fontFamily: "Lato",
                fontWeight: "600",
                fontSize: "14px",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(33, 150, 243, 0.2)",
                cursor: isLive ? "not-allowed" : "pointer",
                "&:hover": {
                  backgroundColor: "var(--primary-color-dark)",
                  boxShadow: "0 6px 16px rgba(33, 150, 243, 0.3)",
                  color: "white",
                },
              }}
              disabled={isLive}
              disableElevation
            >
              Add Section
            </Button>
          </Tooltip>
          <Stack
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--white)",
              borderRadius: "8px",
              padding: "8px 16px",
              minWidth: "160px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "14px",
                color: "var(--text2)",
                fontWeight: "600",
              }}
            >
              Total Sections
            </Typography>
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "16px",
                color: "var(--primary-color)",
                fontWeight: "700",
                backgroundColor: "var(--primary-color-acc-2)",
                padding: "2px 10px",
                borderRadius: "6px",
              }}
            >
              {sections.length}
            </Typography>
          </Stack>
        </Stack>
        {!isLoading ? (
          sections.length > 0 ? (
            <Stack gap="16px">
              {sections.map((section, index) => (
                <SectionCard
                  key={index}
                  icon={
                    <Image
                      src={question.src}
                      alt="icon"
                      width={24}
                      height={24}
                    />
                  }
                  sectionTitle={section.title || section.sectionTitle}
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
                  allSections={sections}
                  expandedSection={expandedSection}
                  onToggleSection={handleToggleSection}
                />
              ))}
            </Stack>
          ) : (
            <Stack
              width={"100%"}
              minHeight={"400px"}
              justifyContent="center"
              alignItems="center"
            >
              <NoDataFound info="No Sections Created Yet" />
            </Stack>
          )
        ) : (
          <Stack gap="16px">
            <QuestionCardSkeleton />
            <QuestionCardSkeleton />
          </Stack>
        )}
      </Stack>
    </Tooltip>
  );
}
