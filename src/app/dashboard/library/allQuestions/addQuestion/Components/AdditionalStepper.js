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
    <Stack spacing={2} width="100%">
      {(type === "FIB" ? blanks : options).map((item, idx) => (
        <Stack
          key={idx}
          spacing={1}
          p={2}
          border="1px solid var(--border-color)"
          borderRadius="8px"
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography>
              {type === "FIB" ? `Blank ${idx + 1}` : `Option ${idx + 1}`}
            </Typography>

            {type !== "FIB" && (
              <Checkbox
                checked={answerKey.includes(idx)}
                onChange={() => handleToggle(idx)}
                sx={{
                  color: "var(--sec-color)",
                  padding: "0px",
                  "&.Mui-checked": { color: "var(--sec-color)" },
                }}
              />
            )}

            {type !== "FIB" && <Typography>Weight</Typography>}

            {type !== "FIB" && (
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
                sx={{ width: 60 }}
              />
            )}
            <Typography>Weightage</Typography>
            {type === "FIB" && (
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
                sx={{ width: 60 }}
              />
            )}

            <IconButton
              onClick={() => handleRemove(idx)}
              sx={{ marginLeft: "auto" }}
            >
              <DeleteForever sx={{ color: "var(--sec-color)" }} />
            </IconButton>
          </Stack>

          {type === "FIB" ? (
            <StyledTextField
              fullWidth
              placeholder="Enter correct answer"
              value={blanks[idx]?.correctAnswers[0] || ""}
              onChange={(e) => handleTextChange(e.target.value, idx)}
            />
          ) : (
            <MarkdownEditor
              value={options[idx]?.text || ""}
              onChange={(value) => handleTextChange(value, idx)}
              placeholder="Option text"
            />
          )}
        </Stack>
      ))}

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={handleAdd}
        sx={{
          alignSelf: "center",
          textTransform: "none",
          backgroundColor: "var(--sec-color)",
        }}
      >
        {type === "FIB" ? "Add Blank" : "Add Option"}
      </Button>
    </Stack>
  );
}
