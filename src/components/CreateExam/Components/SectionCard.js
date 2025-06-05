"use client";
import { Add, Close, Delete, ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  IconButton,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import StyledTextField from "../../StyledTextField/StyledTextField";
import { apiFetch } from "@/src/lib/apiFetch";
import { useParams } from "next/navigation";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import AddQuestionDialog from "@/src/app/dashboard/goals/[id]/testseries/[examID]/Components/AddQuestionDialog";
import DialogBox from "../../DialogBox/DialogBox";
import PreviewStepper from "@/src/app/dashboard/library/allQuestions/addQuestion/Components/PreviewStepper";
import QuestionList from "@/src/app/dashboard/goals/[id]/testseries/[examID]/Components/QuestionList";

export default function SectionCard({
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

  const fetchSectionQuestions = () => {
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
  };

  useEffect(() => {
    fetchSectionQuestions();
  }, []);

  return (
    <Accordion
      disableGutters
      expanded={isOpen}
      sx={{
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        minHeight: "80px",
        width: "100%",
        "&:before": { display: "none" },
      }}
      elevation={0}
    >
      <AccordionSummary
        component="div"
        sx={{ margin: "0px" }}
        expandIcon={
          <IconButton
            sx={{ padding: "3px" }}
            onClick={() => setIsOpen(!isOpen)}
          >
            <ExpandMore sx={{ color: "var(--text2)", fontSize: "30px" }} />
          </IconButton>
        }
      >
        <Stack
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: "100%" }}
        >
          <Stack flexDirection="row" alignItems="center" gap="20px">
            <Stack
              sx={{
                minWidth: "60px",
                height: "60px",
                backgroundColor: "var(--sec-color-acc-1)",
                borderRadius: "10px",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {icon}
            </Stack>
            <StyledTextField
              placeholder="Enter Section"
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
            />
          </Stack>
          <Stack flexDirection="row" alignItems="center" gap="15px">
            <Stack flexDirection="row" alignItems="center" gap="8px">
              <StyledTextField
                placeholder="Positive marks"
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
                  "& .MuiOutlinedInput-root": {
                    color: "var(--primary-color)",
                    fontWeight: "700",
                  },
                }}
                disabled={isLive}
              />
              <StyledTextField
                placeholder="Negative marks"
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
                  "& .MuiOutlinedInput-root": {
                    color: "var(--sec-color)",
                    fontWeight: "700",
                  },
                }}
                disabled={isLive}
              />
            </Stack>
            <Button
              variant="contained"
              endIcon={<Add />}
              onClick={handleDialogOpen}
              sx={{
                backgroundColor: "var(--primary-color)",
                textTransform: "none",
              }}
              disabled={isLive}
              disableElevation
            >
              {button}
            </Button>
            <IconButton
              onClick={() => deleteSection(sectionIndex)}
              disabled={isLive}
            >
              <Delete sx={{ color: "var(--delete-color)" }} />
            </IconButton>
          </Stack>
        </Stack>
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
        />
      </AccordionSummary>
      <AccordionDetails>
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
