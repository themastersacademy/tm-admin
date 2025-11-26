import DialogBox from "@/src/components/DialogBox/DialogBox";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import BatchStudentCard from "@/src/components/BatchStudentCard/BatchStudentCard";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { apiFetch } from "@/src/lib/apiFetch";
import { Add, Close, East, Search, People } from "@mui/icons-material";
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
} from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { enqueueSnackbar } from "notistack";

export default function BatchStudents() {
  const params = useParams();
  const [studentsList, setStudentsList] = useState([]);
  const [studentDialog, setStudentDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

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
      }
      setIsLoading(false);
    });
  }, [params.instituteID, params.batchID]);

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
      {/* Analytics Cards */}
      <Stack direction="row" gap="20px" flexWrap="wrap">
        <StatCard
          title="Total Students"
          value={studentsList.length}
          icon={<People sx={{ color: "var(--primary-color)" }} />}
        />
      </Stack>

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
