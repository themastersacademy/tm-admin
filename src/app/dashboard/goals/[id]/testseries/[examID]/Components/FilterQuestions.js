"use client";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import SubjectContext from "@/src/app/context/SubjectContext";
import SearchBox from "@/src/components/SearchBox/SearchBox";
import StyledSelect from "@/src/components/StyledSelect/StyledSelect";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { apiFetch } from "@/src/lib/apiFetch";
import { Button, Stack, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";

export default function FilterQuestions({
  handleAddQuestions,
  selectedQuestions,
  onFilteredQuestions,
  setSelectedQuestions,
}) {
  const { showSnackbar } = useSnackbar();
  const { subjectList, fetchSubject } = useContext(SubjectContext);

  useEffect(() => {
    // Only fetch if subjectList is empty - SubjectContext handles caching
    if (subjectList.length === 0) {
      fetchSubject();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount
  const [filters, setFilters] = useState({
    subjectID: "all",
    type: "all",
    difficulty: "all",
    isRandom: false,
    eachSelect: "Select all",
    search: "",
    randomCount: "",
  });
  const selectFields = [
    {
      name: "languageSelect",
      label: "Subject",
      options: [
        { label: "All", value: "all" },
        ...subjectList.map((subject) => ({
          label: subject.title,
          value: subject.subjectID,
        })),
      ],
    },
    {
      name: "qTypeSelect",
      label: "Question Type",
      options: [
        { label: "All", value: "all" },
        { label: "MCQ", value: "MCQ" },
        { label: "FIB", value: "FIB" },
        { label: "MSQ", value: "MSQ" },
      ],
    },
    {
      name: "difficultySelect",
      label: "Difficulty",
      options: [
        { label: "All", value: "all" },
        { label: "Easy", value: "1" },
        { label: "Medium", value: 2 },
        { label: "Hard", value: 3 },
      ],
    },
    {
      name: "eachSelect",
      label: "Each",
      options: [
        { label: "Select all", value: "Select all" },
        { label: "Random", value: "Random" },
      ],
    },
  ];

  const handleApplyFilters = async () => {
    const queryParams = new URLSearchParams();

    if (filters.subjectID !== "all")
      queryParams.append("subjectID", filters.subjectID);
    if (filters.type !== "all") queryParams.append("type", filters.type);
    if (filters.difficulty !== "all")
      queryParams.append("difficulty", filters.difficulty);
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.isRandom) {
      queryParams.append("isRandom", true);
      if (filters.randomCount) {
        queryParams.append("count", filters.randomCount);
      }
    }

    const query = queryParams.toString();

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/questions/get?${query}`
      );
      if (response.success) {
        let questions = response.data || [];

        // Random selection logic
        if (filters.isRandom && filters.randomCount) {
          const count = parseInt(filters.randomCount);
          if (!isNaN(count) && count > 0) {
            questions = questions
              .sort(() => 0.5 - Math.random())
              .slice(0, count);
            setSelectedQuestions(questions);
          }
        } else if (filters.eachSelect === "Select all") {
          setSelectedQuestions((prev) => {
            const existingIDs = new Set(prev.map((q) => q.questionID));
            const newOnes = questions.filter(
              (q) => !existingIDs.has(q.questionID)
            );
            return [...prev, ...newOnes];
          });
        }

        onFilteredQuestions(questions);
      } else {
        showSnackbar(
          response.message || "Failed to fetch questions",
          "error",
          "",
          "3000"
        );
      }
    } catch (err) {
      showSnackbar("Something went wrong", "error", "", "3000");
    }
  };

  return (
    <Stack gap="16px">
      {/* Compact Filter Controls Section */}
      <Stack
        sx={{
          background:
            "linear-gradient(135deg, rgba(255, 152, 0, 0.06) 0%, rgba(245, 124, 0, 0.02) 100%)",
          borderRadius: "10px",
          border: "1px solid rgba(255, 152, 0, 0.12)",
          padding: "12px 16px",
        }}
      >
        {/* Single Row with All Controls */}
        <Stack
          flexDirection="row"
          gap="10px"
          alignItems="center"
          flexWrap="wrap"
        >
          {/* Compact Filter Dropdowns */}
          {selectFields.map(({ name, label, options }) => {
            let value = "";
            if (name === "languageSelect") value = filters.subjectID;
            else if (name === "qTypeSelect") value = filters.type;
            else if (name === "difficultySelect") value = filters.difficulty;
            else if (name === "eachSelect") value = filters.eachSelect;
            return (
              <Stack key={name} sx={{ minWidth: "140px", flex: "0 1 auto" }}>
                <StyledSelect
                  title={label}
                  options={options}
                  value={value}
                  getLabel={(option) => option.label}
                  getValue={(option) => option.value}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (name === "languageSelect") {
                      setFilters((prev) => ({ ...prev, subjectID: value }));
                    } else if (name === "qTypeSelect") {
                      setFilters((prev) => ({ ...prev, type: value }));
                    } else if (name === "difficultySelect") {
                      setFilters((prev) => ({ ...prev, difficulty: value }));
                    } else if (name === "eachSelect") {
                      setFilters((prev) => ({
                        ...prev,
                        isRandom: value === "Random",
                        eachSelect: value,
                      }));
                    }
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "36px",
                      fontSize: "13px",
                    },
                  }}
                />
              </Stack>
            );
          })}

          {/* Search Box */}
          <Stack sx={{ minWidth: "200px", flex: "1 1 auto" }}>
            <SearchBox
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "36px",
                },
              }}
            />
          </Stack>

          {/* Random Count or Selected Display */}
          {filters.isRandom ? (
            <StyledTextField
              type="number"
              placeholder="Count"
              value={filters.randomCount}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  randomCount: e.target.value,
                }))
              }
              sx={{
                width: "100px",
                "& .MuiOutlinedInput-root": {
                  height: "36px",
                  fontSize: "13px",
                },
              }}
            />
          ) : (
            <Stack
              flexDirection="row"
              gap="8px"
              alignItems="center"
              sx={{
                border: "1px solid rgba(255, 152, 0, 0.25)",
                backgroundColor: "rgba(255, 152, 0, 0.08)",
                minWidth: "100px",
                borderRadius: "6px",
                padding: "0px 12px",
                height: "36px",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  color: "#FF9800",
                  fontSize: "12px",
                }}
              >
                Selected:
              </Typography>
              <Stack
                sx={{
                  backgroundColor: "#FF9800",
                  color: "#fff",
                  borderRadius: "10px",
                  padding: "2px 8px",
                  fontSize: "11px",
                  fontWeight: 700,
                  minWidth: "24px",
                  textAlign: "center",
                }}
              >
                {selectedQuestions.length}
              </Stack>
            </Stack>
          )}

          {/* Action Buttons */}
          <Stack flexDirection="row" gap="8px" ml="auto">
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              sx={{
                background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
                color: "#FFFFFF",
                textTransform: "none",
                borderRadius: "6px",
                padding: "8px 20px",
                fontWeight: 600,
                fontSize: "13px",
                height: "36px",
                boxShadow: "0 2px 8px rgba(255, 152, 0, 0.2)",
                minWidth: "100px",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
                  boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
                },
                transition: "all 0.2s ease",
              }}
              disableElevation
            >
              Apply
            </Button>
            <Button
              variant="contained"
              onClick={handleAddQuestions}
              disabled={selectedQuestions.length === 0}
              sx={{
                background:
                  selectedQuestions.length === 0
                    ? "var(--border-color)"
                    : "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
                color:
                  selectedQuestions.length === 0 ? "var(--text3)" : "#FFFFFF",
                textTransform: "none",
                borderRadius: "6px",
                padding: "8px 20px",
                fontWeight: 600,
                fontSize: "13px",
                height: "36px",
                boxShadow:
                  selectedQuestions.length === 0
                    ? "none"
                    : "0 2px 8px rgba(76, 175, 80, 0.2)",
                minWidth: "120px",
                "&:hover": {
                  background:
                    selectedQuestions.length === 0
                      ? "var(--border-color)"
                      : "linear-gradient(135deg, #388E3C 0%, #2E7D32 100%)",
                  boxShadow:
                    selectedQuestions.length === 0
                      ? "none"
                      : "0 4px 12px rgba(76, 175, 80, 0.3)",
                },
                transition: "all 0.2s ease",
                "&.Mui-disabled": {
                  background: "var(--border-color)",
                  color: "var(--text3)",
                },
              }}
              disableElevation
            >
              Add Questions
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
