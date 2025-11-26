"use client";
import { Add, Close, Delete, ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
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
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [tempTitle, setTempTitle] = useState(sectionTitle);
  const [initialTitle, setInitialTitle] = useState(sectionTitle);
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

  return (
    <Accordion
      disableGutters
      expanded={isOpen}
      sx={{
        border: "1px solid var(--border-color)",
        borderRadius: "16px",
        minHeight: "80px",
        width: "100%",
        boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
        transition: "all 0.3s ease",
        overflow: "hidden",
        "&:before": { display: "none" },
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          borderColor: "var(--primary-color)",
          transform: "translateY(-2px)",
        },
      }}
      elevation={0}
    >
      <AccordionSummary
        component="div"
        sx={{
          margin: "0px",
          padding: "12px 24px",
          "& .MuiAccordionSummary-content": { margin: 0 },
        }}
        expandIcon={
          <IconButton
            sx={{
              padding: "8px",
              backgroundColor: "var(--background-color)",
              "&:hover": { backgroundColor: "var(--border-color)" },
            }}
            onClick={() => setIsOpen(!isOpen)}
          >
            <ExpandMore sx={{ color: "var(--text2)", fontSize: "24px" }} />
          </IconButton>
        }
      >
        <Stack
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: "100%", gap: "24px" }}
        >
          <Stack flexDirection="row" alignItems="center" gap="20px" flex={1}>
            <Stack
              sx={{
                minWidth: "56px",
                height: "56px",
                backgroundColor: "var(--primary-color-acc-2)",
                borderRadius: "12px",
                justifyContent: "center",
                alignItems: "center",
                color: "var(--primary-color)",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
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
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "var(--text1)",
                  padding: 0,
                  "& fieldset": { border: "none" },
                  "&.Mui-focused fieldset": { border: "none" },
                },
                "& .MuiInputBase-input": { padding: "8px 0" },
              }}
            />
          </Stack>

          <Stack flexDirection="row" alignItems="center" gap="24px">
            <Stack
              flexDirection="row"
              alignItems="center"
              gap="16px"
              sx={{
                backgroundColor: "var(--background-color)",
                padding: "8px 12px",
                borderRadius: "10px",
                border: "1px solid var(--border-color)",
              }}
            >
              <Stack gap="4px">
                <Typography
                  sx={{
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "#2e7d32",
                    textTransform: "uppercase",
                  }}
                >
                  Positive
                </Typography>
                <StyledTextField
                  placeholder="+ Marks"
                  value={positiveMarks || ""}
                  onFocus={(e) => {
                    e.stopPropagation();
                    setPositiveMarks(e.target.value);
                    e.target.select();
                  }}
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
                    if (/^\d*$/.test(value)) {
                      setPositiveMarks(value);
                    }
                  }}
                  sx={{
                    width: "70px",
                    "& .MuiOutlinedInput-root": {
                      color: "#2e7d32",
                      fontWeight: "700",
                      fontSize: "14px",
                      backgroundColor: "#e8f5e9",
                      borderRadius: "6px",
                      height: "32px",
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
                  height: "30px",
                  backgroundColor: "var(--border-color)",
                }}
              />

              <Stack gap="4px">
                <Typography
                  sx={{
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "#c62828",
                    textTransform: "uppercase",
                  }}
                >
                  Negative
                </Typography>
                <StyledTextField
                  placeholder="- Marks"
                  value={negativeMarks || ""}
                  onFocus={(e) => {
                    e.stopPropagation();
                    setNegativeMarks(e.target.value);
                    e.target.select();
                  }}
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
                    if (/^\d*$/.test(value)) {
                      setNegativeMarks(value);
                    }
                  }}
                  sx={{
                    width: "70px",
                    "& .MuiOutlinedInput-root": {
                      color: "#c62828",
                      fontWeight: "700",
                      fontSize: "14px",
                      backgroundColor: "#ffebee",
                      borderRadius: "6px",
                      height: "32px",
                      "& fieldset": { border: "none" },
                    },
                    "& input": { textAlign: "center", padding: "0" },
                  }}
                  disabled={isLive}
                />
              </Stack>
            </Stack>

            <Stack flexDirection="row" gap="12px">
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleDialogOpen}
                sx={{
                  backgroundColor: "var(--primary-color)",
                  textTransform: "none",
                  borderRadius: "8px",
                  padding: "8px 20px",
                  fontFamily: "Lato",
                  fontWeight: "600",
                  fontSize: "14px",
                  boxShadow: "0 4px 12px rgba(33, 150, 243, 0.2)",
                  "&:hover": {
                    backgroundColor: "var(--primary-color-dark)",
                    boxShadow: "0 6px 16px rgba(33, 150, 243, 0.3)",
                    color: "white",
                  },
                }}
                disabled={isLive}
                disableElevation
              >
                {button}
              </Button>
              <IconButton
                onClick={() => deleteSection(sectionIndex)}
                disabled={isLive}
                sx={{
                  color: "var(--delete-color)",
                  backgroundColor: "rgba(244, 67, 54, 0.08)",
                  borderRadius: "8px",
                  padding: "8px",
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: "rgba(244, 67, 54, 0.15)",
                    transform: "scale(1.05)",
                  },
                }}
              >
                <Delete fontSize="small" />
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
      <AccordionDetails sx={{ padding: "0 24px 24px 24px" }}>
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
