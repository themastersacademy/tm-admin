"use client";
import { Stack, Typography, Button, Chip, Box } from "@mui/material";
import { Add, FilterAlt, Group, Close } from "@mui/icons-material";
import SearchBox from "@/src/components/SearchBox/SearchBox";

export default function StudentsHeader({
  searchQuery,
  onSearchChange,
  onFilterClick,
  onAddClick,
  stats,
  isLoading,
  hasActiveFilters,
  onClearFilters,
}) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "16px 20px",
      }}
    >
      {/* Left */}
      <Stack direction="row" alignItems="center" gap="16px">
        <Stack direction="row" alignItems="center" gap="12px">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              backgroundColor: "var(--primary-color-acc-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(24, 113, 99, 0.15)",
              flexShrink: 0,
            }}
          >
            <Group sx={{ fontSize: "20px", color: "var(--primary-color)" }} />
          </Box>
          <Stack>
            <Stack direction="row" alignItems="center" gap="8px">
              <Typography
                sx={{
                  fontFamily: "Lato",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--text1)",
                }}
              >
                Students
              </Typography>
              <Chip
                label={stats.total || 0}
                size="small"
                sx={{
                  backgroundColor: "var(--primary-color-acc-2)",
                  color: "var(--primary-color)",
                  fontWeight: 700,
                  fontSize: "11px",
                  height: "22px",
                  minWidth: "28px",
                  border: "1px solid rgba(24, 113, 99, 0.2)",
                }}
              />
            </Stack>
            <Stack direction="row" alignItems="center" gap="12px">
              <Typography sx={{ fontSize: "12px", color: "var(--text4)" }}>
                {stats.verified || 0} verified
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "var(--text4)" }}>
                {stats.active || 0} active
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        {hasActiveFilters && (
          <Chip
            label="Filters active"
            size="small"
            onDelete={onClearFilters}
            deleteIcon={<Close sx={{ fontSize: "14px !important" }} />}
            sx={{
              height: "24px",
              fontSize: "11px",
              fontWeight: 600,
              backgroundColor: "rgba(33, 150, 243, 0.08)",
              color: "#2196F3",
              border: "1px solid rgba(33, 150, 243, 0.2)",
              "& .MuiChip-deleteIcon": { color: "#2196F3" },
            }}
          />
        )}
      </Stack>

      {/* Right */}
      <Stack direction="row" gap="8px" alignItems="center">
        <Stack sx={{ width: "200px" }}>
          <SearchBox value={searchQuery} onChange={onSearchChange} />
        </Stack>

        <Button
          variant="outlined"
          startIcon={<FilterAlt sx={{ fontSize: "16px" }} />}
          onClick={onFilterClick}
          sx={{
            borderColor: hasActiveFilters ? "#2196F3" : "var(--border-color)",
            color: hasActiveFilters ? "#2196F3" : "var(--text2)",
            backgroundColor: hasActiveFilters ? "rgba(33, 150, 243, 0.04)" : "transparent",
            textTransform: "none",
            borderRadius: "8px",
            padding: "6px 14px",
            fontWeight: 600,
            fontSize: "13px",
            height: "36px",
            "&:hover": {
              borderColor: "#2196F3",
              backgroundColor: "rgba(33, 150, 243, 0.04)",
            },
          }}
        >
          Filter
        </Button>

        <Button
          variant="contained"
          startIcon={<Add sx={{ fontSize: "18px" }} />}
          onClick={onAddClick}
          disableElevation
          sx={{
            backgroundColor: "var(--primary-color)",
            color: "#fff",
            textTransform: "none",
            borderRadius: "8px",
            padding: "6px 18px",
            fontWeight: 600,
            fontSize: "13px",
            height: "36px",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "var(--primary-color-dark)",
            },
          }}
        >
          Add Student
        </Button>
      </Stack>
    </Stack>
  );
}
