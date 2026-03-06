"use client";
import { Search, CheckCircle } from "@mui/icons-material";
import {
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState, useMemo } from "react";

export default function SubjectSelection({
  value,
  onChange,
  options = [],
  alreadyAdded = [],
  getLabel = (option) => option?.title,
  getValue = (option) => option?.subjectID,
}) {
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter((option) =>
      getLabel(option).toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search, getLabel]);

  return (
    <Stack gap="12px" sx={{ width: "100%" }}>
      <TextField
        placeholder="Search subjects..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ fontSize: "18px", color: "var(--text4)" }} />
            </InputAdornment>
          ),
          sx: {
            borderRadius: "8px",
            fontSize: "13px",
            height: "36px",
            backgroundColor: "var(--bg-color, #fafafa)",
            "& fieldset": { border: "none" },
          },
        }}
      />

      <Stack
        gap="6px"
        sx={{
          maxHeight: "350px",
          overflowY: "auto",
          padding: "2px",
        }}
      >
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option, index) => {
            const id = getValue(option);
            const isSelected = value === id;
            const isAdded = alreadyAdded.includes(id);

            return (
              <Stack
                key={index}
                direction="row"
                alignItems="center"
                onClick={() => !isAdded && onChange({ target: { value: id } })}
                sx={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${isSelected ? "var(--primary-color)" : "var(--border-color)"}`,
                  backgroundColor: isSelected
                    ? "var(--primary-color-acc-2)"
                    : isAdded
                    ? "var(--bg-color, #fafafa)"
                    : "var(--white)",
                  cursor: isAdded ? "default" : "pointer",
                  opacity: isAdded ? 0.6 : 1,
                  transition: "all 0.15s ease",
                  "&:hover": {
                    borderColor: !isAdded ? "var(--primary-color)" : undefined,
                  },
                }}
              >
                <Typography
                  sx={{
                    flex: 1,
                    fontSize: "13px",
                    fontWeight: 600,
                    color: isSelected
                      ? "var(--primary-color)"
                      : isAdded
                      ? "var(--text4)"
                      : "var(--text1)",
                  }}
                >
                  {getLabel(option)}
                </Typography>
                {(isSelected || isAdded) && (
                  <CheckCircle
                    sx={{
                      fontSize: "14px",
                      color: isAdded ? "var(--text4)" : "var(--primary-color)",
                    }}
                  />
                )}
              </Stack>
            );
          })
        ) : (
          <Typography
            sx={{
              textAlign: "center",
              color: "var(--text4)",
              padding: "20px",
              fontSize: "13px",
            }}
          >
            No subjects found
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
