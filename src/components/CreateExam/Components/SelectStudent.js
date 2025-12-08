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
  const [batchStudents, setBatchStudents] = useState([]);
  const [fetchingBatchStudents, setFetchingBatchStudents] = useState(false);

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
  }, [exam.studentList, selectedStudents.length]);

  // Fetch students from selected batches
  useEffect(() => {
    const fetchBatchStudents = async () => {
      if (exam.batchList && exam.batchList.length > 0) {
        setFetchingBatchStudents(true);
        try {
          const data = await apiFetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/get-students-by-batch`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ batchIds: exam.batchList }),
            }
          );
          if (data.success) {
            setBatchStudents(data.data);
          }
        } catch (error) {
          console.error("Error fetching batch students:", error);
        } finally {
          setFetchingBatchStudents(false);
        }
      } else {
        setBatchStudents([]);
      }
    };

    fetchBatchStudents();
  }, [exam.batchList]);

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
    // Filter out students who are already in the batch list
    const validSelection = newValue.filter(
      (student) => !batchStudents.some((bs) => bs.id === student.id)
    );

    if (validSelection.length !== newValue.length) {
      showSnackbar(
        "Some students are already included via batches.",
        "warning",
        "",
        "3000"
      );
    }

    // newValue is an array of selected objects
    const studentIds = validSelection.map((student) => student.id);

    // Update local state
    setSelectedStudents(validSelection);

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

  // Filter options to disable or hide students already in batches
  const getFilteredOptions = (options) => {
    return options.map((option) => {
      const isInBatch = batchStudents.some((bs) => bs.id === option.id);
      return { ...option, disabled: isInBatch };
    });
  };

  return (
    <Stack gap="10px">
      {/* Display Batch Students Summary */}
      {exam.batchList && exam.batchList.length > 0 && (
        <Box
          sx={{
            padding: "12px",
            backgroundColor: "var(--primary-color-acc-2)",
            borderRadius: "8px",
            border: "1px solid var(--primary-color)",
          }}
        >
          <Stack flexDirection="row" alignItems="center" gap="10px">
            {fetchingBatchStudents ? (
              <CircularProgress
                size={20}
                sx={{ color: "var(--primary-color)" }}
              />
            ) : (
              <CheckCircle
                sx={{ color: "var(--primary-color)", fontSize: "20px" }}
              />
            )}
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--primary-color)",
              }}
            >
              {fetchingBatchStudents
                ? "Loading students from batches..."
                : `${batchStudents.length} students included from selected batches`}
            </Typography>
          </Stack>
        </Box>
      )}

      <Autocomplete
        multiple
        id="student-select"
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        getOptionLabel={(option) => option.name || option.email || ""}
        options={getFilteredOptions(options)}
        getOptionDisabled={(option) => option.disabled}
        loading={loading}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onChange={handleChange}
        value={selectedStudents}
        disabled={isLive}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search and Select Additional Students"
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
        renderOption={(props, option) => {
          const { key, ...otherProps } = props;
          return (
            <li key={key} {...otherProps}>
              <Stack
                direction="row"
                gap="10px"
                alignItems="center"
                sx={{ opacity: option.disabled ? 0.5 : 1 }}
              >
                <Avatar
                  src={option.image}
                  alt={option.name}
                  sx={{ width: 24, height: 24 }}
                />
                <Stack>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {option.name} {option.disabled && "(Already in Batch)"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.email}
                  </Typography>
                </Stack>
              </Stack>
            </li>
          );
        }}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index });
            return (
              <Chip
                key={option.id}
                label={option.name}
                {...tagProps}
                avatar={<Avatar src={option.image} />}
              />
            );
          })
        }
      />
    </Stack>
  );
}
