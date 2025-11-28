"use client";
import QuestionCard from "@/src/components/QuestionCard/QuestionCard";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";
import FilterSideNav from "@/src/components/FilterSideNav/FilterSideNav";

import QuestionsHeader from "./Components/QuestionsHeader";
import QuestionCardSkeleton from "@/src/components/QuestionCardSkeleton/QuestionCardSkeleton";
import { apiFetch } from "@/src/lib/apiFetch";
import {
  Add,
  Close,
  Delete,
  ExpandMore,
  FilterAlt,
  Visibility,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";
import {
  Button,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  Typography,
  Box,
  TablePagination,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import PreviewStepper from "./addQuestion/Components/PreviewStepper";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import MDPreview from "@/src/components/MarkdownPreview/MarkdownPreview";
import SearchQuestions from "./Components/SearchQuestion";
import BulkImport from "./addQuestion/Components/BulkImport";
import CreateQuestionDialog from "./Components/CreateQuestionDialog";

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

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    difficultyCounts: { 1: 0, 2: 0, 3: 0 },
    typeCounts: { MCQ: 0, MSQ: 0, FIB: 0 },
    recentCount: 0,
  });

  // Pagination state
  const [page, setPage] = useState(0); // 0-indexed for TablePagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const lastKeys = useRef({ 0: null }); // Key for page 0 is null
  const [hasNextPage, setHasNextPage] = useState(false);

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

  const createDialogOpen = () => setIsCreateDialogOpen(true);
  const createDialogClose = () => setIsCreateDialogOpen(false);

  const toggleDrawer = (open) => () => setIsOpen(open);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/questions/stats`
      );
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      if (searchQuery) {
        // Use Global Search API
        const url = `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/api/questions/search?q=${encodeURIComponent(searchQuery)}`;
        const data = await apiFetch(url);
        if (data.success) {
          setQuestionList(data.data);
          setHasNextPage(false); // Search returns all results, no pagination for now
        } else {
          setQuestionList([]);
        }
      } else {
        // Use Standard Filter API
        const currentKey = lastKeys.current[page];

        // build query string
        const parts = [];
        Object.entries(filters).forEach(([key, val]) => {
          if (val !== "" && val != null)
            parts.push(`${key}=${encodeURIComponent(val)}`);
        });

        parts.push(`limit=${rowsPerPage}`);
        if (currentKey) {
          parts.push(`lastKey=${currentKey}`);
        }

        const query = parts.length ? `?${parts.join("&")}` : "";
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/questions/get${query}`;
        const data = await apiFetch(url);

        if (data.success) {
          setQuestionList(data.data);
          if (data.lastKey) {
            lastKeys.current[page + 1] = data.lastKey;
            setHasNextPage(true);
          } else {
            setHasNextPage(false);
          }
        } else {
          setQuestionList([]);
        }
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestionList([]);
    }
    setIsLoading(false);
  }, [filters, searchQuery, page, rowsPerPage]);

  // Reset pagination when filters or search change
  useEffect(() => {
    setPage(0);
    lastKeys.current = { 0: null };
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSearch = (q) => setSearchQuery(q);

  const handlePageChange = (event, newPage) => {
    // Prevent jumping to pages we don't have keys for
    if (newPage > page && !hasNextPage) return;
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    lastKeys.current = { 0: null };
  };

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
      if (res.success) {
        setQuestionList((prev) => prev.filter((q) => q.id !== id));
        fetchStats();
      } else console.error("Deletion failed", res.error);
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

    const localSubjects = localStorage.getItem("subjects");

    if (localSubjects) {
      setSubjects(JSON.parse(localSubjects));
    } else {
      fetchSubjects();
    }
  }, []);

  const handleCreateSuccess = () => {
    createDialogClose();
    // Refresh list
    setPage(0);
    lastKeys.current = { 0: null };
    fetchQuestions();
    fetchStats();
  };

  return (
    <Stack padding="20px" gap="20px">
      <QuestionsHeader
        stats={stats}
        actions={
          <>
            <Button
              key="Import"
              variant="outlined"
              endIcon={<ExpandMore />}
              sx={{
                textTransform: "none",
                borderRadius: "8px",
                borderColor: "var(--border-color)",
                color: "var(--text2)",
                backgroundColor: "white",
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}
              onClick={importDialogOpen}
              disableElevation
            >
              Import
            </Button>
            <Button
              key="Add"
              variant="contained"
              startIcon={<Add />}
              onClick={createDialogOpen}
              sx={{
                backgroundColor: "var(--primary-color)",
                textTransform: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
              }}
              disableElevation
            >
              Add Question
            </Button>
          </>
        }
      />

      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        gap="16px"
        alignItems="center"
      >
        <Box sx={{ width: { xs: "100%", md: "400px" } }}>
          <SearchQuestions onSearch={handleSearch} />
        </Box>
        <Button
          variant="outlined"
          startIcon={<FilterAlt />}
          onClick={toggleDrawer(true)}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            borderColor: "var(--border-color)",
            color: "var(--text2)",
            backgroundColor: "white",
            height: "44px",
            minWidth: "100px",
          }}
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
          backgroundColor: "var(--white)",
          border: "1px solid",
          borderColor: "var(--border-color)",
          borderRadius: "10px",
          padding: "20px",
          gap: "20px",
          minHeight: "80vh",
        }}
      >
        {!isLoading ? (
          questionList.length > 0 ? (
            <>
              <Stack gap="15px">
                {questionList.map((item, index) => (
                  <QuestionCard
                    key={index}
                    questionNumber={`Q${page * rowsPerPage + index + 1}`}
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
                        icon={<Visibility sx={{ fontSize: "16px" }} />}
                        label="Preview"
                        onClick={() => previewDialogOpen(item)}
                        sx={{
                          fontSize: "12px",
                          fontFamily: "Lato",
                          fontWeight: "600",
                          height: "28px",
                          backgroundColor: "rgba(102, 126, 234, 0.1)",
                          color: "var(--primary-color)",
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "rgba(102, 126, 234, 0.2)",
                          },
                        }}
                      />
                    }
                    options={[
                      <MenuItem
                        key={index}
                        sx={{
                          fontFamily: "Lato",
                          fontSize: "14px",
                          padding: "8px 16px",
                          color: "var(--delete-color)",
                          gap: "8px",
                        }}
                        onClick={() =>
                          dialogDeleteOpen(item.id, item.subjectID)
                        }
                      >
                        <Delete sx={{ fontSize: "18px" }} />
                        Delete
                      </MenuItem>,
                    ]}
                  />
                ))}
              </Stack>

              {/* Pagination Controls */}
              {!searchQuery && (
                <Stack
                  flexDirection="row"
                  justifyContent="center"
                  alignItems="center"
                  gap="10px"
                  sx={{
                    width: "100%",
                    marginTop: "auto",
                    borderTop: "1px solid var(--border-color)",
                    paddingTop: "20px",
                  }}
                >
                  <TablePagination
                    component="div"
                    count={stats.totalQuestions}
                    page={page}
                    onPageChange={handlePageChange}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                  />
                </Stack>
              )}
            </>
          ) : (
            <Stack
              width="100%"
              minHeight="60vh"
              justifyContent="center"
              alignItems="center"
            >
              <NoDataFound info="No Questions Found" />
            </Stack>
          )
        ) : (
          <Stack gap={2}>
            {[1, 2, 3].map((i) => (
              <QuestionCardSkeleton key={i} />
            ))}
          </Stack>
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
                borderRadius: "8px",
                width: "120px",
              }}
              disableElevation
            >
              Delete
            </Button>
            <Button
              variant="outlined"
              onClick={dialogDeleteClose}
              sx={{
                textTransform: "none",
                color: "var(--text2)",
                borderColor: "var(--border-color)",
                borderRadius: "8px",
                width: "120px",
              }}
              disableElevation
            >
              Cancel
            </Button>
          </Stack>
        }
      />

      <DialogBox
        title="Preview Question"
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
        <Stack padding="16px">
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

      <CreateQuestionDialog
        open={isCreateDialogOpen}
        onClose={createDialogClose}
        onSuccess={handleCreateSuccess}
      />
    </Stack>
  );
}
