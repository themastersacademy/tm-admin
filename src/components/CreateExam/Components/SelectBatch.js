"use client";
import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";

const CACHE_KEY = "batchesCache";
const CACHE_TIME_KEY = "batchesCacheTime";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function SelectBatch({
  exam,
  setExam,
  updateBatchList,
  isLive,
}) {
  const { showSnackbar } = useSnackbar();
  const [allBatches, setAllBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      // Check cache first
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        const cacheTime = localStorage.getItem(CACHE_TIME_KEY);
        const now = Date.now();

        if (cached && cacheTime && now - parseInt(cacheTime) < CACHE_DURATION) {
          // Use cached data
          setAllBatches(JSON.parse(cached));
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Cache read error:", error);
      }

      // Fetch if no cache or cache expired
      setIsLoading(true);
      try {
        const data = await apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/get-all-batch`
        );

        if (data.success) {
          setAllBatches(data.data);
          // Store in cache
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data.data));
            localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
          } catch (error) {
            console.error("Cache write error:", error);
          }
        } else {
          showSnackbar(
            data.message || "Failed to load batches",
            "error",
            "",
            "3000"
          );
        }
      } catch (error) {
        console.error("Fetch batches error:", error);
        showSnackbar("Failed to load batches", "error", "", "3000");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, [showSnackbar]);

  const batchOptions = allBatches.map((batch) => ({
    label: batch.title,
    value: batch.id,
  }));

  if (isLoading) {
    return (
      <Stack flexDirection="row" alignItems="center" gap="10px">
        <CircularProgress size={20} sx={{ color: "var(--sec-color)" }} />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={40}
          sx={{ borderRadius: "4px" }}
        />
      </Stack>
    );
  }

  return (
    <FormControl size="small" fullWidth>
      <InputLabel
        sx={{
          fontSize: "13px",
          "&.Mui-focused": {
            color: "var(--primary-color)",
          },
        }}
      >
        Select Batch
      </InputLabel>
      <Select
        multiple
        size="small"
        label="Select Batch"
        value={exam?.batchList || []}
        onChange={(e) => {
          setExam((prev) => ({
            ...prev,
            batchList: e.target.value,
          }));
        }}
        onBlur={() => {
          if (exam.batchList) {
            updateBatchList(exam.batchList);
          }
        }}
        disabled={isLive}
        renderValue={(selectedIds) => (
          <Stack flexDirection="row" flexWrap="wrap" gap="4px">
            {selectedIds.map((id) => {
              const match = batchOptions.find((opt) => opt.value === id);
              return (
                <Chip
                  key={id}
                  label={match?.label || "Loading..."}
                  size="small"
                  sx={{
                    height: "24px",
                    fontSize: "12px",
                    fontWeight: 600,
                    backgroundColor: "var(--primary-color-acc-2)",
                    color: "var(--primary-color)",
                    border: "1px solid rgba(24, 113, 99, 0.2)",
                    "& .MuiChip-deleteIcon": {
                      color: "var(--primary-color)",
                      fontSize: "16px",
                    },
                  }}
                  onDelete={() => {
                    const newList = (exam?.batchList || []).filter(
                      (bId) => bId !== id
                    );
                    setExam((prev) => ({ ...prev, batchList: newList }));
                    updateBatchList(newList);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              );
            })}
          </Stack>
        )}
        sx={{
          borderRadius: "8px",
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
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: 250,
              borderRadius: "8px",
              mt: "4px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            },
          },
        }}
      >
        {batchOptions.map((option) => {
          const isSelected = (exam?.batchList || []).includes(option.value);
          return (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{
                fontSize: "13px",
                fontFamily: "Lato",
                padding: "8px 12px",
                borderRadius: "4px",
                mx: "4px",
                my: "2px",
                fontWeight: isSelected ? 600 : 400,
                backgroundColor: isSelected
                  ? "var(--primary-color-acc-2)"
                  : "transparent",
                color: isSelected ? "var(--primary-color)" : "var(--text1)",
                "&.Mui-selected": {
                  backgroundColor: "var(--primary-color-acc-2)",
                  color: "var(--primary-color)",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "rgba(24, 113, 99, 0.12)",
                },
                "&:hover": {
                  backgroundColor: "rgba(24, 113, 99, 0.06)",
                },
              }}
            >
              {option.label}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
