"use client";
import { Stack, Typography, Button, Chip } from "@mui/material";
import {
  Add,
  ExpandMore,
  Schedule,
  Quiz,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import SearchBox from "@/src/components/SearchBox/SearchBox";

export default function ScheduleTestHeader({
  searchQuery,
  onSearchChange,
  statusFilter,
  onFilterClick,
  onCreateClick,
  filteredCount,
  stats,
  onClearFilter,
  isLoading,
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      padding="10px 16px"
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
      }}
    >
      {/* Left: Icon + Title + Chip + Stats */}
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
            flexShrink: 0,
          }}
        >
          <Schedule sx={{ fontSize: "18px", color: "var(--primary-color)" }} />
        </Stack>

        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--text1)",
          }}
        >
          Schedule Test
        </Typography>

        <Chip
          label={`${filteredCount} Exams`}
          size="small"
          sx={{
            backgroundColor: "rgba(24, 113, 99, 0.08)",
            color: "var(--primary-color)",
            fontWeight: 600,
            fontSize: "11px",
            height: "22px",
          }}
        />

        {!isLoading && (
          <Stack direction="row" alignItems="center" gap="6px" ml="6px">
            <StatChip icon={<Quiz />} label="Total" value={stats.total} color="#2196F3" />
            <StatChip icon={<CheckCircle />} label="Live" value={stats.live} color="#4CAF50" />
            <StatChip icon={<Schedule />} label="Scheduled" value={stats.scheduled} color="#FF9800" />
            <StatChip icon={<Cancel />} label="Ended" value={stats.ended} color="#F44336" />
          </Stack>
        )}

        {statusFilter !== "all" && (
          <Chip
            label={`Filtered: ${statusFilter}`}
            size="small"
            onDelete={onClearFilter}
            sx={{
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              color: "#4CAF50",
              fontWeight: 600,
              fontSize: "11px",
              height: "22px",
              "& .MuiChip-deleteIcon": {
                fontSize: "14px",
                color: "#4CAF50",
              },
            }}
          />
        )}
      </Stack>

      {/* Right: Search + Filter + Create */}
      <Stack direction="row" gap="8px" alignItems="center">
        <Stack sx={{ width: "200px" }}>
          <SearchBox value={searchQuery} onChange={onSearchChange} />
        </Stack>

        <Button
          variant="outlined"
          size="small"
          endIcon={<ExpandMore sx={{ fontSize: "16px" }} />}
          onClick={onFilterClick}
          sx={{
            textTransform: "none",
            borderColor: statusFilter !== "all" ? "#4CAF50" : "var(--border-color)",
            color: statusFilter !== "all" ? "#4CAF50" : "var(--text2)",
            backgroundColor: statusFilter !== "all" ? "rgba(76, 175, 80, 0.08)" : "transparent",
            borderRadius: "8px",
            height: "34px",
            fontSize: "12px",
            fontWeight: 600,
            padding: "0 12px",
            "&:hover": {
              borderColor: "#4CAF50",
              backgroundColor: "rgba(76, 175, 80, 0.08)",
            },
          }}
        >
          {statusFilter === "all"
            ? "Filter"
            : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
        </Button>

        <Button
          variant="contained"
          startIcon={<Add sx={{ fontSize: "16px" }} />}
          onClick={onCreateClick}
          disableElevation
          sx={{
            backgroundColor: "var(--primary-color)",
            color: "#fff",
            textTransform: "none",
            borderRadius: "8px",
            height: "34px",
            fontSize: "12px",
            fontWeight: 600,
            padding: "0 14px",
            "&:hover": {
              backgroundColor: "var(--primary-color)",
              opacity: 0.9,
            },
          }}
        >
          Create Exam
        </Button>
      </Stack>
    </Stack>
  );
}

const StatChip = ({ label, value, color }) => (
  <Stack
    direction="row"
    alignItems="center"
    gap="4px"
    padding="2px 8px"
    sx={{
      backgroundColor: `${color}12`,
      borderRadius: "6px",
    }}
  >
    <Typography sx={{ fontSize: "11px", color: color, fontWeight: 700 }}>
      {value}
    </Typography>
    <Typography sx={{ fontSize: "10px", color: "var(--text3)", fontWeight: 500 }}>
      {label}
    </Typography>
  </Stack>
);
