"use client";
import { Add, Close, Delete, ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { memo, useCallback, useEffect, useState } from "react";
import StyledTextField from "../../StyledTextField/StyledTextField";
import { apiFetch } from "@/src/lib/apiFetch";
import { useParams } from "next/navigation";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import AddQuestionDialog from "@/src/app/dashboard/goals/[id]/testseries/[examID]/Components/AddQuestionDialog";
import DialogBox from "../../DialogBox/DialogBox";
import PreviewStepper from "@/src/app/dashboard/library/allQuestions/addQuestion/Components/PreviewStepper";
import QuestionList from "@/src/app/dashboard/goals/[id]/testseries/[examID]/Components/QuestionList";

function SectionCard({
  icon,
  button,
  sectionTitle,
  sectionIndex,
  pMark,
  nMark,
  questionList,
  deleteSection,
  createSection,
  type,
  isLive,
  allSections,
  expandedSection,
  onToggleSection,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  // Fix: Use the section from allSections to get the current title
  const currentSection = allSections[sectionIndex];
  const displayTitle =
    currentSection?.title || currentSection?.sectionTitle || sectionTitle || "";
  const [tempTitle, setTempTitle] = useState(displayTitle);
  const [initialTitle, setInitialTitle] = useState(displayTitle);
  const params = useParams();
  const goalID = params.id;
  const examID = params.examID;
  const { showSnackbar } = useSnackbar();
  const [isPreviewDialog, setIsPreviewDialog] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [previewSelect, setPreviewSelect] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [positiveMarks, setPositiveMarks] = useState(pMark);
  const [negativeMarks, setNegativeMarks] = useState(nMark);

  // Update tempTitle when section data changes
  useEffect(() => {
    const currentTitle =
      currentSection?.title ||
      currentSection?.sectionTitle ||
      sectionTitle ||
      "";
    setTempTitle(currentTitle);
    setInitialTitle(currentTitle);
  }, [
    currentSection?.title,
    currentSection?.sectionTitle,
    sectionTitle,
    sectionIndex,
  ]);

  const previewDialogOpen = (question) => {
    setPreviewSelect(question);
    setIsPreviewDialog(true);
  };
  const previewDialogClose = () => {
    setIsPreviewDialog(false);
  };

  const handleDialogOpen = () => setIsDialogOpen(true);
  const handleDialogClose = () => setIsDialogOpen(false);

  const fetchSectionQuestions = useCallback(() => {
    setIsLoading(true);
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/get-section`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalID, examID, sectionIndex, type: type }),
    }).then((data) => {
      if (data.success) {
        setQuestions(data.data);
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
      setIsLoading(false);
    });
  }, [goalID, examID, sectionIndex, type, showSnackbar]);

  useEffect(() => {
    fetchSectionQuestions();
  }, [fetchSectionQuestions]);

  const isOpen = expandedSection === sectionIndex;

  return (
    <Accordion
      disableGutters
      expanded={isOpen}
      onChange={() => onToggleSection(sectionIndex)}
      sx={{
        border: isOpen
          ? "1.5px solid var(--primary-color)"
          : "1px solid var(--border-color)",
        borderRadius: "10px",
        minHeight: "52px",
        width: "100%",
        boxShadow: isOpen
          ? "0 2px 8px rgba(24, 113, 99, 0.1)"
          : "0 1px 4px rgba(0,0,0,0.03)",
        transition: "all 0.2s ease",
        overflow: "hidden",
        backgroundColor: isOpen ? "rgba(24, 113, 99, 0.02)" : "var(--white)",
        "&:before": { display: "none" },
        "&:hover": {
          boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
          borderColor: "var(--primary-color)",
        },
      }}
      elevation={0}
    >
      <AccordionSummary
        component="div"
        sx={{
          margin: "0px",
          padding: "10px 16px",
          minHeight: "unset",
          "& .MuiAccordionSummary-content": { margin: 0 },
          backgroundColor: isOpen ? "rgba(24, 113, 99, 0.04)" : "transparent",
          borderBottom: isOpen ? "1px solid rgba(24, 113, 99, 0.15)" : "none",
        }}
        expandIcon={
          <IconButton
            size="small"
            sx={{
              padding: "4px",
              backgroundColor: isOpen
                ? "rgba(24, 113, 99, 0.1)"
                : "var(--bg-color)",
              color: isOpen ? "var(--primary-color)" : "var(--text2)",
              borderRadius: "6px",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "rgba(24, 113, 99, 0.15)",
                color: "var(--primary-color)",
              },
            }}
          >
            <ExpandMore sx={{ fontSize: "20px" }} />
          </IconButton>
        }
      >
        <Stack
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: "100%", gap: "12px" }}
        >
          <Stack flexDirection="row" alignItems="center" gap="10px" flex={1}>
            <Stack
              sx={{
                minWidth: "36px",
                height: "36px",
                background:
                  "linear-gradient(135deg, rgba(var(--primary-rgb), 0.12) 0%, rgba(var(--primary-rgb), 0.06) 100%)",
                borderRadius: "8px",
                justifyContent: "center",
                alignItems: "center",
                color: "var(--primary-color)",
                border: "1px solid rgba(var(--primary-rgb), 0.2)",
              }}
            >
              {icon}
            </Stack>
            <StyledTextField
              placeholder="Enter Section Title"
              value={tempTitle || ""}
              onFocus={(e) => {
                e.stopPropagation();
                setInitialTitle(e.target.value);
                e.target.select();
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onBlur={(e) => {
                const newTitle = e.target.value;
                if (newTitle !== initialTitle) {
                  createSection({
                    params: {
                      sectionTitle: newTitle,
                      sectionIndex: sectionIndex,
                    },
                  });
                }
              }}
              onChange={(e) => {
                const newTitle = e.target.value;
                setTempTitle(newTitle);
              }}
              disabled={isLive}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "var(--text1)",
                  padding: 0,
                  "& fieldset": { border: "none" },
                  "&.Mui-focused fieldset": {
                    border: "1px solid var(--primary-color)",
                    borderRadius: "6px",
                  },
                },
                "& .MuiInputBase-input": { padding: "6px 10px" },
              }}
            />

            {/* Question Count Badge */}
            <Chip
              label={`${questions.length} Qs`}
              size="small"
              sx={{
                height: "24px",
                fontSize: "12px",
                fontWeight: "700",
                backgroundColor:
                  questions.length > 0
                    ? "rgba(76, 175, 80, 0.1)"
                    : "rgba(158, 158, 158, 0.1)",
                color: questions.length > 0 ? "#2e7d32" : "var(--text3)",
                border: `1px solid ${
                  questions.length > 0
                    ? "rgba(76, 175, 80, 0.3)"
                    : "rgba(158, 158, 158, 0.3)"
                }`,
              }}
            />
          </Stack>

          <Stack flexDirection="row" alignItems="center" gap="10px">
            {/* Marks Section */}
            <Stack
              flexDirection="row"
              alignItems="center"
              gap="8px"
              sx={{
                backgroundColor: "var(--bg-color)",
                padding: "4px 10px",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Stack alignItems="center" gap="1px">
                <Typography
                  sx={{
                    fontSize: "9px",
                    fontWeight: "700",
                    color: "#2e7d32",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  +
                </Typography>
                <StyledTextField
                  placeholder="0"
                  value={positiveMarks || ""}
                  onFocus={(e) => {
                    e.stopPropagation();
                    setPositiveMarks(e.target.value);
                    e.target.select();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onBlur={(e) => {
                    createSection({
                      params: {
                        pMark: positiveMarks,
                        sectionIndex: sectionIndex,
                      },
                    });
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d*$/.test(value)) {
                      setPositiveMarks(value);
                    }
                  }}
                  sx={{
                    width: "50px",
                    "& .MuiOutlinedInput-root": {
                      color: "#2e7d32",
                      fontWeight: "700",
                      fontSize: "13px",
                      backgroundColor: "#e8f5e9",
                      borderRadius: "6px",
                      height: "28px",
                      "& fieldset": { border: "none" },
                    },
                    "& input": { textAlign: "center", padding: "0" },
                  }}
                  disabled={isLive}
                />
              </Stack>

              <Stack
                sx={{
                  width: "1px",
                  height: "22px",
                  backgroundColor: "var(--border-color)",
                }}
              />

              <Stack alignItems="center" gap="1px">
                <Typography
                  sx={{
                    fontSize: "9px",
                    fontWeight: "700",
                    color: "#c62828",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  -
                </Typography>
                <StyledTextField
                  placeholder="0"
                  value={negativeMarks || ""}
                  onFocus={(e) => {
                    e.stopPropagation();
                    setNegativeMarks(e.target.value);
                    e.target.select();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onBlur={(e) => {
                    createSection({
                      params: {
                        nMark: negativeMarks,
                        sectionIndex: sectionIndex,
                      },
                    });
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d*$/.test(value)) {
                      setNegativeMarks(value);
                    }
                  }}
                  sx={{
                    width: "50px",
                    "& .MuiOutlinedInput-root": {
                      color: "#c62828",
                      fontWeight: "700",
                      fontSize: "13px",
                      backgroundColor: "#ffebee",
                      borderRadius: "6px",
                      height: "28px",
                      "& fieldset": { border: "none" },
                    },
                    "& input": { textAlign: "center", padding: "0" },
                  }}
                  disabled={isLive}
                />
              </Stack>
            </Stack>

            <Stack flexDirection="row" gap="6px">
              <Button
                variant="contained"
                size="small"
                startIcon={<Add sx={{ fontSize: "16px" }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDialogOpen();
                }}
                sx={{
                  backgroundColor: "var(--primary-color)",
                  textTransform: "none",
                  borderRadius: "6px",
                  padding: "4px 12px",
                  fontFamily: "Lato",
                  fontWeight: "600",
                  fontSize: "12px",
                  minHeight: "30px",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "var(--primary-color-dark)",
                    boxShadow: "0 2px 8px rgba(24, 113, 99, 0.2)",
                  },
                }}
                disabled={isLive}
                disableElevation
              >
                {button}
              </Button>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  if (questions.length > 0) {
                    showSnackbar(
                      "Please remove all questions before deleting the section",
                      "error",
                      "",
                      "3000"
                    );
                    return;
                  }
                  deleteSection(sectionIndex);
                }}
                disabled={isLive}
                sx={{
                  color: "var(--delete-color)",
                  backgroundColor: "rgba(244, 67, 54, 0.08)",
                  borderRadius: "6px",
                  padding: "4px",
                  "&:hover": {
                    backgroundColor: "rgba(244, 67, 54, 0.15)",
                  },
                }}
              >
                <Delete sx={{ fontSize: "18px" }} />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>
        {isDialogOpen && (
          <AddQuestionDialog
            isDialogOpen={isDialogOpen}
            handleDialogClose={handleDialogClose}
            questionList={questionList}
            goalID={goalID}
            examID={examID}
            sectionIndex={sectionIndex}
            tempTitle={tempTitle}
            fetchQuestions={fetchSectionQuestions}
            type={type}
            allSections={allSections}
          />
        )}
      </AccordionSummary>
      <AccordionDetails sx={{ padding: "0 16px 16px 16px" }}>
        <QuestionList
          questions={questions}
          previewDialogOpen={previewDialogOpen}
          goalID={goalID}
          examID={examID}
          sectionIndex={sectionIndex}
          selectedQuestions={selectedQuestions}
          setSelectedQuestions={setSelectedQuestions}
          fetchQuestions={fetchSectionQuestions}
          isLoading={isLoading}
          type={type}
          isLive={isLive}
        />
      </AccordionDetails>
      <DialogBox
        title="Preview"
        isOpen={isPreviewDialog}
        icon={
          <IconButton
            sx={{ borderRadius: "4px", padding: "3px", marginLeft: "auto" }}
            onClick={previewDialogClose}
          >
            <Close sx={{ color: "var(--text2)" }} />
          </IconButton>
        }
      >
        <Stack sx={{ width: "100%", padding: "10px" }}>
          {<PreviewStepper questionData={previewSelect} />}
        </Stack>
      </DialogBox>
    </Accordion>
  );
}

export default memo(SectionCard);
