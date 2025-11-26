"use client";
import { Search, CheckCircle } from "@mui/icons-material";
import {
  Box,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Card,
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
    <Stack gap="16px" sx={{ width: "100%", minHeight: "300px" }}>
      <TextField
        placeholder="Search subjects..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: "var(--text3)" }} />
            </InputAdornment>
          ),
          sx: {
            borderRadius: "8px",
            backgroundColor: "var(--bg-color)",
            "& fieldset": { border: "none" },
          },
        }}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "12px",
          maxHeight: "400px",
          overflowY: "auto",
          padding: "4px",
        }}
      >
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option, index) => {
            const id = getValue(option);
            const isSelected = value === id;
            const isAdded = alreadyAdded.includes(id);

            return (
              <Card
                key={index}
                elevation={0}
                onClick={() => !isAdded && onChange({ target: { value: id } })}
                sx={{
                  border: "1px solid",
                  borderColor: isSelected
                    ? "var(--primary-color)"
                    : "var(--border-color)",
                  borderRadius: "10px",
                  padding: "12px",
                  cursor: isAdded ? "default" : "pointer",
                  backgroundColor: isSelected
                    ? "var(--primary-color-acc-1)"
                    : isAdded
                    ? "var(--bg-color)"
                    : "var(--white)",
                  opacity: isAdded ? 0.7 : 1,
                  transition: "all 0.2s ease",
                  position: "relative",
                  "&:hover": {
                    borderColor: !isAdded && "var(--primary-color)",
                    transform: !isAdded && "translateY(-2px)",
                    boxShadow: !isAdded && "0 4px 8px rgba(0,0,0,0.05)",
                  },
                }}
              >
                {(isSelected || isAdded) && (
                  <CheckCircle
                    sx={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      fontSize: "16px",
                      color: isAdded ? "var(--text3)" : "var(--primary-color)",
                    }}
                  />
                )}
                <Typography
                  sx={{
                    fontFamily: "Lato",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: isSelected
                      ? "var(--primary-color)"
                      : isAdded
                      ? "var(--text3)"
                      : "var(--text1)",
                    textAlign: "center",
                    marginTop: "8px",
                    marginBottom: "8px",
                  }}
                >
                  {getLabel(option)}
                </Typography>
                {isAdded && (
                  <Typography
                    sx={{
                      fontFamily: "Lato",
                      fontSize: "10px",
                      color: "var(--text3)",
                      textAlign: "center",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Added
                  </Typography>
                )}
              </Card>
            );
          })
        ) : (
          <Typography
            sx={{
              gridColumn: "1 / -1",
              textAlign: "center",
              color: "var(--text3)",
              padding: "20px",
              fontFamily: "Lato",
            }}
          >
            No subjects found
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
