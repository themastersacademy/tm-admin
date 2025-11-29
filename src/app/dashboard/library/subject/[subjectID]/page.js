"use client";
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
  useRef,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Stack,
  Button,
  CircularProgress,
  Chip,
  MenuItem,
  Box,
  IconButton,
  Typography,
  TablePagination,
} from "@mui/material";
import { Add, Visibility, Delete, Edit, Close } from "@mui/icons-material";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import SubjectContext from "@/src/app/context/SubjectContext";
import SubjectHeader from "./Components/SubjectHeader";
import QuestionCard from "@/src/components/QuestionCard/QuestionCard";
import QuestionCardSkeleton from "@/src/components/QuestionCardSkeleton/QuestionCardSkeleton";
import SearchQuestions from "../../allQuestions/Components/SearchQuestion";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import MDPreview from "@/src/components/MarkdownPreview/MarkdownPreview";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import PreviewStepper from "../../allQuestions/addQuestion/Components/PreviewStepper";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function SubjectDetails() {
  const { subjectID } = useParams();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { subjectList, fetchSubject } = useContext(SubjectContext);

  const [subject, setSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isDialogDelete, setIsDialogDelete] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isPreviewDialog, setIsPreviewDialog] = useState(false);

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const lastKeys = useRef({ 0: null });
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch Subject Metadata (includes stats)
      const subjectRes = await apiFetch(
        `${BASE_URL}/api/subjects/get/${subjectID}`
      );
      if (subjectRes.success) {
        setSubject(subjectRes.data);
      } else {
        showSnackbar(subjectRes.message, "error");
        return;
      }

      // Fetch Questions (Server-Side Pagination)
      if (searchQuery) {
        // Search Mode - Global Search
        const searchRes = await apiFetch(
          `${BASE_URL}/api/questions/search?q=${encodeURIComponent(
            searchQuery
          )}`
        );
        if (searchRes.success) {
          // Filter by subjectID on client side for search results
          const filtered = searchRes.data.filter(
            (q) => q.subjectID === subjectID
          );
          setQuestions(filtered);
          setHasNextPage(false);
        } else {
          setQuestions([]);
        }
      } else {
        // Pagination Mode
        const currentKey = lastKeys.current[page];
        const body = {
          subjectID,
          limit: rowsPerPage,
          lastEvaluatedKey: currentKey,
        };

        const questionsRes = await apiFetch(
          `${BASE_URL}/api/questions/filter`,
          {
            method: "POST",
            body: JSON.stringify(body),
          }
        );

        if (questionsRes.success) {
          setQuestions(questionsRes.data.questions);
          if (questionsRes.data.lastEvaluatedKey) {
            lastKeys.current[page + 1] = questionsRes.data.lastEvaluatedKey;
            setHasNextPage(true);
          } else {
            setHasNextPage(false);
          }
        } else {
          setQuestions([]);
        }
      }
    } catch (error) {
      console.error(error);
      showSnackbar("Failed to load data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [subjectID, showSnackbar, page, rowsPerPage, searchQuery]);

  useEffect(() => {
    if (subjectID) {
      fetchData();
    }
  }, [subjectID, fetchData]);

  // Reset pagination when search changes
  useEffect(() => {
    setPage(0);
    lastKeys.current = { 0: null };
  }, [searchQuery]);

  // Fetch subjects
  useEffect(() => {
    fetchSubject();
  }, [fetchSubject]);

  // Calculate Stats from Subject Metadata
  const stats = useMemo(() => {
    return {
      totalQuestions: subject?.totalQuestions || 0,
      easyQuestions: 0,
      mediumQuestions: 0,
      hardQuestions: 0,
    };
  }, [subject]);

  // --- Handlers ---

  const handleRename = async (newTitle) => {
    if (!newTitle.trim()) return;
    try {
      const res = await apiFetch(`${BASE_URL}/api/subjects/update-title`, {
        method: "POST",
        body: JSON.stringify({ subjectID, title: newTitle }),
      });
      if (res.success) {
        showSnackbar("Subject renamed successfully", "success");
        setSubject((prev) => ({ ...prev, title: newTitle }));
      } else {
        showSnackbar(res.message, "error");
      }
    } catch (error) {
      showSnackbar("Failed to rename subject", "error");
    }
  };

  const handleDeleteSubject = async () => {
    setIsDeleteLoading(true);
    try {
      const res = await apiFetch(
        `${BASE_URL}/api/subjects/delete/${subjectID}`
      );
      if (res.success) {
        showSnackbar("Subject deleted successfully", "success");
        router.push("/dashboard/library/allSubjects");
      } else {
        showSnackbar(res.message, "error");
      }
    } catch (error) {
      showSnackbar("Failed to delete subject", "error");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const dialogDeleteOpen = (id, subjectID) => {
    setSelectedQuestion({ id, subjectID });
    setIsDialogDelete(true);
  };

  const dialogDeleteClose = () => setIsDialogDelete(false);

  const handleDeleteQuestion = async (id, subjectID) => {
    try {
      const res = await apiFetch(`${BASE_URL}/api/questions/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionID: id, subjectID }),
      });
      if (res.success) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        // Refetch to update stats
        fetchData();
        showSnackbar("Question deleted successfully", "success");
      } else {
        showSnackbar(res.message || "Deletion failed", "error");
      }
    } catch (err) {
      console.error("Delete error", err);
      showSnackbar("Failed to delete question", "error");
    }
  };

  const handleSearch = (q) => setSearchQuery(q);

  const handlePageChange = (event, newPage) => {
    if (newPage > page && !hasNextPage) return;
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    lastKeys.current = { 0: null };
  };

  const previewDialogOpen = (question) => {
    setSelectedQuestion(question);
    setIsPreviewDialog(true);
  };
  const previewDialogClose = () => setIsPreviewDialog(false);

  if (isLoading && !subject) {
    return (
      <Stack alignItems="center" justifyContent="center" height="80vh">
        <CircularProgress />
      </Stack>
    );
  }

  if (!subject) {
    return <NoDataFound info="Subject not found" />;
  }

  return (
    <Stack padding="20px" gap="20px">
      {/* Header */}
      <SubjectHeader
        subject={subject}
        stats={stats}
        totalCount={stats.totalQuestions}
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => {
                const newTitle = prompt(
                  "Enter new subject title",
                  subject.title
                );
                if (newTitle) handleRename(newTitle);
              }}
              sx={{
                textTransform: "none",
                borderRadius: "8px",
                borderColor: "var(--border-color)",
                color: "var(--text2)",
                backgroundColor: "white",
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}
            >
              Rename
            </Button>
            <Button
              variant="outlined"
              startIcon={<Delete />}
              onClick={handleDeleteSubject}
              disabled={isDeleteLoading}
              sx={{
                textTransform: "none",
                borderRadius: "8px",
                borderColor: "var(--delete-color)",
                color: "var(--delete-color)",
                "&:hover": {
                  backgroundColor: "rgba(244, 67, 54, 0.08)",
                  borderColor: "var(--delete-color)",
                },
              }}
            >
              {isDeleteLoading ? "Deleting..." : "Delete"}
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() =>
                router.push(
                  `/dashboard/library/allQuestions/addQuestion?subjectID=${subjectID}`
                )
              }
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

      {/* Search */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        gap="16px"
        alignItems="center"
      >
        <Box sx={{ width: { xs: "100%", md: "400px" } }}>
          <SearchQuestions onSearch={handleSearch} />
        </Box>
      </Stack>

      {/* Questions List */}
      <Stack
        sx={{
          backgroundColor: "var(--white)",
          border: "1px solid",
          borderColor: "var(--border-color)",
          borderRadius: "10px",
          padding: "20px",
          gap: "20px",
          minHeight: "60vh",
        }}
      >
        {!isLoading || questions.length > 0 ? (
          questions.length > 0 ? (
            <>
              <Stack gap="15px">
                {questions.map((item, index) => (
                  <QuestionCard
                    key={index}
                    questionNumber={`Q${page * rowsPerPage + index + 1}`}
                    questionType={item.type || "MCQ"}
                    Subject={
                      subjectList.find(
                        (subject) => subject.subjectID === item.subjectID
                      )?.title || subject.title
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

      {/* Delete Dialog */}
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
                handleDeleteQuestion(
                  selectedQuestion.id,
                  selectedQuestion.subjectID
                );
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

      {/* Preview Dialog */}
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
    </Stack>
  );
}
