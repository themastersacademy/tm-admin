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
import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { CheckCircle, Cancel } from "@mui/icons-material";

// Module-level cache — survives component re-mounts within the same session
let _usersCache = null;
let _usersCacheAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export default function SelectStudent({
  exam,
  setExam,
  updateStudentList,
  isLive,
}) {
  const { showSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [allUsers, setAllUsers] = useState(() => _usersCache || []);
  const [usersLoading, setUsersLoading] = useState(!_usersCache);
  const [loading, setLoading] = useState(false); // for fetching selected students
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

  // Load all users once — uses module-level cache to avoid re-fetching on re-mount
  useEffect(() => {
    const now = Date.now();
    if (_usersCache && now - _usersCacheAt < CACHE_TTL_MS) {
      setAllUsers(_usersCache);
      setUsersLoading(false);
      return;
    }
    setUsersLoading(true);
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/get-all-users?minimal=true`)
      .then((data) => {
        if (data.success) {
          _usersCache = data.data;
          _usersCacheAt = Date.now();
          setAllUsers(data.data);
        }
      })
      .catch((error) => console.error("Error loading users:", error))
      .finally(() => setUsersLoading(false));
  }, []);

  // Filter client-side — useMemo avoids a setState round-trip on every keystroke
  const options = useMemo(() => {
    if (!inputValue || inputValue.length < 2) return [];
    const q = inputValue.toLowerCase();
    return allUsers
      .filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [inputValue, allUsers]);

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
    <Stack gap="8px">
      {/* Batch Students Summary */}
      {exam.batchList && exam.batchList.length > 0 && (
        <Stack
          flexDirection="row"
          alignItems="center"
          gap="8px"
          sx={{
            padding: "8px 12px",
            backgroundColor: "var(--primary-color-acc-2)",
            borderRadius: "8px",
            border: "1px solid rgba(24, 113, 99, 0.2)",
          }}
        >
          {fetchingBatchStudents ? (
            <CircularProgress
              size={16}
              sx={{ color: "var(--primary-color)" }}
            />
          ) : (
            <CheckCircle
              sx={{ color: "var(--primary-color)", fontSize: "18px" }}
            />
          )}
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--primary-color)",
              fontFamily: "Lato",
            }}
          >
            {fetchingBatchStudents
              ? "Loading batch students..."
              : `${batchStudents.length} students from batches`}
          </Typography>
        </Stack>
      )}

      <Autocomplete
        multiple
        size="small"
        id="student-select"
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        getOptionLabel={(option) => option.name || option.email || ""}
        options={getFilteredOptions(options)}
        getOptionDisabled={(option) => option.disabled}
        loading={usersLoading}
        noOptionsText={
          usersLoading
            ? "Loading students..."
            : inputValue.length < 2
              ? "Type at least 2 characters"
              : "No students found"
        }
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onChange={handleChange}
        value={selectedStudents}
        disabled={isLive}
        ListboxProps={{
          sx: {
            maxHeight: 220,
            "& .MuiAutocomplete-option": {
              padding: "6px 10px",
              borderRadius: "4px",
              mx: "4px",
              my: "2px",
              "&:hover": {
                backgroundColor: "rgba(24, 113, 99, 0.06)",
              },
              '&[aria-selected="true"]': {
                backgroundColor: "var(--primary-color-acc-2)",
              },
            },
          },
        }}
        componentsProps={{
          paper: {
            sx: {
              borderRadius: "8px",
              mt: "4px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            },
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search and Select Additional Students"
            placeholder="Type name or email..."
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                fontSize: "13px",
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
                fontSize: "13px",
                "&.Mui-focused": {
                  color: "var(--primary-color)",
                },
              },
            }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {usersLoading ? (
                    <CircularProgress
                      size={16}
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
          const { key, ...otherProps } = props;
          return (
            <li key={key} {...otherProps}>
              <Stack
                direction="row"
                gap="8px"
                alignItems="center"
                sx={{ opacity: option.disabled ? 0.5 : 1 }}
              >
                <Avatar
                  src={option.image}
                  alt={option.name}
                  sx={{ width: 24, height: 24, fontSize: "12px" }}
                />
                <Stack>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 600,
                      fontFamily: "Lato",
                      color: "var(--text1)",
                    }}
                  >
                    {option.name}{" "}
                    {option.disabled && (
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "11px",
                          color: "var(--text3)",
                          fontStyle: "italic",
                        }}
                      >
                        (in batch)
                      </Typography>
                    )}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "11px",
                      color: "var(--text3)",
                      fontFamily: "Lato",
                    }}
                  >
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
                size="small"
                {...tagProps}
                avatar={
                  <Avatar
                    src={option.image}
                    sx={{ width: 20, height: 20 }}
                  />
                }
                sx={{
                  height: "26px",
                  fontSize: "12px",
                  fontWeight: 600,
                  backgroundColor: "var(--primary-color-acc-2)",
                  color: "var(--primary-color)",
                  border: "1px solid rgba(24, 113, 99, 0.2)",
                  "& .MuiChip-deleteIcon": {
                    color: "rgba(24, 113, 99, 0.5)",
                    fontSize: "16px",
                    "&:hover": {
                      color: "var(--primary-color)",
                    },
                  },
                  "& .MuiChip-avatar": {
                    width: 20,
                    height: 20,
                  },
                }}
              />
            );
          })
        }
      />
    </Stack>
  );
}
