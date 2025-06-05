"use client";
import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
} from "@mui/material";
import { useState, useEffect } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";

export default function SelectBatch({
  exam,
  setExam,
  updateBatchList,
  isLive,
}) {
  const { showSnackbar } = useSnackbar();
  const [allBatches, setAllBatches] = useState([]);

  useEffect(() => {
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/get-all-batch`)
      .then((data) => {
        if (data.success) {
          setAllBatches(data.data);
        } else {
          showSnackbar(data.message, "error", "", "3000");
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const batchOptions = allBatches.map((batch) => ({
    label: batch.title,
    value: batch.id,
  }));

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
          value={exam?.batchList}
          onChange={(e) => {
            setExam((prev) => ({
              ...prev,
              batchList: e.target.value,
            }));
          }}
          onBlur={() => {
            updateBatchList(exam.batchList);
          }}
          disabled={isLive}
          renderValue={(selectedIds) => (
            <Stack flexDirection="row" flexWrap="wrap" gap="10px">
              {selectedIds.map((id) => {
                const match = batchOptions.find((opt) => opt.value === id);
                return (
                  <Chip
                    key={id}
                    label={
                      match?.label || (
                        <Skeleton
                          variant="text"
                          width={100}
                          sx={{
                            backgroundColor: "var(--sec-color-acc-2)",
                          }}
                        />
                      )
                    }
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
