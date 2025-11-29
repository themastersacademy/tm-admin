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
  Edit,
} from "@mui/icons-material";
import {
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
  Box,
  TablePagination,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef, useContext } from "react";
import SubjectContext from "@/src/app/context/SubjectContext";
import PreviewStepper from "./addQuestion/Components/PreviewStepper";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import MDPreview from "@/src/components/MarkdownPreview/MarkdownPreview";
import SearchQuestions from "./Components/SearchQuestion";
import BulkImport from "./addQuestion/Components/BulkImport";
import CreateQuestionDialog from "./Components/CreateQuestionDialog";

export default function AllQuestions() {
  const router = useRouter();
  const { subjectList, fetchSubject } = useContext(SubjectContext);
  const [questionList, setQuestionList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogDelete, setIsDialogDelete] = useState(false);
  const [isPreviewDialog, setIsPreviewDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
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
      type: "chip",
      options: [
        { label: "All", value: "" },
        { label: "Easy", value: 1, color: "#10B981" },
        { label: "Medium", value: 2, color: "#F59E0B" },
        { label: "Hard", value: 3, color: "#EF4444" },
      ],
    },
    {
      name: "type",
      label: "Type",
      type: "chip",
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
      type: "select",
      options: [
        { label: "All", value: "" },
        ...subjectList.map((subject) => ({
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

  const createDialogOpen = () => {
    setSelectedQuestion(null);
    setIsCreateDialogOpen(true);
  };
  const editDialogOpen = (question) => {
    setSelectedQuestion(question);
    setIsCreateDialogOpen(true);
  };
  const createDialogClose = () => setIsCreateDialogOpen(false);

  const toggleDrawer = (open) => () => setIsOpen(open);

  const fetchStats = useCallback(async () => {
    try {
      const parts = [];
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== "" && val != null)
          parts.push(`${key}=${encodeURIComponent(val)}`);
      });
      if (searchQuery) {
        parts.push(`search=${encodeURIComponent(searchQuery)}`);
      }
      const query = parts.length ? `?${parts.join("&")}` : "";

      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/questions/stats${query}`
      );
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, [filters, searchQuery]);

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

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubject();
  }, [fetchSubject]);

  const handleCreateSuccess = () => {
    createDialogClose();
    // Refresh list
    setPage(0);
    lastKeys.current = { 0: null };
    fetchQuestions();
    fetchStats();
  };

  const handleBulkImportSuccess = () => {
    // Refresh questions list, stats, and subjects after bulk import
    setPage(0);
    lastKeys.current = { 0: null };
    fetchQuestions();
    fetchStats();
    fetchSubject(true); // Force refresh subjects to update counts
  };

  return (
    <Stack padding="20px" gap="20px">
      <QuestionsHeader
        stats={stats}
        totalCount={stats?.totalQuestions || 0}
        actions={
          <>
            <Button
              key="Import"
              variant="contained"
              endIcon={<ExpandMore />}
              sx={{
                background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
                color: "#FFFFFF",
                textTransform: "none",
                borderRadius: "10px",
                padding: "10px 20px",
                fontWeight: 700,
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(255, 152, 0, 0.25)",
                minWidth: "120px",
                height: "48px",
                transition: "all 0.2s ease",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
                  boxShadow: "0 6px 16px rgba(255, 152, 0, 0.35)",
                  transform: "translateY(-1px)",
                },
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
                background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
                color: "#FFFFFF",
                textTransform: "none",
                borderRadius: "10px",
                padding: "10px 24px",
                fontWeight: 700,
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(255, 152, 0, 0.25)",
                minWidth: "160px",
                height: "48px",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
                  boxShadow: "0 6px 16px rgba(255, 152, 0, 0.35)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease",
              }}
              disableElevation
            >
              Add Question
            </Button>
          </>
        }
      />

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap="20px"
        padding="16px 20px"
        sx={{
          backgroundColor: "var(--white)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <Stack sx={{ position: "relative", width: "100%", maxWidth: "400px" }}>
          <SearchQuestions onSearch={handleSearch} />
          {searchQuery && (
            <Stack
              sx={{
                position: "absolute",
                right: "40px",
                top: "50%",
                transform: "translateY(-50%)",
                padding: "2px 8px",
                backgroundColor: "#2196F3",
                borderRadius: "10px",
              }}
            >
              <Typography
                sx={{ fontSize: "10px", color: "#fff", fontWeight: 700 }}
              >
                {questionList.length}
              </Typography>
            </Stack>
          )}
        </Stack>

        <Stack
          onClick={toggleDrawer(true)}
          sx={{
            border: `1.5px solid ${
              Object.values(filters).some((v) => v)
                ? "#4CAF50"
                : "var(--border-color)"
            }`,
            borderRadius: "10px",
            backgroundColor: Object.values(filters).some((v) => v)
              ? "rgba(76, 175, 80, 0.08)"
              : "var(--white)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            padding: "8px 16px",
            minWidth: "120px",
            height: "48px",
            "&:hover": {
              borderColor: "#4CAF50",
              backgroundColor: "rgba(76, 175, 80, 0.08)",
              transform: "translateY(-1px)",
              boxShadow: "0 2px 8px rgba(76, 175, 80, 0.15)",
            },
          }}
        >
          <Stack direction="row" alignItems="center" gap="10px">
            <Stack
              sx={{
                width: "32px",
                height: "32px",
                backgroundColor: Object.values(filters).some((v) => v)
                  ? "rgba(76, 175, 80, 0.15)"
                  : "var(--bg-color)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FilterAlt
                sx={{
                  fontSize: "18px",
                  color: Object.values(filters).some((v) => v)
                    ? "#4CAF50"
                    : "var(--text2)",
                }}
              />
            </Stack>
            <Typography
              sx={{
                fontSize: "14px",
                color: Object.values(filters).some((v) => v)
                  ? "#4CAF50"
                  : "var(--text1)",
                fontWeight: 700,
              }}
            >
              Filters
            </Typography>
          </Stack>
        </Stack>

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
                    onEdit={() => editDialogOpen(item)}
                    onDelete={() => dialogDeleteOpen(item.id, item.subjectID)}
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
              variant="outlined"
              onClick={dialogDeleteClose}
              sx={{
                textTransform: "none",
                borderColor: "var(--text2)",
                color: "var(--text2)",
                "&:hover": {
                  borderColor: "var(--text1)",
                  backgroundColor: "rgba(0,0,0,0.04)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                handleDelete(selectedQuestion.id, selectedQuestion.subjectID);
                dialogDeleteClose();
              }}
              sx={{
                textTransform: "none",
                backgroundColor: "var(--delete-color)",
                "&:hover": {
                  backgroundColor: "#d32f2f",
                },
              }}
              disableElevation
            >
              Delete
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
                subjectList.find(
                  (subject) => subject.subjectID === selectedQuestion.subjectID
                )?.title || "Unknown"
              }
            />
          )}
        </Stack>
      </DialogBox>

      <BulkImport
        subjectTitle={subjectList}
        isOpen={isImportDialog}
        close={importDialogClose}
        onSuccess={handleBulkImportSuccess}
      />

      <CreateQuestionDialog
        open={isCreateDialogOpen}
        onClose={createDialogClose}
        onSuccess={handleCreateSuccess}
        initialData={
          isCreateDialogOpen && selectedQuestion?.id ? selectedQuestion : null
        }
      />
    </Stack>
  );
}
