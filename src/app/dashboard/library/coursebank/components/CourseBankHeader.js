"use client";
import React from "react";
import {
  Stack,
  Typography,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { Folder } from "@mui/icons-material";
import SearchBox from "@/src/components/SearchBox/SearchBox";

export default function CourseBankHeader({
  title,
  actions = [],
  totalCount = 0,
  countLabel,
  subtitle,
  search,
  searchValue,
  onSearchChange,
  sortValue,
  onSortChange,
}) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        padding: "12px 16px",
      }}
    >
      {/* Left: Title & Badge */}
      <Stack direction="row" alignItems="center" gap="10px">
        <Stack
          sx={{
            width: "32px",
            height: "32px",
            backgroundColor: "rgba(24, 113, 99, 0.08)",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Folder sx={{ fontSize: "17px", color: "var(--primary-color)" }} />
        </Stack>
        <Typography
          sx={{ fontSize: "15px", fontWeight: 700, color: "var(--text1)" }}
        >
          {title}
        </Typography>
        <Chip
          label={
            countLabel ||
            `${totalCount} ${totalCount === 1 ? "Folder" : "Folders"}`
          }
          size="small"
          sx={{
            backgroundColor: "rgba(24, 113, 99, 0.08)",
            color: "var(--primary-color)",
            fontWeight: 700,
            fontSize: "11px",
            height: "22px",
            borderRadius: "6px",
          }}
        />
      </Stack>

      {/* Right: Search, Sort & Actions */}
      <Stack direction="row" gap="8px" alignItems="center">
        {search && (
          <Stack sx={{ width: "200px" }}>
            <SearchBox value={searchValue} onChange={onSearchChange} />
          </Stack>
        )}

        {onSortChange && (
          <FormControl size="small">
            <Select
              value={sortValue}
              onChange={onSortChange}
              displayEmpty
              sx={{
                fontSize: "12px",
                fontWeight: 600,
                borderRadius: "8px",
                height: "34px",
                color: "var(--text2)",
                backgroundColor: "var(--bg-color)",
                "& fieldset": { border: "none" },
                "& .MuiSelect-select": { padding: "6px 12px" },
              }}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="oldest">Oldest</MenuItem>
              <MenuItem value="a-z">A-Z</MenuItem>
              <MenuItem value="z-a">Z-A</MenuItem>
            </Select>
          </FormControl>
        )}

        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || "contained"}
            startIcon={action.icon}
            onClick={action.onClick}
            disableElevation
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              padding: "6px 16px",
              fontWeight: 600,
              fontSize: "12px",
              height: "34px",
              ...action.sx,
            }}
          >
            {action.label}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}
