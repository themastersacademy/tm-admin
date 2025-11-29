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
  Autocomplete,
  TextField,
  InputAdornment,
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
  Category,
} from "@mui/icons-material";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import PreviewStepper from "./PreviewStepper";
import ErrorQuestionCard from "./ErrorQuestionCard";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
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
      "title",
      "type",
      "difficultyLevel",
      "options",
      "answerKey",
      "solution",
    ];
    const data = [
      {
        title: "Sample Question?",
        type: "MCQ",
        difficultyLevel: 1,
        options: "Option A, Option B, Option C, Option D",
        answerKey: "Option A",
        solution: "Explanation here",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Question_Import_Template.xlsx");
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
        // Call onSuccess callback to refresh data in parent component
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

  return (
    <LongDialogBox
      isOpen={isOpen}
      title="Import Questions"
      onClose={close}
      actions={
        <Stack direction="row" gap="12px">
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
              fontWeight: 600,
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
              fontWeight: 600,
              px: 3,
            }}
          >
            {isLoading ? "Importing..." : "Import Questions"}
          </Button>
        </Stack>
      }
      titleComponent={<Box />}
    >
      <Stack p="24px" gap="20px" height="100%">
        {/* Compact Header: Subject & Template */}
        <Stack
          direction="row"
          gap="16px"
          alignItems="center"
          sx={{
            p: "16px",
            backgroundColor: "var(--bg-color)",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
          }}
        >
          <Box flex={1}>
            <Autocomplete
              options={subjectTitle}
              getOptionLabel={(option) => option.title}
              value={
                subjectTitle.find((s) => s.subjectID === selectedSubject) ||
                null
              }
              onChange={(event, newValue) => {
                setSelectedSubject(newValue ? newValue.subjectID : "");
              }}
              popupIcon={
                <ExpandMore sx={{ color: "var(--text3)", fontSize: "20px" }} />
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select a subject..."
                  variant="standard"
                  InputProps={{
                    ...params.InputProps,
                    disableUnderline: true,
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: 2, ml: 0.5 }}>
                        <Box
                          sx={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            backgroundColor: selectedSubject
                              ? "rgba(102, 126, 234, 0.12)"
                              : "rgba(0, 0, 0, 0.04)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            border: selectedSubject
                              ? "1px solid rgba(102, 126, 234, 0.2)"
                              : "1px solid transparent",
                          }}
                        >
                          <Category
                            sx={{
                              color: selectedSubject
                                ? "var(--primary-color)"
                                : "var(--text3)",
                              fontSize: "19px",
                              transition: "color 0.3s ease",
                            }}
                          />
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      padding: "10px 0",
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "var(--text1)",
                      minHeight: "56px",
                      display: "flex",
                      alignItems: "center",
                    },
                    "& .MuiInputBase-input": {
                      padding: "0 !important",
                      height: "auto",
                      lineHeight: "1.5",
                    },
                    "& input::placeholder": {
                      color: "var(--text3)",
                      fontWeight: "500",
                      opacity: 0.7,
                    },
                  }}
                />
              )}
              sx={{
                width: "100%",
                "& .MuiAutocomplete-endAdornment": {
                  top: "50%",
                  transform: "translateY(-50%)",
                  right: "12px !important",
                },
              }}
            />
          </Box>
          <Button
            variant="outlined"
            startIcon={<InsertDriveFile />}
            onClick={handleDownloadTemplate}
            size="small"
            sx={{
              height: "40px",
              textTransform: "none",
              borderColor: "var(--border-color)",
              color: "var(--text2)",
              backgroundColor: "white",
              whiteSpace: "nowrap",
              "&:hover": {
                backgroundColor: "#f5f5f5",
                borderColor: "var(--text2)",
              },
            }}
          >
            Template
          </Button>
        </Stack>

        {/* Smart Upload Area */}
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
              flex: 1, // Take remaining height when empty
              minHeight: "200px",
              border: "2px dashed",
              borderColor: selectedSubject
                ? "var(--border-color)"
                : "var(--border-color)",
              borderRadius: "12px",
              backgroundColor: selectedSubject
                ? "var(--white)"
                : "var(--bg-color)",
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
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "rgba(102, 126, 234, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CloudUpload
                sx={{ fontSize: "24px", color: "var(--primary-color)" }}
              />
            </Box>
            <Stack alignItems="center">
              <Typography
                variant="h6"
                fontWeight="600"
                color="var(--text1)"
                fontSize="14px"
              >
                Click to upload or drag and drop
              </Typography>
              <Typography variant="body2" color="var(--text3)" fontSize="12px">
                Supports .csv, .xlsx, .xls
              </Typography>
            </Stack>
          </Stack>
        ) : (
          <Stack gap="16px" height="100%" overflow="hidden">
            {/* Slim File Bar */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                p: "12px 16px",
                border: "1px solid var(--border-color)",
                borderRadius: "10px",
                backgroundColor: "var(--white)",
              }}
            >
              <Stack direction="row" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    backgroundColor: "#E8F0FE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    fontWeight="700"
                    fontSize="9px"
                    color="var(--primary-color)"
                  >
                    XLSX
                  </Typography>
                </Box>
                <Stack>
                  <Typography fontWeight="600" fontSize="13px">
                    {file.name}
                  </Typography>
                  <Typography fontSize="11px" color="var(--text3)">
                    {(file.size / 1024).toFixed(2)} KB
                  </Typography>
                </Stack>
              </Stack>
              <IconButton onClick={handleRemoveFile} size="small">
                <Close sx={{ fontSize: "18px", color: "var(--text3)" }} />
              </IconButton>
            </Stack>

            {/* Tabbed Content Area */}
            <Stack flex={1} overflow="hidden" gap="12px">
              {/* Status Bar / Tabs */}
              <Stack direction="row" gap="12px">
                <Button
                  variant={!isOpenAccordion ? "contained" : "outlined"}
                  onClick={() => setIsOpenAccordion(false)}
                  sx={{
                    flex: 1,
                    textTransform: "none",
                    borderRadius: "8px",
                    boxShadow: "none",
                    backgroundColor: !isOpenAccordion
                      ? "rgba(102, 126, 234, 0.1)"
                      : "transparent",
                    color: !isOpenAccordion
                      ? "var(--primary-color)"
                      : "var(--text3)",
                    borderColor: !isOpenAccordion
                      ? "transparent"
                      : "var(--border-color)",
                    "&:hover": {
                      backgroundColor: !isOpenAccordion
                        ? "rgba(102, 126, 234, 0.2)"
                        : "rgba(0,0,0,0.02)",
                      boxShadow: "none",
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" gap="8px">
                    <Typography fontWeight="700" fontSize="13px">
                      Valid Questions
                    </Typography>
                    <Chip
                      label={questions.length}
                      size="small"
                      sx={{
                        height: "20px",
                        fontSize: "10px",
                        fontWeight: "700",
                        backgroundColor: !isOpenAccordion
                          ? "var(--primary-color)"
                          : "var(--text3)",
                        color: "white",
                      }}
                    />
                  </Stack>
                </Button>

                {error && error.length > 0 && (
                  <Button
                    variant={isOpenAccordion ? "contained" : "outlined"}
                    onClick={() => setIsOpenAccordion(true)}
                    sx={{
                      flex: 1,
                      textTransform: "none",
                      borderRadius: "8px",
                      boxShadow: "none",
                      backgroundColor: isOpenAccordion
                        ? "#FEE2E2"
                        : "transparent",
                      color: isOpenAccordion ? "#DC2626" : "var(--text3)",
                      borderColor: isOpenAccordion
                        ? "transparent"
                        : "var(--border-color)",
                      "&:hover": {
                        backgroundColor: isOpenAccordion
                          ? "#FECACA"
                          : "rgba(0,0,0,0.02)",
                        boxShadow: "none",
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" gap="8px">
                      <Typography fontWeight="700" fontSize="13px">
                        Errors Found
                      </Typography>
                      <Chip
                        label={error.length}
                        size="small"
                        sx={{
                          height: "20px",
                          fontSize: "10px",
                          fontWeight: "700",
                          backgroundColor: isOpenAccordion
                            ? "#DC2626"
                            : "var(--text3)",
                          color: "white",
                        }}
                      />
                    </Stack>
                  </Button>
                )}
              </Stack>

              {/* Scrollable List */}
              <Stack
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  pr: "4px",
                  gap: "12px",
                }}
              >
                {isOpenAccordion ? (
                  // Error List
                  <Stack gap="12px">
                    {error.map((e, idx) => (
                      <ErrorQuestionCard key={idx} error={e} />
                    ))}
                  </Stack>
                ) : (
                  // Valid Question List
                  <Stack gap="12px">
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
                      ))
                    ) : (
                      <Stack
                        alignItems="center"
                        justifyContent="center"
                        height="100%"
                        color="var(--text3)"
                      >
                        <Typography fontSize="14px">
                          No valid questions to display.
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                )}
              </Stack>
            </Stack>
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
