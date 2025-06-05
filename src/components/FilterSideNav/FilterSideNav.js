"use client";
import { memo, useCallback, useMemo } from "react";
import { Close } from "@mui/icons-material";
import {
  Button,
  Drawer,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

function FilterSideNav({
  isOpen,
  toggleDrawer,
  onApply,
  filtersConfig,
  filters,
  setFilters,
}) {
  // Memoized change handler to update parent's state
  const handleChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      setFilters((prev) => ({ ...prev, [name]: value }));
    },
    [setFilters]
  );

  // Memoize the filter elements so they're only re-rendered when their dependencies change
  const renderedFilters = useMemo(() => {
    return filtersConfig.map((filter) => (
      <FormControl key={filter.name} size="small">
        <InputLabel
          sx={{
            "&.Mui-focused": { color: "var(--sec-color)" },
          }}
        >
          {filter.label}
        </InputLabel>
        <Select
          name={filter.name}
          value={filters[filter.name] || ""}
          onChange={handleChange}
          label={filter.label}
          sx={{
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--sec-color)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--sec-color)",
            },
          }}
        >
          {filter.options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    ));
  }, [filtersConfig, filters, handleChange]);

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      disableScrollLock
      ModalProps={{
        BackdropProps: { style: { backgroundColor: "transparent" } },
      }}
      sx={{
        "& .MuiDrawer-paper": { width: "300px" },
      }}
    >
      <Stack width="300px" padding="20px" gap="20px">
        <Stack flexDirection="row" justifyContent="space-between">
          <Typography
            sx={{ fontFamily: "Lato", fontSize: "16px", fontWeight: "700" }}
          >
            Filter
          </Typography>
          <Close onClick={toggleDrawer(false)} sx={{ cursor: "pointer" }} />
        </Stack>
        {renderedFilters}
        {onApply && (
          <Button
            variant="contained"
            onClick={onApply}
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
              borderRadius: "4px",
            }}
            disableElevation
          >
            Apply
          </Button>
        )}
      </Stack>
    </Drawer>
  );
}

export default memo(FilterSideNav);
