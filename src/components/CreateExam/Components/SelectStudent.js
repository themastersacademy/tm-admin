"use client";
import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  CircularProgress,
  TextField,
  Autocomplete,
  Avatar,
  Typography,
  Box,
} from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { CheckCircle, Cancel } from "@mui/icons-material";

export default function SelectStudent({
  exam,
  setExam,
  updateStudentList,
  isLive,
}) {
  const { showSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Fetch initial selected students details if we have IDs but no details
  useEffect(() => {
    const fetchSelectedStudents = async () => {
      if (
        exam.studentList &&
        exam.studentList.length > 0 &&
        selectedStudents.length === 0
      ) {
        setLoading(true);
        try {
          const data = await apiFetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/get-by-ids`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ids: exam.studentList }),
            }
          );
          if (data.success) {
            setSelectedStudents(data.data);
          }
        } catch (error) {
          console.error("Error fetching selected students:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSelectedStudents();
  }, [exam.studentList]);

  const fetchStudents = useCallback(async (query) => {
    if (!query) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/get-all-users?search=${query}&limit=20`
      );
      if (data.success) {
        setOptions(data.data);
      }
    } catch (error) {
      console.error("Error searching students:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (inputValue) {
        fetchStudents(inputValue);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [inputValue, fetchStudents]);

  const handleChange = (event, newValue) => {
    // newValue is an array of selected objects
    const studentIds = newValue.map((student) => student.id);

    // Update local state
    setSelectedStudents(newValue);

    // Update parent state
    setExam((prev) => ({
      ...prev,
      studentList: studentIds,
    }));

    // Trigger update callback
    if (updateStudentList) {
      updateStudentList(studentIds);
    }
  };

  // We need to sync selectedStudents with exam.studentList
  // This is tricky if we don't have the full student objects for the IDs in exam.studentList
  // For now, let's assume the parent passes the full student objects if possible,
  // OR we only support adding new ones and we display the count of existing ones.

  // Actually, let's look at how `SelectBatch` works. It fetches ALL batches.
  // We can't fetch ALL students.

  // Alternative: Just use a search box to ADD students. And list existing students below with a delete button.
  // This avoids the Autocomplete "controlled" issue with missing objects.

  return (
    <Stack gap="10px">
      <Autocomplete
        multiple
        id="student-select"
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        getOptionLabel={(option) => option.name || option.email || ""}
        options={options}
        loading={loading}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onChange={handleChange}
        value={selectedStudents}
        // We are controlling value with selectedStudents.
        // But if exam.studentList has IDs not in selectedStudents, they won't show.
        // This is a limitation. We might need a different UI.

        disabled={isLive}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search and Select Students"
            placeholder="Type name or email..."
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props}>
            <Stack direction="row" gap="10px" alignItems="center">
              <Avatar
                src={option.image}
                alt={option.name}
                sx={{ width: 24, height: 24 }}
              />
              <Stack>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {option.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.email}
                </Typography>
              </Stack>
            </Stack>
          </li>
        )}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              key={option.id}
              label={option.name}
              {...getTagProps({ index })}
              avatar={<Avatar src={option.image} />}
            />
          ))
        }
      />

      {/* Fallback display for IDs that we don't have objects for? 
          Or maybe we just fetch the students for the exam in the parent component 
          and pass them here? 
          
          In ExamSettings.js, `exam` object comes from `testList`.
          Does `testList` contain `studentList` as IDs or objects?
          In `examController.js`, `getExamById` usually returns the item.
          If `studentList` is a Set/List of strings, we only have IDs.
          
          To make this work properly, we should probably fetch the student details 
          for the IDs present in `exam.studentList` when the component mounts.
      */}
    </Stack>
  );
}
