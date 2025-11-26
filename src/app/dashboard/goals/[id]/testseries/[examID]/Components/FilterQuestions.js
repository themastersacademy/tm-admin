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
    <Stack gap="15px">
      <Stack flexDirection="row" gap="10px">
        {selectFields.map(({ name, label, options }) => {
          let value = "";
          if (name === "languageSelect") value = filters.subjectID;
          else if (name === "qTypeSelect") value = filters.type;
          else if (name === "difficultySelect") value = filters.difficulty;
          else if (name === "eachSelect") value = filters.eachSelect;
          return (
            <StyledSelect
              key={name}
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
            />
          );
        })}
        {filters.isRandom ? (
          <StyledTextField
            type="number"
            placeholder="number of questions"
            value={filters.randomCount}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, randomCount: e.target.value }))
            }
          />
        ) : (
          <Stack
            flexDirection="row"
            gap="10px"
            alignItems="center"
            sx={{
              border: "1px solid var(--border-color)",
              width: "200px",
              borderRadius: "4px",
              padding: "0px 10px",
            }}
          >
            <Typography sx={{ fontWeight: "500", color: "var(--sec-color)" }}>
              Selected
            </Typography>
            <Typography sx={{ color: "var(--text4)" }}>
              {selectedQuestions.length}
            </Typography>
          </Stack>
        )}

        <Button
          variant="contained"
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
          }}
          disableElevation
          onClick={handleApplyFilters}
        >
          Apply
        </Button>
      </Stack>
      <Stack flexDirection="row" gap="15px">
        <SearchBox
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, search: e.target.value }))
          }
        />
        <Button
          variant="contained"
          onClick={handleAddQuestions}
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
            width: "100px",
          }}
          disableElevation
        >
          Add
        </Button>
      </Stack>
    </Stack>
  );
}
