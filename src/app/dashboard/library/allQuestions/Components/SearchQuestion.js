"use client";

import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { Search } from "@mui/icons-material";
import { IconButton, InputAdornment } from "@mui/material";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// Custom hook to debounce a value
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchQuestions({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 1000);

  // Store onSearch in a ref so that we don't add it as an effect dependency
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Only trigger onSearch when the debounced value changes
  useEffect(() => {
    onSearchRef.current(debouncedQuery);
  }, [debouncedQuery]);

  const handleChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const endAdornment = useMemo(
    () => (
      <InputAdornment position="end">
        <IconButton>
          <Search fontSize="small" />
        </IconButton>
      </InputAdornment>
    ),
    []
  );

  return (
    <StyledTextField
      type="text"
      placeholder="Search questions..."
      value={searchQuery}
      onChange={handleChange}
      style={{ backgroundColor: "var(--white)" }}
      slotProps={{
        input: {
          endAdornment,
        },
      }}
    />
  );
}
