import DialogBox from "@/src/components/DialogBox/DialogBox";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import BatchStudentCard from "@/src/components/BatchStudentCard/BatchStudentCard";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { apiFetch } from "@/src/lib/apiFetch";
import {
  Add,
  Close,
  East,
  Search,
  People,
  UploadFile,
  Edit,
  Person,
  LocalOffer,
  Badge,
  CheckCircleOutline,
} from "@mui/icons-material";
import BulkStudentImport from "./BulkStudentImport";
import {
  Button,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  Autocomplete,
  TextField,
  Avatar,
  CircularProgress,
  Card,
  InputAdornment,
  Dialog,
  Fade,
  Box,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { enqueueSnackbar } from "notistack";

export default function BatchStudents({ setStudentCount, batch }) {
  const params = useParams();
  const [studentsList, setStudentsList] = useState([]);
  const [studentDialog, setStudentDialog] = useState(false);
  const [bulkImportDialog, setBulkImportDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const [editDialog, setEditDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const studentDialogOpen = () => {
    setStudentDialog(true);
  };
  const studentDialogClose = () => {
    setStudentDialog(false);
  };

  const fetchStudents = useCallback(() => {
    setIsLoading(true);
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/${params.instituteID}/${params.batchID}/get-all-students`
    ).then((data) => {
      if (data.success) {
        setStudentsList(data.data);
        if (setStudentCount) {
          setStudentCount(data.data.length);
        }
      }
      setIsLoading(false);
    });
  }, [params.instituteID, params.batchID, setStudentCount]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const confirmDelete = (userID) => {
    setStudentToDelete(userID);
    setDeleteDialog(true);
  };

  const handleDelete = () => {
    if (!studentToDelete) return;

    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/${params.instituteID}/${params.batchID}/remove-student`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userID: studentToDelete }),
      }
    ).then((data) => {
      if (data.success) {
        fetchStudents();
        setDeleteDialog(false);
        setStudentToDelete(null);
        enqueueSnackbar("Student removed from batch", { variant: "success" });
      } else {
        enqueueSnackbar(data.message, { variant: "error" });
      }
    });
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setEditDialog(true);
  };

  const saveStudentUpdate = async (updatedData) => {
    // updatedData: { tag, rollNo }
    try {
      const resp = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/${params.instituteID}/${params.batchID}/update-student`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userID: editingStudent.userID,
            tag: updatedData.tag,
            rollNo: updatedData.rollNo,
          }),
        }
      );
      if (resp.success) {
        enqueueSnackbar("Student updated successfully", { variant: "success" });
        setEditDialog(false);
        setEditingStudent(null);
        fetchStudents(); // Refresh list
      } else {
        enqueueSnackbar(resp.message, { variant: "error" });
      }
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to update student", { variant: "error" });
    }
  };

  const filteredStudents = studentsList.filter(
    (student) =>
      (student.studentMeta?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (student.studentMeta?.email || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <Stack gap="20px" marginTop="20px">
      <Stack
        sx={{
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          padding: "20px",
          backgroundColor: "var(--white)",
          minHeight: "80vh",
          gap: "20px",
        }}
      >
        <Stack
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap="15px"
        >
          <Typography sx={{ fontSize: "20px", fontWeight: "700" }}>
            Students
          </Typography>
          <Stack direction="row" gap="15px">
            <StyledTextField
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "var(--text3)" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: "250px", backgroundColor: "var(--white)" }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={studentDialogOpen}
              sx={{
                backgroundColor: "var(--primary-color)",
                textTransform: "none",
                fontFamily: "Lato",
                height: "40px",
              }}
              disableElevation
            >
              Add Student
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadFile />}
              onClick={() => setBulkImportDialog(true)}
              sx={{
                borderColor: "var(--primary-color)",
                color: "var(--primary-color)",
                textTransform: "none",
                fontFamily: "Lato",
                height: "40px",
              }}
            >
              Bulk Upload
            </Button>
          </Stack>
        </Stack>
        <Stack
          flexDirection="row"
          flexWrap="wrap"
          rowGap="15px"
          columnGap="30px"
        >
          {!isLoading ? (
            filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <BatchStudentCard
                  key={index}
                  student={student}
                  onRemove={confirmDelete}
                  onEdit={handleEditClick}
                />
              ))
            ) : (
              <Stack width="100%" minHeight="60vh">
                <NoDataFound
                  info={
                    searchQuery
                      ? "No students found matching your search"
                      : "No students added"
                  }
                />
              </Stack>
            )
          ) : (
            <SecondaryCardSkeleton />
          )}
        </Stack>
        <StudentsDialog
          studentDialog={studentDialog}
          studentDialogClose={studentDialogClose}
          instituteID={params.instituteID}
          batchID={params.batchID}
          fetchStudents={fetchStudents}
        />
        <BulkStudentImport
          isOpen={bulkImportDialog}
          close={() => setBulkImportDialog(false)}
          onSuccess={fetchStudents}
          batch={batch}
        />
        <EditStudentDialog
          open={editDialog}
          onClose={() => {
            setEditDialog(false);
            setEditingStudent(null);
          }}
          student={editingStudent}
          batchTags={batch?.tags || []} // Pass batch tags
          onSave={saveStudentUpdate}
        />
        <DialogBox
          isOpen={deleteDialog}
          title="Remove Student"
          icon={
            <IconButton
              onClick={() => setDeleteDialog(false)}
              sx={{ padding: "4px", borderRadius: "8px" }}
            >
              <Close />
            </IconButton>
          }
          actionButton={
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              sx={{ textTransform: "none" }}
              disableElevation
            >
              Remove
            </Button>
          }
        >
          <DialogContent sx={{ paddingBottom: "20px" }}>
            <Typography>
              Are you sure you want to remove this student from the batch?
            </Typography>
          </DialogContent>
        </DialogBox>
      </Stack>
    </Stack>
  );
}

// ... StatCard ...

const EditStudentDialog = ({ open, onClose, student, batchTags, onSave }) => {
  const [tag, setTag] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setTag(student.tag || "");
      setRollNo(student.rollNo || "");
    }
  }, [student]);

  const handleSave = async () => {
    setLoading(true);
    await onSave({ tag, rollNo });
    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 24px 48px rgba(0,0,0,0.1)",
        },
      }}
      TransitionComponent={Fade}
      transitionDuration={400}
    >
      {/* Header Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #E3F2FD 0%, #FFFFFF 100%)",
          padding: "32px 32px 24px",
          borderBottom: "1px solid rgba(33, 150, 243, 0.1)",
          position: "relative",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: "24px",
            top: "24px",
            color: "var(--text3)",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
          }}
        >
          <Close />
        </IconButton>

        <Stack direction="row" gap="20px" alignItems="center">
          <Stack
            sx={{
              width: "64px",
              height: "64px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 8px 16px rgba(33, 150, 243, 0.2)",
            }}
          >
            <Person sx={{ fontSize: "32px", color: "#fff" }} />
          </Stack>
          <Stack>
            <Typography
              sx={{
                fontSize: "24px",
                fontWeight: 800,
                color: "var(--text1)",
                fontFamily: "Lato",
                mb: "4px",
              }}
            >
              Edit Student
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "var(--text3)" }}>
              Update student details for this batch
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <DialogContent sx={{ padding: "32px" }}>
        <Stack gap="24px">
          {/* Input Fields */}
          <Stack gap="20px">
            {/* Student Name (Read Only) */}
            <TextField
              fullWidth
              value={student?.studentMeta?.name || ""}
              disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: "var(--text3)" }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "12px",
                  backgroundColor: "var(--bg-color)",
                  "& fieldset": { border: "1px solid transparent" },
                },
              }}
            />

            <Stack gap="8px">
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text2)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  ml: "4px",
                }}
              >
                Department (Tag)
              </Typography>
              {batchTags && batchTags.length > 0 ? (
                <TextField
                  select
                  fullWidth
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  SelectProps={{ native: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalOffer sx={{ color: "var(--text3)" }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: "12px",
                      backgroundColor: "var(--bg-color)",
                      "& fieldset": { border: "1px solid transparent" },
                      "&:hover fieldset": {
                        border: "1px solid var(--primary-color) !important",
                      },
                      "&.Mui-focused fieldset": {
                        border: "1px solid var(--primary-color) !important",
                      },
                      transition: "all 0.2s ease",
                    },
                  }}
                >
                  <option value="">Select Department</option>
                  {batchTags.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </TextField>
              ) : (
                <Typography variant="body2" color="var(--text3)" sx={{ ml: 1 }}>
                  No tags available for this batch.
                </Typography>
              )}
            </Stack>

            <Stack gap="8px">
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text2)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  ml: "4px",
                }}
              >
                Roll Number
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter Roll No"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Badge sx={{ color: "var(--text3)" }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: "12px",
                    backgroundColor: "var(--bg-color)",
                    "& fieldset": { border: "1px solid transparent" },
                    "&:hover fieldset": {
                      border: "1px solid var(--primary-color) !important",
                    },
                    "&.Mui-focused fieldset": {
                      border: "1px solid var(--primary-color) !important",
                    },
                    transition: "all 0.2s ease",
                  },
                }}
              />
            </Stack>
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" gap="12px" pt="12px">
            <Button
              fullWidth
              onClick={onClose}
              sx={{
                height: "52px",
                borderRadius: "12px",
                color: "var(--text2)",
                fontWeight: 600,
                fontSize: "15px",
                textTransform: "none",
                backgroundColor: "var(--bg-color)",
                "&:hover": { backgroundColor: "var(--border-color)" },
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSave}
              disabled={loading}
              sx={{
                height: "52px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
                fontWeight: 700,
                fontSize: "15px",
                textTransform: "none",
                boxShadow: "0 8px 20px rgba(33, 150, 243, 0.25)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)",
                  boxShadow: "0 12px 24px rgba(33, 150, 243, 0.35)",
                },
                "&.Mui-disabled": {
                  background: "#e0e0e0",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "var(--text2)" }} />
              ) : (
                <Stack direction="row" alignItems="center" gap="8px">
                  <span>Save Changes</span>
                  <CheckCircleOutline sx={{ fontSize: "20px" }} />
                </Stack>
              )}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

function StatCard({ title, value, icon }) {
  return (
    <Card
      elevation={0}
      sx={{
        padding: "15px",
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        minWidth: "200px",
        display: "flex",
        alignItems: "center",
        gap: "15px",
      }}
    >
      <Stack
        sx={{
          width: "45px",
          height: "45px",
          borderRadius: "50%",
          backgroundColor: "var(--primary-color-acc-2)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {icon}
      </Stack>
      <Stack>
        <Typography fontSize="14px" color="var(--text3)">
          {title}
        </Typography>
        <Typography fontSize="20px" fontWeight="700" color="var(--text1)">
          {value}
        </Typography>
      </Stack>
    </Card>
  );
}

const StudentsDialog = ({
  studentDialog,
  studentDialogClose,
  instituteID,
  batchID,
  fetchStudents,
}) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Debounced search function
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (inputValue.length > 1) {
        setLoading(true);
        apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/get-all-users?search=${inputValue}&limit=10`
        )
          .then((data) => {
            if (data.success) {
              setOptions(data.data);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setOptions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [inputValue]);

  const addStudents = () => {
    if (!selectedStudent) return;

    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/institute/${instituteID}/${batchID}/add-student`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userID: selectedStudent.id }),
      }
    ).then((data) => {
      if (data.success) {
        fetchStudents();
        studentDialogClose();
        setSelectedStudent(null);
        setInputValue("");
        enqueueSnackbar("Student added to batch", {
          variant: "success",
        });
      } else {
        enqueueSnackbar(data.message, {
          variant: "error",
        });
      }
    });
  };

  return (
    <DialogBox
      title="Add Students"
      isOpen={studentDialog}
      icon={
        <IconButton
          onClick={studentDialogClose}
          sx={{ padding: "4px", borderRadius: "8px" }}
        >
          <Close />
        </IconButton>
      }
      actionButton={
        <Button
          variant="text"
          endIcon={<East />}
          onClick={addStudents}
          disabled={!selectedStudent}
          sx={{ textTransform: "none", color: "var(--primary-color)" }}
        >
          Add
        </Button>
      }
    >
      <DialogContent sx={{ minHeight: "unset", paddingBottom: "20px" }}>
        <Stack gap="10px">
          <Typography variant="body2" color="text.secondary">
            Search by name or email to add a student
          </Typography>
          <Autocomplete
            getOptionLabel={(option) => option.name || ""}
            filterOptions={(x) => x} // Disable built-in filtering to rely on backend
            options={options}
            autoComplete
            includeInputInList
            filterSelectedOptions
            value={selectedStudent}
            noOptionsText={
              inputValue.length < 2
                ? "Type at least 2 characters to search"
                : "No students found"
            }
            onChange={(event, newValue) => {
              setOptions(newValue ? [newValue, ...options] : options);
              setSelectedStudent(newValue);
            }}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Student"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "var(--border-color)",
                    },
                    "&:hover fieldset": {
                      borderColor: "var(--primary-color)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--primary-color)",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "var(--text3)",
                    "&.Mui-focused": {
                      color: "var(--primary-color)",
                    },
                  },
                }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? (
                        <CircularProgress
                          size={20}
                          sx={{ color: "var(--primary-color)" }}
                        />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => {
              const { key, ...optionProps } = props;
              return (
                <li key={key} {...optionProps}>
                  <Stack flexDirection="row" gap="10px" alignItems="center">
                    <Avatar
                      src={option.image}
                      alt={option.name}
                      sx={{ width: 32, height: 32 }}
                    />
                    <Stack>
                      <Typography variant="body1" fontWeight={500}>
                        {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.email}
                      </Typography>
                    </Stack>
                  </Stack>
                </li>
              );
            }}
          />
        </Stack>
      </DialogContent>
    </DialogBox>
  );
};
