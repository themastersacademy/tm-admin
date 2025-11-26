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
    <Stack>
      <FormControl size="small">
        <InputLabel
          sx={{
            "&.Mui-focused": {
              color: "var(--sec-color)",
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
            <Stack flexDirection="row" flexWrap="wrap" gap="10px">
              {selectedIds.map((id) => {
                const match = batchOptions.find((opt) => opt.value === id);
                return (
                  <Chip
                    key={id}
                    label={match?.label || "Loading..."}
                    sx={{
                      backgroundColor: "var(--sec-color-acc-2)",
                      color: "var(--sec-color)",
                    }}
                  />
                );
              })}
            </Stack>
          )}
          sx={{
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--sec-color)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--sec-color)",
            },
          }}
        >
          {batchOptions.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "var(--sec-color-acc-2)",
                  color: "var(--sec-color)",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "var(--sec-color-acc-2)",
                },
              }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
