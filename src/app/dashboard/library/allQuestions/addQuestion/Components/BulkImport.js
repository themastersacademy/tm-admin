"use client";
import {
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
  Box,
  Autocomplete,
  TextField,
  InputAdornment,
  Dialog,
  CircularProgress,
} from "@mui/material";
import { readExcel, writeExcel } from "@/src/lib/excel";
import { useRef, useState } from "react";
import { sanitizeQuestions } from "@/src/lib/sanitizeQuestion";
import QuestionCard from "@/src/components/QuestionCard/QuestionCard";
import {
  Close,
  ExpandMore,
  Visibility,
  CloudUpload,
  InsertDriveFile,
  Category,
  FileUploadOutlined,
  CheckCircleOutline,
  ErrorOutline,
  InfoOutlined,
} from "@mui/icons-material";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import PreviewStepper from "./PreviewStepper";
import ErrorQuestionCard from "./ErrorQuestionCard";
import { enqueueSnackbar } from "notistack";

export default function BulkImport({ subjectTitle, isOpen, close, onSuccess }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [isPreviewDialog, setIsPreviewDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isOpenAccordion, setIsOpenAccordion] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState([]);

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

  const handleDownloadTemplate = () => {
    const headers = [
      "Question",
      "Type",
      "Level",
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4",
      "Correct answers",
      "Solution",
      "Blank 1",
    ];
    const data = [
      {
        Question: "Sample Question?",
        Type: "MCQ",
        Level: 1,
        "Option 1": "Option A",
        "Option 2": "Option B",
        "Option 3": "Option C",
        "Option 4": "Option D",
        "Correct answers": "Option A",
        Solution: "Explanation here",
        "Blank 1": "",
      },
    ];

    const validations = {
      Type: {
        type: "list",
        allowBlank: false,
        formulae: ['"MCQ,MSQ,FIB"'],
      },
      Level: {
        type: "list",
        allowBlank: false,
        formulae: ['"1,2,3"'],
      },
    };

    writeExcel(
      data,
      "Question_Import_Template.xlsx",
      "Template",
      headers,
      validations
    );
  };

  const handleFileChange = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    const fileName = uploadedFile.name.toLowerCase();
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".csv")) {
      enqueueSnackbar("Only .xlsx and .csv files are supported.", {
        variant: "warning",
      });
      return;
    }

    setFile(uploadedFile);

    const data = await uploadedFile.arrayBuffer();
    const jsonData = await readExcel(data, fileName);
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
    setError([]);
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
        if (onSuccess) {
          onSuccess();
        }
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

  const handleClose = () => {
    handleRemoveFile();
    close();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      disableScrollLock
      sx={{
        "& .MuiDialog-paper": {
          width: "100%",
          maxWidth: "860px",
          minHeight: "80vh",
          borderRadius: "14px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--border-color)",
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" gap="10px">
          <Stack
            sx={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "rgba(24, 113, 99, 0.08)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FileUploadOutlined sx={{ fontSize: "16px", color: "var(--primary-color)" }} />
          </Stack>
          <Stack>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "var(--text1)" }}>
              Import Questions
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "var(--text4)" }}>
              Upload .xlsx or .csv files to bulk import
            </Typography>
          </Stack>
        </Stack>
        <IconButton onClick={handleClose} size="small">
          <Close sx={{ fontSize: "18px" }} />
        </IconButton>
      </Stack>

      {/* Subject selector + Template */}
      <Stack
        direction="row"
        gap="10px"
        alignItems="center"
        sx={{
          p: "12px 20px",
          backgroundColor: "var(--bg-color)",
          borderBottom: "1px solid var(--border-color)",
          flexShrink: 0,
        }}
      >
        <Box flex={1}>
          <Autocomplete
            options={subjectTitle}
            getOptionLabel={(option) => option.title}
            isOptionEqualToValue={(option, value) =>
              option.subjectID === value.subjectID
            }
            renderOption={(props, option) => (
              <li {...props} key={option.subjectID}>
                {option.title}
              </li>
            )}
            value={
              subjectTitle.find((s) => s.subjectID === selectedSubject) || null
            }
            onChange={(event, newValue) => {
              setSelectedSubject(newValue ? newValue.subjectID : "");
            }}
            popupIcon={
              <ExpandMore sx={{ color: "var(--text3)", fontSize: "18px" }} />
            }
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select a subject..."
                variant="outlined"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <Category
                          sx={{
                            color: selectedSubject
                              ? "var(--primary-color)"
                              : "var(--text4)",
                            fontSize: "16px",
                          }}
                        />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "13px",
                    fontWeight: 600,
                    "& fieldset": { borderColor: "var(--border-color)" },
                    "&:hover fieldset": { borderColor: "var(--primary-color)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--primary-color)" },
                  },
                }}
              />
            )}
          />
        </Box>
        <Button
          variant="outlined"
          startIcon={<InsertDriveFile sx={{ fontSize: "14px" }} />}
          onClick={handleDownloadTemplate}
          size="small"
          sx={{
            height: "34px",
            textTransform: "none",
            borderColor: "var(--border-color)",
            color: "var(--text2)",
            backgroundColor: "white",
            borderRadius: "8px",
            whiteSpace: "nowrap",
            fontWeight: 600,
            fontSize: "12px",
            "&:hover": {
              backgroundColor: "#f5f5f5",
              borderColor: "var(--primary-color)",
            },
          }}
        >
          Template
        </Button>
      </Stack>

      {/* Upload Area / Content */}
      <Stack sx={{ flex: 1, overflow: "hidden" }}>
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv, .xlsx"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {!file ? (
          <Stack sx={{ flex: 1, p: "20px" }}>
            <Stack
              onClick={triggerFileInput}
              alignItems="center"
              justifyContent="center"
              gap="12px"
              sx={{
                width: "100%",
                flex: 1,
                minHeight: "240px",
                border: "1.5px dashed",
                borderColor: selectedSubject
                  ? "rgba(24, 113, 99, 0.3)"
                  : "var(--border-color)",
                borderRadius: "10px",
                backgroundColor: selectedSubject
                  ? "rgba(24, 113, 99, 0.02)"
                  : "var(--bg-color)",
                cursor: selectedSubject ? "pointer" : "not-allowed",
                opacity: selectedSubject ? 1 : 0.5,
                "&:hover": selectedSubject
                  ? {
                      borderColor: "var(--primary-color)",
                      backgroundColor: "rgba(24, 113, 99, 0.04)",
                    }
                  : {},
              }}
            >
              <Stack
                sx={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(24, 113, 99, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary-color)",
                }}
              >
                <CloudUpload sx={{ fontSize: "20px" }} />
              </Stack>
              <Stack alignItems="center" gap="2px">
                <Typography sx={{ fontWeight: 600, color: "var(--text2)", fontSize: "13px" }}>
                  {selectedSubject
                    ? "Click to upload"
                    : "Select a subject first"}
                </Typography>
                <Typography sx={{ color: "var(--text4)", fontSize: "11px" }}>
                  Supports .xlsx and .csv files
                </Typography>
              </Stack>
              {!selectedSubject && (
                <Stack
                  direction="row"
                  gap="6px"
                  alignItems="center"
                  sx={{
                    mt: "4px",
                    px: "12px",
                    py: "6px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(255, 152, 0, 0.06)",
                    border: "1px solid rgba(255, 152, 0, 0.15)",
                  }}
                >
                  <InfoOutlined sx={{ fontSize: "14px", color: "#F57C00" }} />
                  <Typography sx={{ fontSize: "11px", color: "#F57C00", fontWeight: 500 }}>
                    Choose a subject from the dropdown above to enable upload
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
        ) : (
          <Stack sx={{ flex: 1, overflow: "hidden", p: "16px 20px" }} gap="12px">
            {/* File info bar */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                p: "10px 14px",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                backgroundColor: "var(--white)",
                flexShrink: 0,
              }}
            >
              <Stack direction="row" alignItems="center" gap="10px">
                <Stack
                  sx={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(24, 113, 99, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: "8px", color: "var(--primary-color)" }}>
                    {file.name.endsWith(".csv") ? "CSV" : "XLSX"}
                  </Typography>
                </Stack>
                <Stack>
                  <Typography sx={{ fontWeight: 600, fontSize: "12px", color: "var(--text1)" }}>
                    {file.name}
                  </Typography>
                  <Typography sx={{ fontSize: "10px", color: "var(--text4)" }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </Typography>
                </Stack>
              </Stack>
              <Stack direction="row" alignItems="center" gap="6px">
                {questions.length > 0 && (
                  <Chip
                    icon={<CheckCircleOutline sx={{ fontSize: "12px !important" }} />}
                    label={`${questions.length} valid`}
                    size="small"
                    sx={{
                      height: "22px",
                      fontSize: "10px",
                      fontWeight: 600,
                      backgroundColor: "rgba(24, 113, 99, 0.06)",
                      color: "var(--primary-color)",
                      borderRadius: "4px",
                      "& .MuiChip-icon": { color: "inherit" },
                    }}
                  />
                )}
                {error.length > 0 && (
                  <Chip
                    icon={<ErrorOutline sx={{ fontSize: "12px !important" }} />}
                    label={`${error.length} errors`}
                    size="small"
                    sx={{
                      height: "22px",
                      fontSize: "10px",
                      fontWeight: 600,
                      backgroundColor: "rgba(220, 38, 38, 0.06)",
                      color: "#DC2626",
                      borderRadius: "4px",
                      "& .MuiChip-icon": { color: "inherit" },
                    }}
                  />
                )}
                <IconButton onClick={handleRemoveFile} size="small">
                  <Close sx={{ fontSize: "16px", color: "var(--text4)" }} />
                </IconButton>
              </Stack>
            </Stack>

            {/* Tab buttons */}
            <Stack direction="row" gap="8px" sx={{ flexShrink: 0 }}>
              <Button
                variant={!isOpenAccordion ? "contained" : "outlined"}
                onClick={() => setIsOpenAccordion(false)}
                disableElevation
                sx={{
                  flex: 1,
                  textTransform: "none",
                  borderRadius: "8px",
                  height: "34px",
                  backgroundColor: !isOpenAccordion
                    ? "rgba(24, 113, 99, 0.08)"
                    : "transparent",
                  color: !isOpenAccordion ? "var(--primary-color)" : "var(--text4)",
                  borderColor: !isOpenAccordion ? "transparent" : "var(--border-color)",
                  fontWeight: 700,
                  fontSize: "12px",
                  "&:hover": {
                    backgroundColor: !isOpenAccordion
                      ? "rgba(24, 113, 99, 0.12)"
                      : "rgba(0,0,0,0.02)",
                  },
                }}
              >
                Valid Questions
                <Chip
                  label={questions.length}
                  size="small"
                  sx={{
                    ml: "6px",
                    height: "18px",
                    fontSize: "9px",
                    fontWeight: 700,
                    backgroundColor: !isOpenAccordion ? "var(--primary-color)" : "var(--text4)",
                    color: "white",
                  }}
                />
              </Button>

              {error && error.length > 0 && (
                <Button
                  variant={isOpenAccordion ? "contained" : "outlined"}
                  onClick={() => setIsOpenAccordion(true)}
                  disableElevation
                  sx={{
                    flex: 1,
                    textTransform: "none",
                    borderRadius: "8px",
                    height: "34px",
                    backgroundColor: isOpenAccordion
                      ? "rgba(220, 38, 38, 0.06)"
                      : "transparent",
                    color: isOpenAccordion ? "#DC2626" : "var(--text4)",
                    borderColor: isOpenAccordion ? "transparent" : "var(--border-color)",
                    fontWeight: 700,
                    fontSize: "12px",
                    "&:hover": {
                      backgroundColor: isOpenAccordion
                        ? "rgba(220, 38, 38, 0.1)"
                        : "rgba(0,0,0,0.02)",
                    },
                  }}
                >
                  Errors Found
                  <Chip
                    label={error.length}
                    size="small"
                    sx={{
                      ml: "6px",
                      height: "18px",
                      fontSize: "9px",
                      fontWeight: 700,
                      backgroundColor: isOpenAccordion ? "#DC2626" : "var(--text4)",
                      color: "white",
                    }}
                  />
                </Button>
              )}
            </Stack>

            {/* Scrollable list */}
            <Stack
              sx={{
                flex: 1,
                overflowY: "auto",
                pr: "4px",
                gap: "10px",
              }}
            >
              {isOpenAccordion ? (
                <Stack gap="10px">
                  {error.map((e, idx) => (
                    <ErrorQuestionCard key={idx} error={e} />
                  ))}
                </Stack>
              ) : (
                <Stack gap="10px">
                  {preview.length > 0 ? (
                    preview.map((row, i) => (
                      <QuestionCard
                        key={i}
                        question={row.title}
                        difficulty={row.difficultyLevel}
                        questionType={row.type}
                        subjectID={row.subjectID}
                        questionNumber={`Q${i + 1}`}
                        preview={
                          <Chip
                            icon={<Visibility sx={{ fontSize: "12px" }} />}
                            label="Preview"
                            onClick={() => previewDialogOpen(row)}
                            size="small"
                            sx={{
                              fontSize: "10px",
                              fontWeight: 600,
                              height: "22px",
                              backgroundColor: "rgba(24, 113, 99, 0.08)",
                              color: "var(--primary-color)",
                              cursor: "pointer",
                              "& .MuiChip-icon": { color: "var(--primary-color)" },
                            }}
                          />
                        }
                      />
                    ))
                  ) : (
                    <Stack
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                      py={4}
                    >
                      <Typography sx={{ fontSize: "13px", color: "var(--text4)" }}>
                        No valid questions to display.
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              )}
            </Stack>
          </Stack>
        )}
      </Stack>

      {/* Footer */}
      <Stack
        direction="row"
        justifyContent="flex-end"
        gap="8px"
        sx={{
          p: "12px 20px",
          borderTop: "1px solid var(--border-color)",
          backgroundColor: "var(--bg-color)",
          flexShrink: 0,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={isLoading}
          sx={{
            color: "var(--text2)",
            textTransform: "none",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "12px",
            height: "34px",
            px: "20px",
            backgroundColor: "var(--white)",
            border: "1px solid var(--border-color)",
            "&:hover": { backgroundColor: "var(--border-color)" },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!selectedSubject || !questions.length || !file || isLoading}
          disableElevation
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "12px",
            height: "34px",
            px: "20px",
            "&:hover": { backgroundColor: "var(--primary-color-dark)" },
            "&.Mui-disabled": { background: "var(--border-color)", color: "var(--text4)" },
          }}
        >
          {isLoading ? (
            <CircularProgress size={16} sx={{ color: "white" }} />
          ) : (
            "Import Questions"
          )}
        </Button>
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
    </Dialog>
  );
}
