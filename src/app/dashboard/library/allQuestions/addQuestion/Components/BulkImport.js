"use client";
import LongDialogBox from "@/src/components/LongDialogBox/LongDialogBox";
import StyledSelect from "@/src/components/StyledSelect/StyledSelect";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  DialogActions,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import * as XLSX from "xlsx";
import { useEffect, useRef, useState } from "react";
import { sanitizeQuestions } from "@/src/lib/sanitizeQuestion";
import QuestionCard from "@/src/components/QuestionCard/QuestionCard";
import { Close, ExpandMore, Visibility } from "@mui/icons-material";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import PreviewStepper from "./PreviewStepper";
import ErrorQuestionCard from "./ErrorQuestionCard";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import { enqueueSnackbar } from "notistack";

export default function BulkImport({ subjectTitle, isOpen, close }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [isPreviewDialog, setIsPreviewDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isOpenAccordion, setIsOpenAccordion] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");

  const previewDialogOpen = (question) => {
    console.log(question);
    setIsPreviewDialog(true);
    setPreviewData(question);
    // setSelectedSubject(question.subjectID);
  };
  const previewDialogClose = () => {
    setIsPreviewDialog(false);
  };

  const triggerFileInput = () => {
    if (!selectedSubject) {
      setError("Please select a subject before choosing a file.");
      return;
    }
    setError("");
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    const data = await uploadedFile.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    const { questions: sanitizedQuestions, errors } = sanitizeQuestions(
      jsonData,
      selectedSubject
    );
    setError(errors);
    console.log(sanitizedQuestions, errors);
    setQuestions(sanitizedQuestions);
    setPreview(sanitizedQuestions);
    setError(errors);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!selectedSubject) {
      enqueueSnackbar("Please select a subject before importing.", {
        variant: "error",
      });
      return;
    }
    if (!questions.length) {
      enqueueSnackbar("Please upload a file to import questions.", {
        variant: "error",
      });
      return;
    }

    try {
      const response = await fetch("/api/questions/questions-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questions),
      });
      const result = await response.json();
      if (result.success) {
        enqueueSnackbar("Questions imported successfully.", {
          variant: "success",
        });
        close();
      }
    } catch (err) {
      enqueueSnackbar("Upload failed.", {
        variant: "error",
      });
    } finally {
      close();
      setIsLoading(false);
    }
  };

  return (
    <LongDialogBox
      isOpen={isOpen}
      title="Import Questions"
      onClose={close}
      actions={
        <Stack direction="row" gap="10px">
          <Button
            variant="outlined"
            sx={{
              color: "var(--delete-color)",
              borderColor: "var(--delete-color)",
              textTransform: "none",
            }}
            disabled={isLoading}
            onClick={() => {
              setError([]);
              setQuestions([]);
              setPreview([]);
              setFile(null);
              close();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              !selectedSubject || !questions.length || !file || isLoading
            }
            loading={isLoading}
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
            }}
          >
            Upload
          </Button>
        </Stack>
      }
      titleComponent={
        <Stack direction="row" gap="10px" mt="20px">
          <StyledSelect
            title="Select Subject"
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setError("");
            }}
            options={subjectTitle}
            getLabel={(s) => s.title}
            getValue={(s) => s.subjectID}
          />

          <Stack
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              width: "100%",
              height: "40px",
              border: "1px solid var(--border-color)",
              borderRadius: "4px",
              padding: "8px",
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
              style={{ visibility: "hidden", position: "absolute" }}
            />
            {file ? (
              <Typography>{file.name}</Typography>
            ) : (
              <Typography>Select File</Typography>
            )}
            <Button
              variant="contained"
              sx={{
                backgroundColor: "var(--primary-color)",
                height: "30px",
                textTransform: "none",
                marginLeft: "auto",
                minWidth: "130px",
              }}
              onClick={triggerFileInput}
              disabled={!selectedSubject}
            >
              Choose File
            </Button>
          </Stack>
        </Stack>
      }
    >
      <Stack p="20px" gap="20px" height="100%">
        {error.length > 0 ? (
          <Accordion
            disableGutters
            expanded={isOpenAccordion}
            onClick={() => setIsOpenAccordion(!isOpenAccordion)}
            sx={{
              border: "1px solid var(--delete-color)",
              borderRadius: "10px",
              minHeight: "80px",
              width: "100%",
              "&:before": { display: "none" },
              "&.MuiPaper-root": {
                minHeight: "0px",
              },
            }}
            elevation={0}
          >
            <AccordionSummary
              component="div"
              sx={{ margin: "0px" }}
              expandIcon={
                <IconButton
                  sx={{ padding: "3px" }}
                  onClick={() => setIsOpenAccordion(!isOpenAccordion)}
                >
                  <ExpandMore
                    sx={{ color: "var(--text2)", fontSize: "30px" }}
                  />
                </IconButton>
              }
            >
              <Typography color="error" fontSize="14px">
                Some rows have errors
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack gap="10px">
                {error?.map((e) => (
                  <ErrorQuestionCard key={e.row} error={e} />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ) : null}
        {preview.length > 0 ? (
          preview.map((row, i) => (
            <QuestionCard
              key={i}
              question={row.title}
              difficulty={
                row.difficultyLevel === 0
                  ? 1
                  : row.difficultyLevel === 1
                  ? 2
                  : 3
              }
              questionType={row.type}
              subjectID={row.subjectID}
              preview={
                <Chip
                  icon={<Visibility sx={{ fontSize: "small" }} />}
                  label="Preview"
                  onClick={() => previewDialogOpen(row)}
                  sx={{
                    fontSize: "10px",
                    fontFamily: "Lato",
                    fontWeight: "700",
                    height: "20px",
                    backgroundColor: "var(--border-color)",
                    color: "var(--text3)",
                  }}
                />
              }
            />
          ))
        ) : (
          <Stack
            justifyContent="center"
            alignItems="center"
            height="100%"
            width="100%"
            minHeight="400px"
          >
            <NoDataFound info="Please upload a file to import questions" />
          </Stack>
        )}
      </Stack>
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
        <Stack sx={{ width: "100%" }}>
          {<PreviewStepper questionData={previewData} />}
        </Stack>
      </DialogBox>
    </LongDialogBox>
  );
}
