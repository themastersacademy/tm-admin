"use client";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import SubjectContext from "@/src/app/context/SubjectContext";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import Header from "@/src/components/Header/Header";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { apiFetch } from "@/src/lib/apiFetch";
import {
  Add,
  Close,
  DeleteRounded,
  East,
  EditRounded,
  InsertDriveFile,
} from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  DialogContent,
  IconButton,
  MenuItem,
  Stack,
} from "@mui/material";
import { useEffect, useState, useCallback, useMemo, useContext } from "react";
import { enqueueSnackbar } from "notistack";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function AllSubjects() {
  const { subjectList, fetchSubject, isLoading } = useContext(SubjectContext); // Use context
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

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubject(); // Use fetchSubject from context
  }, [fetchSubject]);

  // Dialog open/close handlers
  const dialogOpen = useCallback(() => setIsDialogOpen(true), []);
  const dialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setEditSubject(null); // Clear edit subject on close
    setTitle(""); // Clear title
  }, []);

  // Handle edit click
  const handleEditClick = useCallback(
    (subject) => {
      setEditSubject(subject); // Set subject to edit
      setTitle(subject.title); // Prefill title
      setSelectedSubject(subject.subjectID); // Set subjectID
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
    try {
      const data = await apiFetch(
        `${BASE_URL}/api/subjects/delete/${selectedSubject}`
      );
      if (data.success) {
        await fetchSubject(true); // Force refresh after deletion
        deleteDialogState(false);
      } else {
        setDeleteError(true);
        setDeleteWarning(data.message);
        setIsDeleteLoading(false);
      }
    } catch (error) {
      setDeleteError(true);
      setDeleteWarning("An error occurred");
      setIsDeleteLoading(false);
    }
  }, [selectedSubject, fetchSubject, deleteDialogState]);

  // When a card's delete option is clicked
  const handleDeleteClick = useCallback(
    (subjectID) => {
      setSelectedSubject(subjectID);
      deleteDialogState(true);
    },
    [deleteDialogState]
  );

  // Memoize subject cards
  const subjectCards = useMemo(() => {
    return subjectList.map((item) => (
      <SecondaryCard
        key={item.subjectID}
        icon={<InsertDriveFile sx={{ color: "var(--sec-color)" }} />}
        title={item.title}
        subTitle={`${item.totalQuestions} questions`}
        cardWidth="350px"
        options={[
          <MenuItem
            key={`edit-${item.subjectID}`}
            sx={{ fontSize: "14px", color: "var(--edit-color)", gap: "5px" }}
            disableRipple
            onClick={() => handleEditClick(item)}
          >
            <EditRounded sx={{ fontSize: "16px" }} />
            Edit
          </MenuItem>,
          <MenuItem
            key={`delete-${item.subjectID}`}
            sx={{ fontSize: "14px", color: "var(--delete-color)", gap: "5px" }}
            disableRipple
            onClick={() => handleDeleteClick(item.subjectID)}
          >
            <DeleteRounded sx={{ fontSize: "16px" }} />
            Delete
          </MenuItem>,
        ]}
      />
    ));
  }, [subjectList, handleDeleteClick, handleEditClick]);

  return (
    <Stack padding="20px" gap="20px">
      <Header
        title="All Subjects"
        search
        button={[
          <Button
            key="createSubject"
            variant="contained"
            startIcon={<Add />}
            onClick={dialogOpen}
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
            }}
            disableElevation
          >
            Subject
          </Button>,
        ]}
      />
      <SubjectCreateDialog
        isDialogOpen={isDialogOpen}
        dialogClose={dialogClose}
        title={title}
        setTitle={setTitle}
        fetchSubject={fetchSubject}
        editSubject={editSubject}
        selectedSubject={selectedSubject}
      />
      <DeleteSubjectDialog
        deleteDialogState={deleteDialogState}
        handleDelete={handleDelete}
        isDialogDelete={isDialogDelete}
        deleteWarning={deleteWarning}
        isDeleteLoading={isDeleteLoading}
        isError={deleteError}
      />
      <Stack
        sx={{
          border: "1px solid var(--border-color)",
          backgroundColor: "var(--white)",
          borderRadius: "10px",
          padding: "20px",
          minHeight: "80vh",
        }}
      >
        <Stack flexDirection="row" gap="20px" flexWrap="wrap">
          {!isLoading ? (
            subjectList.length > 0 ? (
              subjectCards
            ) : (
              <Stack width="100%" minHeight="60vh">
                <NoDataFound info="No subject Created yet" />
              </Stack>
            )
          ) : (
            Array.from({ length: 3 }).map((_, index) => (
              <SecondaryCardSkeleton key={index} />
            ))
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}

// SubjectCreateDialog and DeleteSubjectDialog remain unchanged
const SubjectCreateDialog = ({
  isDialogOpen,
  dialogClose,
  title,
  setTitle,
  fetchSubject,
  editSubject,
  selectedSubject,
}) => {
  const { showSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  const onSubjectCreate = useCallback(async () => {
    if (!title) {
      showSnackbar("Fill all data", "error", "", "3000");
      return;
    }
    setIsLoading(true);
    try {
      let data;
      if (editSubject) {
        // Update subject
        data = await apiFetch(
          `${BASE_URL}/api/subjects/update/${selectedSubject}`,
          {
            method: "PUT",
            body: JSON.stringify({ title }),
          }
        );
      } else {
        // Create subject
        data = await apiFetch(`${BASE_URL}/api/subjects/create-subject`, {
          method: "POST",
          body: JSON.stringify({ title }),
        });
      }
      if (data.success) {
        showSnackbar(data.message, "success", "", "3000");
        setTitle("");
        dialogClose();
        fetchSubject(true); // Force refresh after creation
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
    } catch (error) {
      showSnackbar("An error occurred", "error", "", "3000");
    } finally {
      setIsLoading(false);
    }
  }, [
    title,
    dialogClose,
    fetchSubject,
    setTitle,
    showSnackbar,
    editSubject,
    selectedSubject,
  ]);

  const onSubjectUpdate = useCallback(async () => {
    if (!title) {
      enqueueSnackbar("Fill all data", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }
    setIsLoading(true);
    try {
      const data = await apiFetch(`${BASE_URL}/api/subjects/update-title`, {
        method: "POST",
        body: JSON.stringify({ title, subjectID: selectedSubject }),
      });
      if (data.success) {
        enqueueSnackbar(data.message, {
          variant: "success",
          autoHideDuration: 3000,
        });
        setTitle("");
        dialogClose();
        fetchSubject(true); // Force refresh after creation
      } else {
        enqueueSnackbar(data.message, {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
    } catch (error) {
      enqueueSnackbar("An error occurred", {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [title, setTitle, dialogClose, fetchSubject]);

  return (
    <DialogBox
      isOpen={isDialogOpen}
      title={editSubject ? "Edit Subject" : "Add Subject"}
      actionButton={
        <Button
          variant="text"
          endIcon={<East />}
          onClick={editSubject ? onSubjectUpdate : onSubjectCreate}
          sx={{ textTransform: "none", color: "var(--primary-color)" }}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress
              size={20}
              sx={{ color: "var(--primary-color)" }}
            />
          ) : editSubject ? (
            "Update"
          ) : (
            "Create"
          )}
        </Button>
      }
      icon={
        <IconButton
          onClick={dialogClose}
          sx={{ borderRadius: "10px", padding: "6px" }}
        >
          <Close sx={{ color: "var(--text2)" }} />
        </IconButton>
      }
    >
      <DialogContent>
        <StyledTextField
          placeholder="Enter Subject"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </DialogContent>
    </DialogBox>
  );
};

const DeleteSubjectDialog = ({
  deleteDialogState,
  handleDelete,
  isDialogDelete,
  deleteWarning,
  isDeleteLoading,
  isError,
}) => {
  return (
    <DeleteDialogBox
      isOpen={isDialogDelete}
      warning={deleteWarning}
      isError={isError}
      onClose={() => deleteDialogState(false)}
      actionButton={
        <Stack
          flexDirection="row"
          justifyContent="center"
          sx={{ gap: "20px", width: "100%" }}
        >
          <Button
            variant="contained"
            onClick={handleDelete}
            disabled={isDeleteLoading}
            sx={{
              textTransform: "none",
              backgroundColor: "var(--delete-color)",
              borderRadius: "5px",
              width: "130px",
            }}
            disableElevation
          >
            {isDeleteLoading ? (
              <CircularProgress size={20} color="var(--delete-color)" />
            ) : (
              "Delete"
            )}
          </Button>
          <Button
            variant="contained"
            onClick={() => deleteDialogState(false)}
            sx={{
              textTransform: "none",
              borderRadius: "5px",
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
  );
};
