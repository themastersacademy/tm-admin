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
  isLive
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
            padding: "15px",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            minHeight: "100px",
            width: "100%",
            gap: "15px",
            backgroundColor: "var(--white)",
          }}
        >
          {/* {check && (
            <Checkbox
              checked={Boolean(isSelected)}
              onChange={onSelect}
              sx={{
                color: "var(--sec-color)",
                "&.Mui-checked": { color: "var(--sec-color)" },
                "&.MuiCheckbox-root": {
                  padding: "0px",
                },
              }}
            />
          )} */}
          {check} 
          <Stack width="100%" gap="8px">
            <Stack flexDirection="row" justifyContent="space-between">
              <Stack flexDirection="row" alignItems="center" gap="10px">
                <Typography>{questionNumber}</Typography>
                <Chip
                  label={questionType}
                  sx={{
                    fontSize: "12px",
                    fontFamily: "Lato",
                    fontWeight: "700",
                    width: "70px",
                    height: "22px",
                    backgroundColor: "var(--sec-color-acc-1)",
                    color: "var(--sec-color)",
                    borderRadius: "4px",
                  }}
                />
                <Chip
                  label={subjectTitle}
                  sx={{
                    fontSize: "12px",
                    fontFamily: "Lato",
                    fontWeight: "700",
                    height: "22px",
                    backgroundColor: "var(--primary-color-acc-2)",
                    color: "var(--primary-color)",
                    borderRadius: "4px",
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
                  sx={{
                    fontSize: "12px",
                    fontFamily: "Lato",
                    fontWeight: "700",
                    height: "22px",
                    textTransform: "capitalize",
                    backgroundColor:
                      difficulty === 1
                        ? "var(--primary-color-acc-2)"
                        : difficulty === 2
                        ? "var(--sec-color-acc-1)"
                        : difficulty === 3
                        ? "#D6454555"
                        : "var(--primary-color-acc-2)",
                    color:
                      difficulty === 1
                        ? "var(--primary-color)"
                        : difficulty === 2
                        ? "var(--sec-color)"
                        : difficulty === 3
                        ? "var(--delete-color)"
                        : "var(--primary-color)",
                    borderRadius: "4px",
                  }}
                />
              </Stack>
            </Stack>
            {question}
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
