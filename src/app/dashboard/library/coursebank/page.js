"use client";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import DeleteDialogBox from "@/src/components/DeleteDialogBox/DeleteDialogBox";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import Header from "@/src/components/Header/Header";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { apiFetch } from "@/src/lib/apiFetch";
import { Add, Close, DeleteRounded, East, Folder } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  DialogContent,
  IconButton,
  MenuItem,
  Stack,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Coursebank() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [title, setTitle] = useState("");
  const [courseList, setCourseList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBankID, setselectedBankID] = useState(null);

  const dialogOpen = () => {
    setIsDialogOpen(true);
  };
  const dialogClose = () => {
    setIsDialogOpen(false);
  };

  const deleteDialogOpen = ({ bankID }) => {
    setselectedBankID(bankID);
    setIsDeleteDialogOpen(true);
  };
  const deleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setselectedBankID(null);
  };

  const fetchCourse = () => {
    setIsLoading(true);
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/get-all-bank`).then(
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
    });
  };

  return (
    <Stack padding="20px" gap="20px">
      <Header
        title="Course bank"
        search
        button={[
          <Button
            key="Add"
            variant="contained"
            startIcon={<Add />}
            onClick={dialogOpen}
            sx={{
              backgroundColor: "var(--primary-color)",
              textTransform: "none",
            }}
            disableElevation
          >
            Add
          </Button>,
        ]}
      />
      <BankCreateDialog
        title={title}
        setTitle={setTitle}
        isDialogOpen={isDialogOpen}
        dialogClose={dialogClose}
        fetchCourse={fetchCourse}
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
        <Stack
          flexDirection="row"
          gap="20px"
          flexWrap="wrap"
        >
          {!isLoading ? (
            courseList.length > 0 ? (
              courseList.map((item, index) => (
                <SecondaryCard
                  key={index}
                  icon={
                    <Folder
                      sx={{ color: "var(--sec-color)" }}
                      fontSize="large"
                    />
                  }
                  title={
                    <span
                      onClick={() => {
                        router.push(
                          `/dashboard/library/coursebank/${item.bankID}`
                        );
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {item.title}
                    </span>
                  }
                  options={[
                    <MenuItem
                      key="one"
                      sx={{
                        fontSize: "14px",
                        color: "var(--delete-color)",
                        gap: "2px",
                      }}
                      onClick={() => {
                        deleteDialogOpen({ bankID: item.bankID });
                      }}
                    >
                      <DeleteRounded sx={{ fontSize: "18px" }} />
                      Delete
                    </MenuItem>,
                  ]}
                  cardWidth="350px"
                />
              ))
            ) : (
              <Stack width={"100%"} minHeight={"60vh"}>
                <NoDataFound info="No Bank Created yet" />
              </Stack>
            )
          ) : (
            [...Array(3)].map((_, index) => (
              <SecondaryCardSkeleton key={index} />
            ))
          )}
        </Stack>
      </Stack>
      <DeleteDialogBox
        isOpen={isDeleteDialogOpen}
        actionButton={
          <Stack
            flexDirection="row"
            justifyContent="center"
            sx={{ gap: "20px", width: "100%" }}
          >
            <Button
              variant="contained"
              onClick={() => {
                bankDelete();
                deleteDialogClose();
              }}
              sx={{
                textTransform: "none",
                backgroundColor: "var(--delete-color)",
                borderRadius: "5px",
                width: "130px",
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
              variant="contained"
              onClick={deleteDialogClose}
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
      ></DeleteDialogBox>
    </Stack>
  );
}

const BankCreateDialog = ({
  isDialogOpen,
  dialogClose,
  setTitle,
  title,
  fetchCourse,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  function OnCourseCreate() {
    if (!title) {
      showSnackbar("Fill all data", "error", "", "3000");
      return;
    }
    setIsLoading(true);
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/create-bank`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    }).then((data) => {
      if (data.success) {
        showSnackbar(data.message, "success", "", "3000");
        dialogClose();
        setTitle("");
        fetchCourse();
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
      setIsLoading(false);
    });
  }
  return (
    <DialogBox
      isOpen={isDialogOpen}
      onClose={dialogClose}
      title="Add Course bank"
      actionButton={
        <Button
          variant="text"
          onClick={OnCourseCreate}
          endIcon={<East />}
          disabled={isLoading}
          sx={{ textTransform: "none", color: "var(--primary-color)" }}
        >
          {isLoading ? (
            <CircularProgress
              size={20}
              sx={{
                color: "var(--primary-color)",
              }}
            />
          ) : (
            "Add Course bank"
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
          placeholder="Enter Course"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
      </DialogContent>
    </DialogBox>
  );
};
