"use client";
import SubjectContext from "@/src/app/context/SubjectContext";
import { MoreVert } from "@mui/icons-material";
import {
  Checkbox,
  Chip,
  IconButton,
  Menu,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";

export default function QuestionCard({
  questionNumber,
  questionType,
  difficulty,
  question,
  preview,
  check,
  options = [],
  isSelected,
  onSelect,
  subjectID,
  isLive,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { subjectList, fetchSubject } = useContext(SubjectContext);

  useEffect(() => {
    fetchSubject();
  }, [fetchSubject]);

  const subjectTitle = React.useMemo(() => {
    const subject = subjectList.find(
      (subject) => subject.subjectID === subjectID
    );
    return subject ? subject.title : "Unknown";
  }, [subjectList, subjectID]);

  const menuOpen = (event) => {
    setIsMenuOpen(event.currentTarget);
  };
  const menuClose = () => {
    setIsMenuOpen(null);
  };

  return (
    <Stack sx={{ width: "100%" }}>
      <Stack>
        <Stack
          flexDirection="row"
          alignItems="center"
          sx={{
            padding: "20px",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            minHeight: "100px",
            width: "100%",
            gap: "16px",
            backgroundColor: "var(--white)",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              borderColor: "var(--primary-color)",
              transform: "translateY(-2px)",
            },
          }}
        >
          {check}
          <Stack width="100%" gap="12px">
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack flexDirection="row" alignItems="center" gap="12px">
                <Box
                  sx={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "var(--primary-color)",
                    }}
                  >
                    {questionNumber.replace("Q", "")}
                  </Typography>
                </Box>
                <Stack direction="row" gap="8px">
                  <Chip
                    label={questionType}
                    size="small"
                    sx={{
                      fontSize: "11px",
                      fontWeight: "600",
                      backgroundColor: "rgba(102, 126, 234, 0.08)",
                      color: "var(--primary-color)",
                      borderRadius: "6px",
                      height: "24px",
                    }}
                  />
                  <Chip
                    label={subjectTitle}
                    size="small"
                    sx={{
                      fontSize: "11px",
                      fontWeight: "600",
                      backgroundColor: "rgba(245, 0, 87, 0.08)",
                      color: "#f50057",
                      borderRadius: "6px",
                      height: "24px",
                    }}
                  />
                  <Chip
                    label={
                      difficulty === 1
                        ? "Easy"
                        : difficulty === 2
                        ? "Medium"
                        : "Hard"
                    }
                    size="small"
                    sx={{
                      fontSize: "11px",
                      fontWeight: "600",
                      borderRadius: "6px",
                      height: "24px",
                      backgroundColor:
                        difficulty === 1
                          ? "rgba(76, 175, 80, 0.08)"
                          : difficulty === 2
                          ? "rgba(255, 152, 0, 0.08)"
                          : "rgba(244, 67, 54, 0.08)",
                      color:
                        difficulty === 1
                          ? "#4caf50"
                          : difficulty === 2
                          ? "#ff9800"
                          : "#f44336",
                    }}
                  />
                </Stack>
              </Stack>
            </Stack>
            <Box
              sx={{ "& p": { margin: 0, fontSize: "15px", lineHeight: 1.6 } }}
            >
              {question}
            </Box>
          </Stack>
          <Stack
            gap="10px"
            flexDirection="row"
            marginLeft="auto"
            alignItems="center"
          >
            {preview}
            {options.length > 0 && (
              <IconButton
                sx={{ padding: "0px" }}
                onClick={menuOpen}
                disableRipple
              >
                <MoreVert sx={{ color: "var(--text3)" }} />
              </IconButton>
            )}
            <Menu
              anchorEl={isMenuOpen}
              open={Boolean(isMenuOpen)}
              onClose={menuClose}
              disableScrollLock={true}
              sx={{ "& .MuiList-root": { padding: "3px" } }}
              slotProps={{
                paper: {
                  style: {
                    border: "1px solid",
                    borderColor: "var(--border-color)",
                    borderRadius: "8px",
                    padding: "0px",
                  },
                },
              }}
              elevation={0}
            >
              {options.map((option, index) => (
                <Stack key={index} onClick={menuClose}>
                  {option}
                </Stack>
              ))}
            </Menu>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
