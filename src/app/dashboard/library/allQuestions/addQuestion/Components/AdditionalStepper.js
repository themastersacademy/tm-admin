"use client";
import { useCallback } from "react";
import { Add, DeleteForever } from "@mui/icons-material";
import {
  Button,
  Checkbox,
  IconButton,
  Stack,
  Typography,
  TextField,
} from "@mui/material";
import MarkdownEditor from "@/src/components/MarkdownEditor/MarkdownEditor";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";

export default function AdditionalStepper({ questionData, setQuestionData }) {
  const { type, options = [], answerKey = [], blanks = [] } = questionData;

  // Helper to update the top‐level questionData
  const update = useCallback(
    (changes) =>
      setQuestionData((prev) => ({
        ...prev,
        ...changes,
      })),
    [setQuestionData]
  );

  // Add either an option (MCQ/MSQ) or a blank (FIB)
  const handleAdd = useCallback(() => {
    if (type === "FIB") {
      const nextId = blanks.length;
      update({ blanks: [...blanks, { id: nextId, correctAnswers: [""] }] });
    } else {
      const nextId = options.length;
      update({
        options: [...options, { id: nextId, text: "", weight: 0 }],
      });
      // in MCQ we’ll pick one via toggle; in MSQ they can mark multiple
    }
  }, [type, options, blanks, update]);

  // Remove at index
  const handleRemove = useCallback(
    (index) => {
      if (type === "FIB") {
        const newBlanks = blanks
          .filter((_, i) => i !== index)
          .map((b, i) => ({ ...b, id: i }));
        update({ blanks: newBlanks });
      } else {
        const newOpts = options
          .filter((_, i) => i !== index)
          .map((opt, i) => ({ ...opt, id: i }));
        // reindex answerKey
        const newKey = answerKey
          .filter((id) => id !== index)
          .map((id) => (id > index ? id - 1 : id));
        update({ options: newOpts, answerKey: newKey });
      }
    },
    [type, options, blanks, answerKey, update]
  );

  // Toggle MCQ/MSQ correctness
  const handleToggle = useCallback(
    (idx) => {
      if (type === "MCQ") {
        // Only one correct
        update({
          answerKey: [idx],
          options: options.map((o, i) => ({
            ...o,
            weight: i === idx ? 100 : 0,
          })),
        });
      } else {
        // MSQ: toggle then reweight
        let newKey = answerKey.includes(idx)
          ? answerKey.filter((i) => i !== idx)
          : [...answerKey, idx];
        const w = newKey.length > 0 ? 100 / newKey.length : 0;
        update({
          answerKey: newKey,
          options: options.map((o, i) => ({
            ...o,
            weight: newKey.includes(i) ? w : 0,
          })),
        });
      }
    },
    [type, options, answerKey, update]
  );

  // Change text of option or blank
  const handleTextChange = useCallback(
    (value, idx) => {
      if (type === "FIB") {
        const newBlanks = [...blanks];
        newBlanks[idx] = { ...newBlanks[idx], correctAnswers: [value] };
        update({ blanks: newBlanks });
      } else {
        const newOpts = [...options];
        newOpts[idx] = { ...newOpts[idx], text: value };
        update({ options: newOpts });
      }
    },
    [type, options, blanks, update]
  );

  return (
    <Stack spacing={3} width="100%">
      {/* Info Banner */}
      <Stack
        sx={{
          padding: "16px 20px",
          background:
            "linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(245, 124, 0, 0.02) 100%)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 152, 0, 0.15)",
        }}
      >
        <Typography
          sx={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#FF9800",
          }}
        >
          {type === "FIB"
            ? "Add blanks and their correct answers"
            : type === "MCQ"
            ? "Add options and select exactly one correct answer"
            : "Add options and select multiple correct answers"}
        </Typography>
      </Stack>

      {/* Options/Blanks List */}
      <Stack spacing={2.5} width="100%">
        {(type === "FIB" ? blanks : options).map((item, idx) => (
          <Stack
            key={idx}
            sx={{
              padding: "20px",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "rgba(255, 152, 0, 0.3)",
                boxShadow: "0 4px 12px rgba(255, 152, 0, 0.08)",
              },
            }}
          >
            {/* Header Row */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ marginBottom: "16px" }}
            >
              {/* Label */}
              <Stack
                sx={{
                  backgroundColor: "rgba(255, 152, 0, 0.12)",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 152, 0, 0.25)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#FF9800",
                  }}
                >
                  {type === "FIB" ? `Blank ${idx + 1}` : `Option ${idx + 1}`}
                </Typography>
              </Stack>

              {/* Correct Answer Checkbox (MCQ/MSQ) */}
              {type !== "FIB" && (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    padding: "4px 12px",
                    borderRadius: "8px",
                    backgroundColor: answerKey.includes(idx)
                      ? "rgba(76, 175, 80, 0.12)"
                      : "transparent",
                    border: answerKey.includes(idx)
                      ? "1px solid rgba(76, 175, 80, 0.3)"
                      : "1px solid var(--border-color)",
                  }}
                >
                  <Checkbox
                    checked={answerKey.includes(idx)}
                    onChange={() => handleToggle(idx)}
                    sx={{
                      color: "#4CAF50",
                      padding: "0px",
                      "&.Mui-checked": { color: "#4CAF50" },
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: answerKey.includes(idx)
                        ? "#4CAF50"
                        : "var(--text3)",
                    }}
                  >
                    Correct Answer
                  </Typography>
                </Stack>
              )}

              {/* Weight Display (MCQ/MSQ) */}
              {type !== "FIB" && (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    padding: "4px 12px",
                    borderRadius: "8px",
                    backgroundColor: "#FAFAFA",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--text3)",
                    }}
                  >
                    Weight:
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    disabled={type === "MCQ"}
                    value={options[idx]?.weight || 0}
                    onChange={(e) => {
                      let w = parseFloat(e.target.value) || 0;
                      w = Math.max(0, Math.min(100, w));
                      const newOpts = [...options];
                      newOpts[idx] = { ...newOpts[idx], weight: w };
                      update({ options: newOpts });
                    }}
                    sx={{
                      width: 70,
                      "& .MuiInputBase-input": {
                        fontSize: "13px",
                        fontWeight: 600,
                        padding: "4px 8px",
                      },
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--text3)",
                    }}
                  >
                    %
                  </Typography>
                </Stack>
              )}

              {/* Weight for FIB */}
              {type === "FIB" && (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    padding: "4px 12px",
                    borderRadius: "8px",
                    backgroundColor: "#FAFAFA",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--text3)",
                    }}
                  >
                    Weightage:
                  </Typography>
                  <StyledTextField
                    type="number"
                    value={blanks[idx]?.weight || 0}
                    onChange={(e) => {
                      let w = parseFloat(e.target.value) || 0;
                      w = Math.max(0, Math.min(100, w));
                      const newBlanks = [...blanks];
                      newBlanks[idx] = { ...newBlanks[idx], weight: w };
                      update({ blanks: newBlanks });
                    }}
                    sx={{
                      width: 70,
                      "& .MuiInputBase-input": {
                        fontSize: "13px",
                        fontWeight: 600,
                        padding: "4px 8px",
                      },
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--text3)",
                    }}
                  >
                    %
                  </Typography>
                </Stack>
              )}

              {/* Delete Button */}
              <IconButton
                onClick={() => handleRemove(idx)}
                sx={{
                  marginLeft: "auto !important",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  padding: "6px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(239, 83, 80, 0.08)",
                    borderColor: "#EF5350",
                    "& svg": {
                      color: "#EF5350",
                    },
                  },
                }}
              >
                <DeleteForever sx={{ color: "var(--text3)", fontSize: 20 }} />
              </IconButton>
            </Stack>

            {/* Content Input */}
            <Stack sx={{ width: "100%" }}>
              {type === "FIB" ? (
                <StyledTextField
                  fullWidth
                  placeholder="Enter correct answer"
                  value={blanks[idx]?.correctAnswers[0] || ""}
                  onChange={(e) => handleTextChange(e.target.value, idx)}
                />
              ) : (
                <Stack sx={{ width: "100%", maxWidth: "100%" }}>
                  <MarkdownEditor
                    value={options[idx]?.text || ""}
                    onChange={(value) => handleTextChange(value, idx)}
                    placeholder="Type option text here..."
                  />
                </Stack>
              )}
            </Stack>
          </Stack>
        ))}
      </Stack>

      {/* Add Button */}
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={handleAdd}
        sx={{
          alignSelf: "flex-start",
          textTransform: "none",
          borderRadius: "10px",
          padding: "12px 24px",
          fontWeight: 700,
          fontSize: "14px",
          background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
          color: "#FFFFFF",
          boxShadow: "0 4px 12px rgba(255, 152, 0, 0.25)",
          "&:hover": {
            background: "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
            boxShadow: "0 6px 16px rgba(255, 152, 0, 0.35)",
            transform: "translateY(-1px)",
          },
          transition: "all 0.3s ease",
        }}
        disableElevation
      >
        {type === "FIB" ? "Add Blank" : "Add Option"}
      </Button>
    </Stack>
  );
}
