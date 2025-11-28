"use client";
import { memo, useCallback, useMemo } from "react";
import {
  Close,
  FilterAlt,
  Category,
  SignalCellularAlt,
  CalendarToday,
  Sort,
  Cancel,
} from "@mui/icons-material";
import {
  Button,
  Drawer,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  Chip,
  Box,
  Divider,
  IconButton,
} from "@mui/material";

function FilterSideNav({
  isOpen,
  toggleDrawer,
  onApply,
  filtersConfig,
  filters,
  setFilters,
}) {
  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(
      (v) => v !== "" && v !== null && v !== undefined
    ).length;
  }, [filters]);

  // Handle chip-based filter selection
  const handleChipSelect = useCallback(
    (filterName, value) => {
      setFilters((prev) => ({
        ...prev,
        [filterName]: prev[filterName] === value ? "" : value,
      }));
    },
    [setFilters]
  );

  // Handle clear all
  const handleClearAll = useCallback(() => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = "";
      return acc;
    }, {});
    setFilters(clearedFilters);
  }, [filters, setFilters]);

  // Handle remove single filter
  const handleRemoveFilter = useCallback(
    (filterKey) => {
      setFilters((prev) => ({ ...prev, [filterKey]: "" }));
    },
    [setFilters]
  );

  // Get active filters for pills
  const activeFilters = useMemo(() => {
    const active = [];

    // Difficulty
    if (filters.difficulty) {
      const label =
        filters.difficulty === 1
          ? "Easy"
          : filters.difficulty === 2
          ? "Medium"
          : "Hard";
      active.push({ key: "difficulty", label: `Difficulty: ${label}` });
    }

    // Type
    if (filters.type) {
      active.push({ key: "type", label: `Type: ${filters.type}` });
    }

    // Subject
    if (filters.subjectID) {
      const subjectConfig = filtersConfig.find((f) => f.name === "subjectID");
      const subject = subjectConfig?.options.find(
        (o) => o.value === filters.subjectID
      );
      if (subject) {
        active.push({ key: "subjectID", label: `Subject: ${subject.label}` });
      }
    }

    return active;
  }, [filters, filtersConfig]);

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={toggleDrawer(false)}
      disableScrollLock
      ModalProps={{
        BackdropProps: { style: { backgroundColor: "rgba(0, 0, 0, 0.3)" } },
      }}
      sx={{
        "& .MuiDrawer-paper": {
          width: "360px",
          boxShadow: "-4px 0 20px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      <Stack height="100%" sx={{ backgroundColor: "#fafafa" }}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            p: "20px",
            backgroundColor: "white",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(102, 126, 234, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FilterAlt
                sx={{ color: "var(--primary-color)", fontSize: "20px" }}
              />
            </Box>
            <Typography
              sx={{
                fontSize: "18px",
                fontWeight: "700",
                color: "var(--text1)",
              }}
            >
              Filters
            </Typography>
            {activeFilterCount > 0 && (
              <Chip
                label={activeFilterCount}
                size="small"
                sx={{
                  height: "20px",
                  fontSize: "11px",
                  fontWeight: "700",
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
              />
            )}
          </Stack>
          <IconButton onClick={toggleDrawer(false)} size="small">
            <Close sx={{ fontSize: "20px" }} />
          </IconButton>
        </Stack>

        {/* Active Filters Pills */}
        {activeFilters.length > 0 && (
          <Stack
            gap={1}
            sx={{
              p: "16px",
              backgroundColor: "white",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography fontSize="12px" fontWeight="600" color="var(--text3)">
                ACTIVE FILTERS
              </Typography>
              <Button
                size="small"
                onClick={handleClearAll}
                sx={{
                  textTransform: "none",
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "var(--primary-color)",
                  minWidth: "auto",
                  p: "4px 8px",
                }}
              >
                Clear All
              </Button>
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              {activeFilters.map((filter) => (
                <Chip
                  key={filter.key}
                  label={filter.label}
                  size="small"
                  onDelete={() => handleRemoveFilter(filter.key)}
                  deleteIcon={<Cancel sx={{ fontSize: "16px !important" }} />}
                  sx={{
                    height: "26px",
                    fontSize: "12px",
                    fontWeight: "600",
                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                    color: "var(--primary-color)",
                    "& .MuiChip-deleteIcon": {
                      color: "var(--primary-color)",
                      "&:hover": {
                        color: "#DC2626",
                      },
                    },
                  }}
                />
              ))}
            </Stack>
          </Stack>
        )}

        {/* Filter Content */}
        <Stack flex={1} sx={{ overflowY: "auto", p: "20px", gap: "20px" }}>
          {/* Difficulty Filter */}
          <Stack gap={1.5}>
            <Stack direction="row" alignItems="center" gap={1}>
              <SignalCellularAlt
                sx={{ fontSize: "18px", color: "var(--text3)" }}
              />
              <Typography fontSize="13px" fontWeight="700" color="var(--text2)">
                Difficulty Level
              </Typography>
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {[
                { label: "Easy", value: 1, color: "#10B981" },
                { label: "Medium", value: 2, color: "#F59E0B" },
                { label: "Hard", value: 3, color: "#EF4444" },
              ].map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  onClick={() => handleChipSelect("difficulty", option.value)}
                  sx={{
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    backgroundColor:
                      filters.difficulty === option.value
                        ? option.color
                        : "white",
                    color:
                      filters.difficulty === option.value
                        ? "white"
                        : "var(--text2)",
                    border: `1.5px solid ${
                      filters.difficulty === option.value
                        ? option.color
                        : "var(--border-color)"
                    }`,
                    "&:hover": {
                      backgroundColor:
                        filters.difficulty === option.value
                          ? option.color
                          : "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                />
              ))}
            </Stack>
          </Stack>

          <Divider />

          {/* Type Filter */}
          <Stack gap={1.5}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Category sx={{ fontSize: "18px", color: "var(--text3)" }} />
              <Typography fontSize="13px" fontWeight="700" color="var(--text2)">
                Question Type
              </Typography>
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {["MCQ", "MSQ", "FIB"].map((type) => (
                <Chip
                  key={type}
                  label={type}
                  onClick={() => handleChipSelect("type", type)}
                  sx={{
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    backgroundColor:
                      filters.type === type ? "var(--primary-color)" : "white",
                    color: filters.type === type ? "white" : "var(--text2)",
                    border: `1.5px solid ${
                      filters.type === type
                        ? "var(--primary-color)"
                        : "var(--border-color)"
                    }`,
                    "&:hover": {
                      backgroundColor:
                        filters.type === type
                          ? "var(--primary-color)"
                          : "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                />
              ))}
            </Stack>
          </Stack>

          <Divider />

          {/* Subject Filter */}
          <Stack gap={1.5}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Category sx={{ fontSize: "18px", color: "var(--text3)" }} />
              <Typography fontSize="13px" fontWeight="700" color="var(--text2)">
                Subject
              </Typography>
            </Stack>
            <FormControl size="small" fullWidth>
              <Select
                value={filters.subjectID || ""}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, subjectID: e.target.value }))
                }
                displayEmpty
                sx={{
                  backgroundColor: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--border-color)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--primary-color)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--primary-color)",
                  },
                }}
              >
                <MenuItem value="">All Subjects</MenuItem>
                {filtersConfig
                  .find((f) => f.name === "subjectID")
                  ?.options.filter((opt) => opt.value !== "")
                  .map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        {/* Apply Button */}
        {onApply && (
          <Stack
            sx={{
              p: "16px",
              backgroundColor: "white",
              borderTop: "1px solid var(--border-color)",
            }}
          >
            <Button
              variant="contained"
              onClick={onApply}
              fullWidth
              sx={{
                backgroundColor: "var(--primary-color)",
                textTransform: "none",
                borderRadius: "8px",
                height: "44px",
                fontSize: "15px",
                fontWeight: "600",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "var(--primary-color)",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                },
              }}
            >
              Apply Filters
            </Button>
          </Stack>
        )}
      </Stack>
    </Drawer>
  );
}

export default memo(FilterSideNav);
