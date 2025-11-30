"use client";
import SubjectContext from "@/src/app/context/SubjectContext";
import SubjectsHeader from "./Components/SubjectsHeader";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import { apiFetch } from "@/src/lib/apiFetch";
import { Add } from "@mui/icons-material";
import { Button, Stack, Box, Pagination } from "@mui/material";
import { useEffect, useState, useCallback, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import SubjectCard from "./Components/SubjectCard";
import dynamic from "next/dynamic";

const SubjectDialog = dynamic(() => import("./Components/SubjectDialog"));
const DeleteSubjectDialog = dynamic(() =>
  import("./Components/DeleteSubjectDialog")
);

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function AllSubjects() {
  const router = useRouter();
  const { subjectList, fetchSubject, isLoading } = useContext(SubjectContext);
  const [title, setTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogDelete, setIsDialogDelete] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [deleteError, setDeleteError] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState(
    "Delete all questions associated with this subject?"
  );
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortValue, setSortValue] = useState("newest");
  const [page, setPage] = useState(1);
  const rowsPerPage = 24;

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubject();
  }, [fetchSubject]);

  // Reset page when search or sort changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortValue]);

  // Dialog open/close handlers
  const dialogOpen = useCallback(() => setIsDialogOpen(true), []);
  const dialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setEditSubject(null);
    setTitle("");
  }, []);

  // Handle edit click
  const handleEditClick = useCallback(
    (subject) => {
      setEditSubject(subject);
      setTitle(subject.title);
      setSelectedSubject(subject.subjectID);
      dialogOpen();
    },
    [dialogOpen]
  );

  // Centralized delete dialog state update
  const deleteDialogState = useCallback((state) => {
    if (!state) {
      setSelectedSubject(null);
    }
    setIsDialogDelete(state);
    setIsDeleteLoading(false);
    setDeleteError(false);
    setDeleteWarning("Delete all questions associated with this subject?");
  }, []);

  // Handle delete action
  const handleDelete = useCallback(async () => {
    if (!selectedSubject) return;
    setIsDeleteLoading(true);
    const controller = new AbortController();
    try {
      const data = await apiFetch(
        `${BASE_URL}/api/subjects/delete/${selectedSubject}`,
        { signal: controller.signal }
      );
      if (data.success) {
        await fetchSubject(true);
        deleteDialogState(false);
        enqueueSnackbar("Subject deleted successfully", { variant: "success" });
      } else {
        setDeleteError(true);
        setDeleteWarning(data.message);
        setIsDeleteLoading(false);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        setDeleteError(true);
        setDeleteWarning("An error occurred");
        setIsDeleteLoading(false);
      }
    }
    return () => controller.abort();
  }, [selectedSubject, fetchSubject, deleteDialogState]);

  // When a card's delete option is clicked
  const handleDeleteClick = useCallback(
    (subjectID) => {
      setSelectedSubject(subjectID);
      deleteDialogState(true);
    },
    [deleteDialogState]
  );

  // Handle Create/Update Subject
  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      enqueueSnackbar("Please enter a subject name", { variant: "warning" });
      return;
    }
    setIsSubmitLoading(true);
    const controller = new AbortController();
    try {
      let data;
      if (editSubject) {
        // Update subject
        data = await apiFetch(`${BASE_URL}/api/subjects/update-title`, {
          method: "POST",
          body: JSON.stringify({ title, subjectID: selectedSubject }),
          signal: controller.signal,
        });
      } else {
        // Create subject
        data = await apiFetch(`${BASE_URL}/api/subjects/create-subject`, {
          method: "POST",
          body: JSON.stringify({ title }),
          signal: controller.signal,
        });
      }

      if (data.success) {
        enqueueSnackbar(data.message, { variant: "success" });
        setTitle("");
        dialogClose();
        fetchSubject(true);
      } else {
        enqueueSnackbar(data.message, { variant: "error" });
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        enqueueSnackbar("An error occurred", { variant: "error" });
      }
    } finally {
      setIsSubmitLoading(false);
    }
    return () => controller.abort();
  }, [title, editSubject, selectedSubject, dialogClose, fetchSubject]);

  // Filter and Sort subjects
  const processedSubjects = useMemo(() => {
    let result = [...subjectList];

    // Filter
    if (searchQuery) {
      result = result.filter((subject) =>
        subject.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortValue) {
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "oldest":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case "a-z":
          return a.title.localeCompare(b.title);
        case "z-a":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  }, [subjectList, searchQuery, sortValue]);

  // Pagination
  const totalPages = Math.ceil(processedSubjects.length / rowsPerPage);
  const paginatedSubjects = processedSubjects.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Stack padding="20px" gap="24px">
      <SubjectsHeader
        title="All Subjects"
        totalCount={subjectList.length}
        search
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        sortValue={sortValue}
        onSortChange={(e) => setSortValue(e.target.value)}
        actions={[
          {
            label: "New Subject",
            icon: <Add />,
            onClick: dialogOpen,
            sx: {
              background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
              color: "white",
              textTransform: "none",
              borderRadius: "10px",
              padding: "10px 24px",
              fontWeight: 600,
              minWidth: "160px",
              boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
                boxShadow: "0 6px 16px rgba(255, 152, 0, 0.4)",
              },
            },
          },
        ]}
      />

      <SubjectDialog
        isOpen={isDialogOpen}
        onClose={dialogClose}
        title={title}
        setTitle={setTitle}
        onSubmit={handleSubmit}
        isLoading={isSubmitLoading}
        isEdit={!!editSubject}
      />

      <DeleteSubjectDialog
        isOpen={isDialogDelete}
        onClose={() => deleteDialogState(false)}
        onDelete={handleDelete}
        isLoading={isDeleteLoading}
        warning={deleteWarning}
        isError={deleteError}
      />

      <Stack
        sx={{
          border: "1px solid var(--border-color)",
          backgroundColor: "var(--white)",
          borderRadius: "16px",
          padding: "32px",
          minHeight: "75vh",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "24px",
            width: "100%",
            alignContent: "start",
          }}
        >
          {!isLoading ? (
            paginatedSubjects.length > 0 ? (
              paginatedSubjects.map((item) => (
                <SubjectCard
                  key={item.subjectID}
                  title={item.title}
                  totalQuestions={item.totalQuestions}
                  updatedAt={item.updatedAt}
                  onClick={() =>
                    router.push(`/dashboard/library/subject/${item.subjectID}`)
                  }
                  onEdit={() => handleEditClick(item)}
                  onDelete={() => handleDeleteClick(item.subjectID)}
                />
              ))
            ) : (
              <Box sx={{ gridColumn: "1 / -1", height: "100%" }}>
                <NoDataFound
                  info={
                    searchQuery
                      ? "No subjects found matching your search"
                      : "No subjects created yet"
                  }
                />
              </Box>
            )
          ) : (
            Array.from({ length: 6 }).map((_, index) => (
              <SecondaryCardSkeleton key={index} />
            ))
          )}
        </Box>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <Stack alignItems="center" mt={4}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": {
                  fontWeight: 600,
                },
              }}
            />
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
