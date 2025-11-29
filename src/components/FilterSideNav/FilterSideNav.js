"use client";
import { memo, useCallback, useMemo } from "react";
import {
  Close,
  FilterAlt,
  Category,
  SignalCellularAlt,
  Cancel,
  CheckCircle,
  Person,
  Email,
} from "@mui/icons-material";
import {
  Button,
  Drawer,
  FormControl,
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

    filtersConfig.forEach((config) => {
      const currentValue = filters[config.name];
      if (
        currentValue !== "" &&
        currentValue !== undefined &&
        currentValue !== null
      ) {
        const option = config.options.find((opt) => opt.value === currentValue);
        if (option) {
          active.push({
            key: config.name,
            label: `${config.label}: ${option.label}`,
          });
        }
      }
    });

    return active;
  }, [filters, filtersConfig]);

  // Helper to get icon based on filter name (optional, can be passed in config too)
  const getFilterIcon = (name) => {
    switch (name) {
      case "difficulty":
        return (
          <SignalCellularAlt sx={{ fontSize: "18px", color: "var(--text3)" }} />
        );
      case "type":
      case "subjectID":
        return <Category sx={{ fontSize: "18px", color: "var(--text3)" }} />;
      case "status":
        return <CheckCircle sx={{ fontSize: "18px", color: "var(--text3)" }} />;
      case "gender":
        return <Person sx={{ fontSize: "18px", color: "var(--text3)" }} />;
      case "emailVerified":
        return <Email sx={{ fontSize: "18px", color: "var(--text3)" }} />;
      default:
        return <FilterAlt sx={{ fontSize: "18px", color: "var(--text3)" }} />;
    }
  };

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
                backgroundColor: "rgba(255, 152, 0, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FilterAlt sx={{ color: "#FF9800", fontSize: "20px" }} />
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
                  backgroundColor: "rgba(255, 152, 0, 0.1)",
                  color: "#FF9800",
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
                  color: "#FF9800",
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
                    backgroundColor: "rgba(255, 152, 0, 0.1)",
                    color: "#FF9800",
                    "& .MuiChip-deleteIcon": {
                      color: "#FF9800",
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
          {filtersConfig.map((config, index) => (
            <Stack key={config.name} gap={1.5}>
              {index > 0 && <Divider sx={{ mb: 1.5 }} />}

              <Stack direction="row" alignItems="center" gap={1}>
                {getFilterIcon(config.name)}
                <Typography
                  fontSize="13px"
                  fontWeight="700"
                  color="var(--text2)"
                >
                  {config.label}
                </Typography>
              </Stack>

              {config.type === "chip" && (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {config.options
                    .filter((opt) => opt.value !== "") // Skip "All" option for chips if desired, or keep it
                    .map((option) => {
                      const isSelected = filters[config.name] == option.value; // Loose equality for numbers/strings
                      const activeColor = option.color || "#FF9800"; // Default to orange if no color specified

                      return (
                        <Chip
                          key={option.value}
                          label={option.label}
                          onClick={() =>
                            handleChipSelect(config.name, option.value)
                          }
                          sx={{
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            backgroundColor: isSelected ? activeColor : "white",
                            color: isSelected ? "white" : "var(--text2)",
                            border: `1.5px solid ${
                              isSelected ? activeColor : "var(--border-color)"
                            }`,
                            "&:hover": {
                              backgroundColor: isSelected
                                ? activeColor
                                : "rgba(0, 0, 0, 0.04)",
                            },
                          }}
                        />
                      );
                    })}
                </Stack>
              )}

              {config.type === "select" && (
                <FormControl size="small" fullWidth>
                  <Select
                    value={filters[config.name] || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        [config.name]: e.target.value,
                      }))
                    }
                    displayEmpty
                    sx={{
                      backgroundColor: "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "var(--border-color)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#FF9800",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#FF9800",
                      },
                    }}
                  >
                    {config.options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Stack>
          ))}
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
                backgroundColor: "#FF9800",
                textTransform: "none",
                borderRadius: "8px",
                height: "44px",
                fontSize: "15px",
                fontWeight: "600",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#F57C00",
                  boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
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
