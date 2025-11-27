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
  Box,
} from "@mui/material";
import * as XLSX from "xlsx";
import { useEffect, useRef, useState } from "react";
import { sanitizeQuestions } from "@/src/lib/sanitizeQuestion";
import QuestionCard from "@/src/components/QuestionCard/QuestionCard";
import {
  Close,
  ExpandMore,
  Visibility,
  CloudUpload,
  InsertDriveFile,
  Delete,
} from "@mui/icons-material";
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
    setIsPreviewDialog(true);
    setPreviewData(question);
  };
  const previewDialogClose = () => {
    setIsPreviewDialog(false);
  };

  const triggerFileInput = () => {
    if (!selectedSubject) {
      enqueueSnackbar("Please select a subject first.", { variant: "warning" });
      return;
    }
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
    setQuestions(sanitizedQuestions);
    setPreview(sanitizedQuestions);
    if (errors && errors.length > 0) {
      setIsOpenAccordion(true);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setQuestions([]);
    setPreview([]);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!selectedSubject) {
      enqueueSnackbar("Please select a subject before importing.", {
        variant: "error",
      });
      setIsLoading(false);
      return;
    }
    if (!questions.length) {
      enqueueSnackbar("Please upload a file to import questions.", {
        variant: "error",
      });
      setIsLoading(false);
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
        handleRemoveFile();
        close();
      } else {
        enqueueSnackbar("Import failed: " + result.error, { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar("Upload failed.", {
        variant: "error",
      });
    } finally {
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
            onClick={() => {
              handleRemoveFile();
              close();
            }}
            disabled={isLoading}
            sx={{
              color: "var(--text2)",
              borderColor: "var(--border-color)",
              textTransform: "none",
              borderRadius: "8px",
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
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
              borderRadius: "8px",
              boxShadow: "none",
            }}
          >
            {isLoading ? "Importing..." : "Import Questions"}
          </Button>
        </Stack>
      }
      titleComponent={
        <Stack direction="row" gap="10px" mt="20px" alignItems="center">
          <StyledSelect
            title="Select Subject"
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              // If file exists, maybe re-validate? For now, we just set subject.
              // Ideally, changing subject might require re-parsing if validation depends on it.
              // But sanitizeQuestions uses subjectID for the object, not much validation logic there usually.
            }}
            options={subjectTitle}
            getLabel={(s) => s.title}
            getValue={(s) => s.subjectID}
          />
        </Stack>
      }
    >
      <Stack p="24px" gap="24px" height="100%">
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv, .xlsx, .xls"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {!file ? (
          <Stack
            onClick={triggerFileInput}
            alignItems="center"
            justifyContent="center"
            gap="12px"
            sx={{
              border: "2px dashed var(--border-color)",
              borderRadius: "12px",
              backgroundColor: "var(--bg-color)",
              padding: "40px",
              cursor: selectedSubject ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
              opacity: selectedSubject ? 1 : 0.6,
              "&:hover": {
                borderColor: selectedSubject
                  ? "var(--primary-color)"
                  : "var(--border-color)",
                backgroundColor: selectedSubject
                  ? "rgba(102, 126, 234, 0.04)"
                  : "var(--bg-color)",
              },
            }}
          >
            <Box
              sx={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "rgba(102, 126, 234, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CloudUpload
                sx={{ fontSize: "32px", color: "var(--primary-color)" }}
              />
            </Box>
            <Stack alignItems="center">
              <Typography
                variant="h6"
                fontWeight="600"
                color="var(--text1)"
                fontSize="16px"
              >
                Click to upload or drag and drop
              </Typography>
              <Typography variant="body2" color="var(--text3)">
                Supports .csv, .xlsx, .xls
              </Typography>
            </Stack>
          </Stack>
        ) : (
          <Stack gap="20px">
            {/* File Info Card */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                p: 2,
                border: "1px solid var(--border-color)",
                borderRadius: "10px",
                backgroundColor: "var(--white)",
              }}
            >
              <Stack direction="row" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    backgroundColor: "#E8F0FE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    fontWeight="700"
                    fontSize="10px"
                    color="var(--primary-color)"
                  >
                    XLSX
                  </Typography>
                </Box>
                <Stack>
                  <Typography fontWeight="600" fontSize="14px">
                    {file.name}
                  </Typography>
                  <Typography fontSize="12px" color="var(--text3)">
                    {(file.size / 1024).toFixed(2)} KB
                  </Typography>
                </Stack>
              </Stack>
              <IconButton onClick={handleRemoveFile}>
                <Close sx={{ color: "var(--text3)" }} />
              </IconButton>
            </Stack>

            {/* Error Section */}
            {error && error.length > 0 && (
              <Accordion
                disableGutters
                expanded={isOpenAccordion}
                onChange={() => setIsOpenAccordion(!isOpenAccordion)}
                sx={{
                  border: "1px solid #ffcdd2",
                  borderRadius: "10px !important",
                  backgroundColor: "#ffebee",
                  boxShadow: "none",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: "#d32f2f" }} />}
                >
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Typography
                      color="#d32f2f"
                      fontWeight="600"
                      fontSize="14px"
                    >
                      Found {error.length} errors
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack gap="10px">
                    {error.map((e, idx) => (
                      <ErrorQuestionCard key={idx} error={e} />
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Preview List */}
            {preview.length > 0 && (
              <Stack gap="16px">
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography fontWeight="700" fontSize="16px">
                    Preview ({preview.length} Questions)
                  </Typography>
                </Stack>
                <Stack gap="12px">
                  {preview.map((row, i) => (
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
                      questionNumber={`Q${i + 1}`}
                      preview={
                        <Chip
                          icon={<Visibility sx={{ fontSize: "14px" }} />}
                          label="Preview"
                          onClick={() => previewDialogOpen(row)}
                          size="small"
                          sx={{
                            fontSize: "11px",
                            fontWeight: "600",
                            height: "24px",
                            backgroundColor: "rgba(102, 126, 234, 0.1)",
                            color: "var(--primary-color)",
                            cursor: "pointer",
                            "& .MuiChip-icon": {
                              color: "var(--primary-color)",
                            },
                          }}
                        />
                      }
                    />
                  ))}
                </Stack>
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
      <DialogBox
        title="Preview Question"
        isOpen={isPreviewDialog}
        icon={
          <IconButton
            sx={{ borderRadius: "8px", padding: "4px", marginLeft: "auto" }}
            onClick={previewDialogClose}
          >
            <Close sx={{ color: "var(--text2)" }} />
          </IconButton>
        }
      >
        <Stack sx={{ width: "100%" }}>
          <PreviewStepper questionData={previewData} />
        </Stack>
      </DialogBox>
    </LongDialogBox>
  );
}
