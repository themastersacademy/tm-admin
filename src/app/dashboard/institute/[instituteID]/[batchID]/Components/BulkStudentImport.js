"use client";
import LongDialogBox from "@/src/components/LongDialogBox/LongDialogBox";
import {
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import { readExcel, writeExcel } from "@/src/lib/excel";
import { useRef, useState } from "react";
import {
  Close,
  CloudUpload,
  InsertDriveFile,
  Download,
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
  const [isOpenAccordion, setIsOpenAccordion] = useState(false);

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

    // Basic validation
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
      setIsOpenAccordion(true);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setStudents([]);
    setError([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
          setIsOpenAccordion(true);
          enqueueSnackbar(`Import completed with ${failed.length} errors.`, {
            variant: "warning",
          });
          // Update valid students to exclude failed ones if needed, or just keep them as is.
          // For now, we just show the errors.
          if (onSuccess) {
            onSuccess();
          }
        } else {
          enqueueSnackbar("Students imported successfully.", {
            variant: "success",
          });
          handleRemoveFile();
          close();
          if (onSuccess) {
            onSuccess();
          }
        }
      } else {
        enqueueSnackbar("Import failed: " + result.message, {
          variant: "error",
        });
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
      title="Import Students"
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
            disabled={!students.length || !file || isLoading}
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
              borderRadius: "8px",
              boxShadow: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            {isLoading ? "Importing..." : "Import Students"}
          </Button>
        </Stack>
      }
      titleComponent={<Box />}
    >
      <Stack p="24px" gap="20px" height="100%">
        {/* Header: Template */}
        <Stack
          direction="row"
          gap="16px"
          alignItems="center"
          justifyContent="flex-end"
          sx={{
            p: "16px",
            backgroundColor: "var(--bg-color)",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
          }}
        >
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
            Download Template
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
              flex: 1,
              minHeight: "200px",
              border: "2px dashed",
              borderColor: "var(--border-color)",
              borderRadius: "12px",
              backgroundColor: "var(--bg-color)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "var(--primary-color)",
                backgroundColor: "rgba(102, 126, 234, 0.04)",
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
                  }}
                >
                  <Stack direction="row" alignItems="center" gap="8px">
                    <Typography fontWeight="700" fontSize="13px">
                      Valid Students
                    </Typography>
                    <Chip
                      label={students.length}
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
                {error.length > 0 && isOpenAccordion && (
                  <IconButton onClick={handleDownloadErrors} size="small">
                    <Download sx={{ color: "#DC2626" }} />
                  </IconButton>
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
                      <Stack
                        key={idx}
                        sx={{
                          p: "12px",
                          border: "1px solid #FECACA",
                          borderRadius: "8px",
                          backgroundColor: "#FEF2F2",
                        }}
                      >
                        <Typography
                          fontSize="13px"
                          fontWeight="600"
                          color="#DC2626"
                        >
                          {e.Email || "Unknown Email"}
                        </Typography>
                        <Typography fontSize="12px" color="#DC2626">
                          {e.error}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                ) : (
                  // Valid Student List
                  <Stack gap="12px">
                    {students.length > 0 ? (
                      students.map((row, i) => (
                        <Stack
                          key={i}
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{
                            p: "12px",
                            border: "1px solid var(--border-color)",
                            borderRadius: "8px",
                            backgroundColor: "var(--white)",
                          }}
                        >
                          <Stack>
                            <Typography fontSize="13px" fontWeight="600">
                              {row.Email}
                            </Typography>
                            {row.RollNo && (
                              <Typography fontSize="11px" color="var(--text3)">
                                Roll No: {row.RollNo}
                              </Typography>
                            )}
                          </Stack>
                        </Stack>
                      ))
                    ) : (
                      <Stack
                        alignItems="center"
                        justifyContent="center"
                        height="100%"
                        color="var(--text3)"
                      >
                        <Typography fontSize="14px">
                          No valid students to display.
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
    </LongDialogBox>
  );
}
