"use client";
import QuestionCard from "@/src/components/QuestionCard/QuestionCard";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";
import FilterSideNav from "@/src/components/FilterSideNav/FilterSideNav";
import Header from "@/src/components/Header/Header";
import QuestionCardSkeleton from "@/src/components/QuestionCardSkeleton/QuestionCardSkeleton";
import { apiFetch } from "@/src/lib/apiFetch";
import {
  Add,
  Close,
  Delete,
  ExpandMore,
  FilterAlt,
  Visibility,
} from "@mui/icons-material";
import { Button, Chip, IconButton, MenuItem, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import PreviewStepper from "./addQuestion/Components/PreviewStepper";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import MDPreview from "@/src/components/MarkdownPreview/MarkdownPreview";
import SearchQuestions from "./Components/SearchQuestion";
import BulkImport from "./addQuestion/Components/BulkImport";

export default function AllQuestions() {
  const router = useRouter();
  const [questionList, setQuestionList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogDelete, setIsDialogDelete] = useState(false);
  const [isPreviewDialog, setIsPreviewDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [isImportDialog, setIsImportDialog] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    difficulty: "",
    subjectID: "",
  });

  const filtersConfig = [
    {
      name: "difficulty",
      label: "Difficulty",
      options: [
        { label: "All", value: "" },
        { label: "Easy", value: 1 },
        { label: "Medium", value: 2 },
        { label: "Hard", value: 3 },
      ],
    },
    {
      name: "type",
      label: "Type",
      options: [
        { label: "All", value: "" },
        { label: "MCQ", value: "MCQ" },
        { label: "MSQ", value: "MSQ" },
        { label: "FIB", value: "FIB" },
      ],
    },
    {
      name: "subjectID",
      label: "Subject",
      options: [
        { label: "All", value: "" },
        ...subjects.map((subject) => ({
          label: subject.title,
          value: subject.subjectID,
        })),
      ],
    },
  ];

  const dialogDeleteOpen = (id, subjectID) => {
    setSelectedQuestion({ id, subjectID });
    setIsDialogDelete(true);
  };
  const dialogDeleteClose = () => setIsDialogDelete(false);

  const previewDialogOpen = (question) => {
    setSelectedQuestion(question);
    setIsPreviewDialog(true);
  };
  const previewDialogClose = () => setIsPreviewDialog(false);

  const importDialogOpen = () => setIsImportDialog(true);
  const importDialogClose = () => setIsImportDialog(false);

  const toggleDrawer = (open) => () => setIsOpen(open);

  // build query string
  const buildQuery = () => {
    const parts = [];
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== "" && val != null)
        parts.push(`${key}=${encodeURIComponent(val)}`);
    });
    if (searchQuery) parts.push(`search=${encodeURIComponent(searchQuery)}`);
    return parts.length ? `?${parts.join("&")}` : "";
  };

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = buildQuery();
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/questions/get${query}`;
      const data = await apiFetch(url);
      setQuestionList(data.success ? data.data : []);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestionList([]);
    }
    setIsLoading(false);
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSearch = (q) => setSearchQuery(q);

  const handleDelete = async (id, subjectID) => {
    try {
      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/questions/delete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionID: id, subjectID }),
        }
      );
      if (res.success)
        setQuestionList((prev) => prev.filter((q) => q.id !== id));
      else console.error("Deletion failed", res.error);
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const res = await apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/subjects/get-all-subjects`
        );
        if (res.success) {
          const subjectsList = res.data.subjects;
          localStorage.setItem("subjects", JSON.stringify(subjectsList));
          setSubjects(subjectsList);
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      }
    }

    const localSubjects = localStorage.getItem("subjectsCa");

    if (localSubjects) {
      // If already in localStorage, use it
      setSubjects(JSON.parse(localSubjects));
    } else {
      // If not, fetch from server
      fetchSubjects();
    }
  }, []);

  return (
    <Stack padding="20px" gap="20px" minHeight="100vh">
      <Header
        title="Questions"
        button={[
          <Button
            key="Import"
            variant="contained"
            endIcon={<ExpandMore />}
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
            }}
            onClick={importDialogOpen}
            disableElevation
          >
            Import
          </Button>,
          <Button
            key="Add"
            variant="contained"
            startIcon={<Add />}
            onClick={() =>
              router.push(`/dashboard/library/allQuestions/addQuestion`)
            }
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
            }}
            disableElevation
          >
            Questions
          </Button>,
        ]}
      />

      <Stack flexDirection="row" justifyContent="space-between" gap="20px">
        <SearchQuestions onSearch={handleSearch} />
        <Button
          variant="contained"
          endIcon={<FilterAlt />}
          onClick={toggleDrawer(true)}
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
            borderRadius: "4px",
          }}
          disableElevation
        >
          Filters
        </Button>
        <FilterSideNav
          isOpen={isOpen}
          toggleDrawer={toggleDrawer}
          filtersConfig={filtersConfig}
          setFilters={setFilters}
          filters={filters}
        />
      </Stack>
      <Stack
        sx={{
          border: "1px solid var(--border-color)",
          backgroundColor: "var(--white)",
          borderRadius: "10px",
          padding: "20px",
          minHeight: "80vh",
          gap: "15px",
        }}
      >
        {!isLoading ? (
          questionList.length > 0 ? (
            questionList.map((item, index) => (
              <QuestionCard
                key={index}
                questionNumber={`Q${index + 1}`}
                questionType={item.type || "MCQ"}
                Subject={
                  subjects.find(
                    (subject) => subject.subjectID === item.subjectID
                  )?.title || "Unknown"
                }
                subjectID={item.subjectID}
                question={<MDPreview value={item.title} />}
                difficulty={item.difficultyLevel}
                preview={
                  <Chip
                    icon={<Visibility sx={{ fontSize: "small" }} />}
                    label="Preview"
                    onClick={() => previewDialogOpen(item)}
                    sx={{
                      fontSize: "10px",
                      fontFamily: "Lato",
                      fontWeight: "700",
                      height: "20px",
                      backgroundColor: "var(--border-color)",
                      color: "var(--text3)",
                    }}
                  />
                }
                options={[
                  <MenuItem
                    key={index}
                    sx={{
                      fontFamily: "Lato",
                      fontSize: "12px",
                      padding: "5px",
                      color: "var(--delete-color)",
                    }}
                    onClick={() => dialogDeleteOpen(item.id, item.subjectID)}
                  >
                    <Delete
                      sx={{ color: "var(--delete-color)", fontSize: "16px" }}
                    />{" "}
                    Delete
                  </MenuItem>,
                ]}
              />
            ))
          ) : (
            <Stack width="100%" minHeight="60vh">
              <NoDataFound info="No Question Created yet" />
            </Stack>
          )
        ) : (
          <QuestionCardSkeleton />
        )}
      </Stack>
      <DeleteDialogBox
        isOpen={isDialogDelete}
        onClose={dialogDeleteClose}
        actionButton={
          <Stack
            flexDirection="row"
            justifyContent="center"
            gap="20px"
            width="100%"
          >
            <Button
              variant="contained"
              onClick={() => {
                handleDelete(selectedQuestion.id, selectedQuestion.subjectID);
                dialogDeleteClose();
              }}
              sx={{
                textTransform: "none",
                backgroundColor: "var(--delete-color)",
                borderRadius: "5px",
                width: "130px",
              }}
              disableElevation
            >
              Delete
            </Button>
            <Button
              variant="contained"
              onClick={dialogDeleteClose}
              sx={{
                textTransform: "none",
                backgroundColor: "white",
                color: "var(--text2)",
                border: "1px solid var(--border-color)",
                width: "130px",
              }}
              disableElevation
            >
              Cancel
            </Button>
          </Stack>
        }
      />
      <DialogBox
        title="Preview"
        isOpen={isPreviewDialog}
        icon={
          <IconButton
            sx={{ padding: "4px", marginLeft: "auto", borderRadius: "8px" }}
            onClick={previewDialogClose}
          >
            <Close sx={{ color: "var(--text2)" }} />
          </IconButton>
        }
      >
        <Stack padding="10px">
          {selectedQuestion && (
            <PreviewStepper
              questionData={selectedQuestion}
              subjectTitle={
                subjects.find(
                  (subject) => subject.subjectID === selectedQuestion.subjectID
                )?.title || "Unknown"
              }
            />
          )}
        </Stack>
      </DialogBox>
      <BulkImport
        subjectTitle={subjects}
        isOpen={isImportDialog}
        close={importDialogClose}
      />
    </Stack>
  );
}
