"use client";
import SubjectContext from "@/src/app/context/SubjectContext";
import { Edit, Delete } from "@mui/icons-material";
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
  Tooltip,
} from "@mui/material";
import React, { useContext } from "react";

export default function QuestionCard({
  questionNumber,
  questionType,
  difficulty,
  question,
  preview,
  check,
  onEdit,
  onDelete,
  subjectID,
  isLive,
}) {
  const { subjectList } = useContext(SubjectContext);

  const subjectTitle = React.useMemo(() => {
    const subject = subjectList.find(
      (subject) => subject.subjectID === subjectID,
    );
    return subject ? subject.title : "Unknown";
  }, [subjectList, subjectID]);

  return (
    <Stack sx={{ width: "100%" }}>
        <Stack
          flexDirection="row"
          alignItems="center"
          sx={{
            padding: "10px 14px",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            width: "100%",
            gap: "10px",
            backgroundColor: "var(--white)",
            transition: "all 0.15s ease-in-out",
            "&:hover": {
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
              borderColor: "var(--primary-color)",
            },
          }}
        >
          {check}
          <Stack width="100%" gap="6px">
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack flexDirection="row" alignItems="center" gap="8px">
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "var(--primary-color)",
                    backgroundColor: "rgba(24, 113, 99, 0.08)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    minWidth: "28px",
                    textAlign: "center",
                  }}
                >
                  {questionNumber}
                </Typography>
                <Stack direction="row" gap="4px">
                  <Chip
                    label={questionType}
                    size="small"
                    sx={{
                      fontSize: "10px",
                      fontWeight: "600",
                      backgroundColor: "rgba(24, 113, 99, 0.08)",
                      color: "var(--primary-color)",
                      borderRadius: "4px",
                      height: "20px",
                    }}
                  />
                  <Chip
                    label={subjectTitle}
                    size="small"
                    sx={{
                      fontSize: "10px",
                      fontWeight: "600",
                      backgroundColor: "rgba(245, 0, 87, 0.08)",
                      color: "#f50057",
                      borderRadius: "4px",
                      height: "20px",
                    }}
                  />
                  <Chip
                    label={
                      difficulty === 1
                        ? "Easy"
                        : difficulty === 2
                          ? "Medium"
                          : difficulty === 3
                            ? "Hard"
                            : "Unknown"
                    }
                    size="small"
                    sx={{
                      fontSize: "10px",
                      fontWeight: "600",
                      borderRadius: "4px",
                      height: "20px",
                      backgroundColor:
                        difficulty === 1
                          ? "rgba(76, 175, 80, 0.08)"
                          : difficulty === 2
                            ? "rgba(255, 152, 0, 0.08)"
                            : difficulty === 3
                              ? "rgba(244, 67, 54, 0.08)"
                              : "rgba(0, 0, 0, 0.06)",
                      color:
                        difficulty === 1
                          ? "#4caf50"
                          : difficulty === 2
                            ? "#ff9800"
                            : difficulty === 3
                              ? "#f44336"
                              : "var(--text2)",
                    }}
                  />
                </Stack>
              </Stack>
            </Stack>
            <Box
              sx={{ "& p": { margin: 0, fontSize: "14px", lineHeight: 1.5 } }}
            >
              {question}
            </Box>
          </Stack>
          <Stack
            gap="4px"
            flexDirection="row"
            marginLeft="auto"
            alignItems="center"
            flexShrink={0}
          >
            {preview}
            {onEdit && (
              <Tooltip title="Edit" arrow>
                <IconButton
                  size="small"
                  onClick={onEdit}
                  sx={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-color)",
                    "&:hover": {
                      backgroundColor: "rgba(24, 113, 99, 0.08)",
                      borderColor: "var(--primary-color)",
                    },
                  }}
                >
                  <Edit sx={{ fontSize: "15px", color: "var(--text2)" }} />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="Delete" arrow>
                <IconButton
                  size="small"
                  onClick={onDelete}
                  sx={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-color)",
                    "&:hover": {
                      backgroundColor: "rgba(244, 67, 54, 0.08)",
                      borderColor: "#f44336",
                    },
                  }}
                >
                  <Delete sx={{ fontSize: "15px", color: "var(--text2)" }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
    </Stack>
  );
}
