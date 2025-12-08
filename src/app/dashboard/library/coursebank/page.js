"use client";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import { apiFetch } from "@/src/lib/apiFetch";
import { Add, Close, CreateNewFolder, East } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CourseBankHeader from "./components/CourseBankHeader";
import BankFolderCard from "./components/BankFolderCard";
import CreateBankDialog from "./components/CreateBankDialog";

export default function Coursebank() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [title, setTitle] = useState("");
  const [courseList, setCourseList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBankID, setselectedBankID] = useState(null);

  const dialogOpen = () => setIsDialogOpen(true);
  const dialogClose = () => setIsDialogOpen(false);

  const deleteDialogOpen = (bankID) => {
    setselectedBankID(bankID);
    setIsDeleteDialogOpen(true);
  };
  const deleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setselectedBankID(null);
  };

  const fetchCourse = () => {
    setIsLoading(true);
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/get-all-bank/`).then(
      (data) => {
        if (data.success) {
          setCourseList(data.data.banks);
        } else {
          setCourseList([]);
        }
        setIsLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  const bankDelete = () => {
    setIsLoading(true);
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/delete/${selectedBankID}`
    ).then((data) => {
      if (data.success) {
        fetchCourse();
        showSnackbar(data.message, "success", "", "3000");
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
      setIsLoading(false);
      deleteDialogClose();
    });
  };

  return (
    <Stack padding="20px" gap="24px">
      <CourseBankHeader
        title="Course Bank"
        totalCount={courseList.length}
        actions={[
          {
            label: "New Folder",
            icon: <CreateNewFolder />,
            onClick: dialogOpen,
            sx: {
              background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
              color: "white",
            },
          },
        ]}
      />

      <CreateBankDialog
        open={isDialogOpen}
        onClose={dialogClose}
        fetchCourse={fetchCourse}
      />

      <Stack
        sx={{
          border: "1px solid var(--border-color)",
          backgroundColor: "var(--white)",
          borderRadius: "16px",
          padding: "32px",
          minHeight: "75vh",
        }}
      >
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--text2)",
            mb: "20px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Folders ({courseList.length})
        </Typography>

        <Stack flexDirection="row" gap="24px" flexWrap="wrap">
          {!isLoading ? (
            courseList.length > 0 ? (
              courseList.map((item, index) => (
                <BankFolderCard
                  key={index}
                  bank={item}
                  onDelete={deleteDialogOpen}
                />
              ))
            ) : (
              <Stack width="100%" height="50vh">
                <NoDataFound info="No folders created yet" />
              </Stack>
            )
          ) : (
            [...Array(4)].map((_, index) => (
              <SecondaryCardSkeleton key={index} />
            ))
          )}
        </Stack>
      </Stack>

      <DeleteDialogBox
        isOpen={isDeleteDialogOpen}
        onClose={deleteDialogClose}
        actionButton={
          <Stack
            flexDirection="row"
            justifyContent="center"
            sx={{ gap: "16px", width: "100%" }}
          >
            <Button
              variant="contained"
              onClick={bankDelete}
              sx={{
                textTransform: "none",
                backgroundColor: "var(--delete-color)",
                borderRadius: "8px",
                width: "120px",
                height: "44px",
              }}
              disableElevation
            >
              {isLoading ? (
                <CircularProgress size={20} sx={{ color: "var(--white)" }} />
              ) : (
                "Delete"
              )}
            </Button>
            <Button
              variant="outlined"
              onClick={deleteDialogClose}
              sx={{
                textTransform: "none",
                borderRadius: "8px",
                color: "var(--text2)",
                borderColor: "var(--border-color)",
                width: "120px",
                height: "44px",
              }}
            >
              Cancel
            </Button>
          </Stack>
        }
      />
    </Stack>
  );
}
