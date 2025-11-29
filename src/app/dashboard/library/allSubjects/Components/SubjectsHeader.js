"use client";
import React from "react";
import {
  Stack,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  Chip,
} from "@mui/material";
import { Category, ExpandMore } from "@mui/icons-material";
import SearchBox from "@/src/components/SearchBox/SearchBox";

export default function SubjectsHeader({
  title,
  actions = [],
  search,
  searchValue,
  onSearchChange,
  sortValue,
  onSortChange,
  totalCount = 0,
}) {
  return (
    <Stack
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Top Bar */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        padding="20px 24px"
        sx={{
          borderBottom: "1px solid var(--border-color)",
          background: "linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)",
        }}
      >
        {/* Left: Title & Badge */}
        <Stack direction="row" alignItems="center" gap="16px">
          <Stack
            sx={{
              width: "52px",
              height: "52px",
              background:
                "linear-gradient(135deg, rgba(var(--primary-rgb), 0.12) 0%, rgba(var(--primary-rgb), 0.06) 100%)",
              borderRadius: "14px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "1.5px solid rgba(var(--primary-rgb), 0.25)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Category
              sx={{ fontSize: "26px", color: "var(--primary-color)" }}
            />
          </Stack>

          <Stack gap="6px">
            <Stack direction="row" alignItems="center" gap="12px">
              <Typography
                sx={{
                  fontFamily: "Lato",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--text1)",
                }}
              >
                {title}
              </Typography>
              <Chip
                label={`${totalCount} ${
                  totalCount === 1 ? "Subject" : "Subjects"
                }`}
                size="small"
                sx={{
                  backgroundColor: "rgba(255, 152, 0, 0.1)",
                  color: "#F57C00",
                  fontWeight: 700,
                  fontSize: "11px",
                  height: "24px",
                  border: "1px solid rgba(255, 152, 0, 0.2)",
                }}
              />
            </Stack>
            <Typography
              sx={{ fontSize: "13px", color: "var(--text3)", lineHeight: 1.4 }}
            >
              Organize and manage subjects for your question library
            </Typography>
          </Stack>
        </Stack>

        {/* Right: Actions */}
        <Stack direction="row" gap="12px" alignItems="center">
          {search && (
            <Stack sx={{ position: "relative", width: "240px" }}>
              <SearchBox value={searchValue} onChange={onSearchChange} />
            </Stack>
          )}

          {onSortChange && (
            <Stack
              sx={{
                border: "1.5px solid var(--border-color)",
                borderRadius: "10px",
                backgroundColor: "var(--white)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                padding: "8px 12px",
                minWidth: "130px",
                height: "48px",
                "&:hover": {
                  borderColor: "var(--primary-color)",
                  backgroundColor: "rgba(var(--primary-rgb), 0.04)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 2px 8px rgba(var(--primary-rgb), 0.15)",
                },
              }}
            >
              <Stack direction="row" alignItems="center" gap="8px">
                <Stack
                  sx={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: "var(--bg-color)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ExpandMore
                    sx={{
                      fontSize: "18px",
                      color: "var(--text2)",
                    }}
                  />
                </Stack>
                <Stack flex={1}>
                  <Typography
                    sx={{
                      fontSize: "10px",
                      color: "var(--text3)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Sort By
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 80 }}>
                    <Select
                      value={sortValue}
                      onChange={onSortChange}
                      displayEmpty
                      variant="standard"
                      disableUnderline
                      sx={{
                        fontSize: "13px",
                        color: "var(--text1)",
                        fontWeight: 700,
                        "& .MuiSelect-select": {
                          padding: 0,
                        },
                      }}
                    >
                      <MenuItem value="newest">Newest</MenuItem>
                      <MenuItem value="oldest">Oldest</MenuItem>
                      <MenuItem value="a-z">A-Z</MenuItem>
                      <MenuItem value="z-a">Z-A</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            </Stack>
          )}

          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "contained"}
              startIcon={action.icon}
              onClick={action.onClick}
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                padding: "10px 24px",
                fontWeight: 700,
                fontSize: "14px",
                minWidth: "140px",
                height: "48px",
                boxShadow:
                  action.variant === "contained"
                    ? "0 4px 12px rgba(255, 152, 0, 0.25)"
                    : "none",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow:
                    action.variant === "contained"
                      ? "0 6px 16px rgba(255, 152, 0, 0.35)"
                      : "none",
                },
                ...action.sx,
              }}
              disableElevation
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
