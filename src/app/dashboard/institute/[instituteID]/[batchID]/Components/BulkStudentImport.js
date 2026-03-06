"use client";
import {
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  CircularProgress,
} from "@mui/material";
import { readExcel, writeExcel } from "@/src/lib/excel";
import { useRef, useState } from "react";
import {
  Close,
  CloudUpload,
  InsertDriveFile,
  Download,
  CheckCircle,
  ErrorOutline,
} from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import { useParams } from "next/navigation";

export default function BulkStudentImport({ isOpen, close, onSuccess, batch }) {
  const params = useParams();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState([]);
  const [showErrors, setShowErrors] = useState(false);

  const hasTags = batch?.tags && batch.tags.length > 0;

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleDownloadTemplate = () => {
    const headers = ["Email", "RollNo"];
    if (hasTags) {
      headers.push("Department");
    }

    const data = [
      {
        Email: "student@example.com",
        RollNo: "12345",
        ...(hasTags && { Department: batch.tags[0] }),
      },
    ];

    const validations = hasTags
      ? {
          Department: {
            type: "list",
            allowBlank: true,
            formulae: [`"${batch.tags.join(",")}"`],
          },
        }
      : null;

    writeExcel(
      data,
      "Student_Import_Template.xlsx",
      "Template",
      headers,
      validations
    );
  };

  const handleDownloadErrors = () => {
    if (!error.length) return;
    writeExcel(error, "Import_Errors.xlsx", "Errors");
  };

  const handleFileChange = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    const data = await uploadedFile.arrayBuffer();
    const jsonData = await readExcel(data);

    const validStudents = [];
    const errors = [];

    jsonData.forEach((row, index) => {
      let rowError = null;

      if (!row.Email) {
        rowError = "Email is required";
      } else if (hasTags) {
        if (!row.Department) {
          rowError = "Department is required";
        } else if (!batch.tags.includes(row.Department)) {
          rowError = `Invalid Department. Allowed: ${batch.tags.join(", ")}`;
        }
      }

      if (rowError) {
        errors.push({ ...row, row: index + 2, error: rowError });
      } else {
        validStudents.push(row);
      }
    });

    setError(errors);
    setStudents(validStudents);
    if (errors.length > 0) {
      setShowErrors(true);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setStudents([]);
    setError([]);
    setShowErrors(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    handleRemoveFile();
    close();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!students.length) {
      enqueueSnackbar("Please upload a file to import students.", {
        variant: "error",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/institute/${params.instituteID}/${params.batchID}/bulk-add-students`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(students),
        }
      );
      const result = await response.json();
      if (result.success) {
        const failed = result.data.errors;
        if (failed.length > 0) {
          setError(failed);
          setShowErrors(true);
          enqueueSnackbar(`Import completed with ${failed.length} errors.`, {
            variant: "warning",
          });
          if (onSuccess) onSuccess();
        } else {
          enqueueSnackbar("Students imported successfully.", {
            variant: "success",
          });
          handleClose();
          if (onSuccess) onSuccess();
        }
      } else {
        enqueueSnackbar("Import failed: " + result.message, {
          variant: "error",
        });
      }
    } catch (err) {
      enqueueSnackbar("Upload failed.", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const displayList = showErrors ? error : students;
  const hasResults = file && (students.length > 0 || error.length > 0);

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      disableScrollLock
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          maxHeight: "80vh",
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)" }}
      >
        <Stack direction="row" alignItems="center" gap="10px">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              backgroundColor: "var(--primary-color-acc-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CloudUpload sx={{ fontSize: "16px", color: "var(--primary-color)" }} />
          </Box>
          <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "var(--text1)" }}>
            Import Students
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap="8px">
          <Button
            size="small"
            startIcon={<InsertDriveFile sx={{ fontSize: "14px" }} />}
            onClick={handleDownloadTemplate}
            sx={{
              textTransform: "none",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text2)",
              borderRadius: "6px",
              padding: "4px 10px",
              border: "1px solid var(--border-color)",
              "&:hover": { backgroundColor: "var(--bg-color)" },
            }}
          >
            Template
          </Button>
          <IconButton onClick={handleClose} size="small">
            <Close sx={{ fontSize: "18px", color: "var(--text3)" }} />
          </IconButton>
        </Stack>
      </Stack>

      <DialogContent sx={{ padding: "16px 20px" }}>
        <Stack gap="14px">
          {/* File Upload Area */}
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
              gap="10px"
              sx={{
                minHeight: "140px",
                border: "2px dashed var(--border-color)",
                borderRadius: "10px",
                backgroundColor: "var(--bg-color, #fafafa)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "var(--primary-color)",
                  backgroundColor: "rgba(24, 113, 99, 0.04)",
                },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  backgroundColor: "var(--primary-color-acc-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CloudUpload sx={{ fontSize: "20px", color: "var(--primary-color)" }} />
              </Box>
              <Stack alignItems="center">
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "var(--text1)" }}>
                  Click to upload or drag and drop
                </Typography>
                <Typography sx={{ fontSize: "11px", color: "var(--text4)" }}>
                  Supports .csv, .xlsx, .xls
                </Typography>
              </Stack>
            </Stack>
          ) : (
            <Stack gap="12px">
              {/* File Info Bar */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  padding: "8px 12px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-color, #fafafa)",
                }}
              >
                <Stack direction="row" alignItems="center" gap="10px">
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "6px",
                      backgroundColor: "var(--primary-color-acc-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography sx={{ fontSize: "8px", fontWeight: 700, color: "var(--primary-color)" }}>
                      XLSX
                    </Typography>
                  </Box>
                  <Stack>
                    <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "var(--text1)" }}>
                      {file.name}
                    </Typography>
                    <Typography sx={{ fontSize: "10px", color: "var(--text4)" }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Stack>
                </Stack>
                <IconButton onClick={handleRemoveFile} size="small" sx={{ width: 24, height: 24 }}>
                  <Close sx={{ fontSize: "14px", color: "var(--text3)" }} />
                </IconButton>
              </Stack>

              {/* Status Tabs */}
              {hasResults && (
                <Stack gap="10px">
                  <Stack direction="row" gap="6px" alignItems="center">
                    <Chip
                      icon={<CheckCircle sx={{ fontSize: "13px !important" }} />}
                      label={`${students.length} Valid`}
                      size="small"
                      onClick={() => setShowErrors(false)}
                      sx={{
                        height: "24px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        backgroundColor: !showErrors ? "rgba(76, 175, 80, 0.1)" : "transparent",
                        color: !showErrors ? "#4caf50" : "var(--text3)",
                        border: `1px solid ${!showErrors ? "#4caf5040" : "var(--border-color)"}`,
                        "& .MuiChip-icon": { color: !showErrors ? "#4caf50" : "var(--text4)" },
                      }}
                    />
                    {error.length > 0 && (
                      <>
                        <Chip
                          icon={<ErrorOutline sx={{ fontSize: "13px !important" }} />}
                          label={`${error.length} Errors`}
                          size="small"
                          onClick={() => setShowErrors(true)}
                          sx={{
                            height: "24px",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                            backgroundColor: showErrors ? "rgba(244, 67, 54, 0.08)" : "transparent",
                            color: showErrors ? "#f44336" : "var(--text3)",
                            border: `1px solid ${showErrors ? "#f4433640" : "var(--border-color)"}`,
                            "& .MuiChip-icon": { color: showErrors ? "#f44336" : "var(--text4)" },
                          }}
                        />
                        {showErrors && (
                          <IconButton onClick={handleDownloadErrors} size="small" sx={{ width: 24, height: 24 }}>
                            <Download sx={{ fontSize: "14px", color: "#f44336" }} />
                          </IconButton>
                        )}
                      </>
                    )}
                  </Stack>

                  {/* List */}
                  <Stack
                    sx={{
                      maxHeight: "240px",
                      overflowY: "auto",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                    }}
                  >
                    {displayList.length > 0 ? (
                      displayList.map((row, i) => (
                        <Stack
                          key={i}
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{
                            padding: "6px 12px",
                            backgroundColor: i % 2 === 0 ? "var(--white)" : "var(--bg-color, #fafafa)",
                            borderBottom: i < displayList.length - 1 ? "1px solid var(--border-color)" : "none",
                          }}
                        >
                          <Stack direction="row" alignItems="center" gap="8px">
                            <Typography sx={{ fontSize: "10px", fontWeight: 600, color: "var(--text4)", minWidth: "20px" }}>
                              {i + 1}
                            </Typography>
                            <Stack>
                              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: showErrors ? "#f44336" : "var(--text1)" }}>
                                {row.Email || "Unknown Email"}
                              </Typography>
                              {showErrors ? (
                                <Typography sx={{ fontSize: "10px", color: "#f44336" }}>
                                  {row.error}
                                </Typography>
                              ) : (
                                row.RollNo && (
                                  <Typography sx={{ fontSize: "10px", color: "var(--text4)" }}>
                                    Roll No: {row.RollNo}
                                  </Typography>
                                )
                              )}
                            </Stack>
                          </Stack>
                          {row.Department && !showErrors && (
                            <Chip
                              label={row.Department}
                              size="small"
                              sx={{
                                height: "18px",
                                fontSize: "9px",
                                fontWeight: 600,
                                backgroundColor: "var(--primary-color-acc-2)",
                                color: "var(--primary-color)",
                              }}
                            />
                          )}
                        </Stack>
                      ))
                    ) : (
                      <Stack alignItems="center" justifyContent="center" py="20px">
                        <Typography sx={{ fontSize: "12px", color: "var(--text4)" }}>
                          No {showErrors ? "errors" : "valid students"} to display
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ padding: "12px 20px", borderTop: "1px solid var(--border-color)" }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          sx={{
            textTransform: "none",
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--text2)",
            borderRadius: "8px",
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!students.length || !file || isLoading}
          disableElevation
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
            padding: "6px 20px",
            "&:hover": { backgroundColor: "var(--primary-color-dark)" },
          }}
        >
          {isLoading ? (
            <CircularProgress size={16} sx={{ color: "#fff" }} />
          ) : (
            `Import ${students.length > 0 ? students.length : ""} Students`
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
