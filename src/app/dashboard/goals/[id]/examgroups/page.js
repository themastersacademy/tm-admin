"use client";
import { Button, DialogContent, IconButton, Stack } from "@mui/material";
import { Add, CalendarMonth, Close, East } from "@mui/icons-material";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";
import { useParams, useRouter } from "next/navigation";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import { useEffect, useState } from "react";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import Header from "@/src/components/Header/Header";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { apiFetch } from "@/src/lib/apiFetch";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";

export default function Examgroups() {
  const params = useParams();
  const goalID = params.id;
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [title, setTitle] = useState("");
  const [isDialogOpen, setIsDialogOPen] = useState(false);
  const [groupList, setGroupList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const dialogOpen = () => {
    setIsDialogOPen(true);
  };
  const dialogClose = () => {
    setIsDialogOPen(false);
  };

  const createExamGroup = () => {
    if (!title) {
      return showSnackbar("Fill all data", "error", "", "3000");
    }
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/group/create-group`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalID: goalID,
          title: title,
        }),
      }
    ).then((data) => {
      if (data.success) {
        showSnackbar(data.message, "success", "", "3000");
        dialogClose();
        setTitle("");
        fetchExamGroups();
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
    });
  };

  const fetchExamGroups = () => {
    setIsLoading(true);
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/group/get-exam-by-goal`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalID: goalID,
        }),
      }
    ).then((data) => {
      if (data.success) {
        setGroupList(data.data);
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
      setIsLoading(false);
    });
  };
  useEffect(() => {
    fetchExamGroups();
  }, []);

  return (
    <Stack padding="20px" gap="15px">
      <Header title="Exam Groups" back />
      <Stack
        sx={{
          backgroundColor: "var(--white)",
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          padding: "20px",
          gap: "20px",
          minHeight: "100vh",
        }}
      >
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={dialogOpen}
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
            marginLeft: "auto",
          }}
          disableElevation
        >
          create
        </Button>
        <CreateDialog
          isDialogOpen={isDialogOpen}
          dialogClose={dialogClose}
          createExamGroup={createExamGroup}
          title={title}
          setTitle={setTitle}
        />
        <Stack flexWrap="wrap" flexDirection="row" gap="20px">
          {!isLoading ? (
            groupList.length > 0 ? (
              groupList.map((item, index) => (
                <SecondaryCard
                  key={index}
                  icon={<CalendarMonth sx={{ color: "var(--sec-color)" }} />}
                  title={item.title}
                  cardWidth="500px"
                  button={
                    <Button
                      variant="contained"
                      sx={{
                        textTransform: "none",
                        backgroundColor: "var(--sec-color)",
                        fontFamily: "Lato",
                        fontSize: "12px",
                      }}
                      endIcon={<East />}
                      onClick={() => {
                        router.push(
                          `/dashboard/goals/${goalID}/examgroups/${item.id}`
                        );
                      }}
                      disableElevation
                    >
                      View
                    </Button>
                  }
                />
              ))
            ) : (
              <Stack minHeight="60vh" width="100%">
                <NoDataFound info="No Exam Group Created yet" />
              </Stack>
            )
          ) : (
            <Stack gap="20px" width="500px">
              <SecondaryCardSkeleton questionCard />
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}

const CreateDialog = ({
  isDialogOpen,
  dialogClose,
  title,
  setTitle,
  createExamGroup,
}) => {
  return (
    <DialogBox
      isOpen={isDialogOpen}
      title="Exam Group"
      icon={
        <IconButton sx={{ borderRadius: "8px", padding: "4px" }}>
          <Close onClick={dialogClose} />
        </IconButton>
      }
      actionButton={
        <Button
          variant="text"
          endIcon={<East />}
          onClick={createExamGroup}
          sx={{ textTransform: "none", color: "var(--primary-color)" }}
        >
          Create
        </Button>
      }
    >
      <DialogContent>
        <StyledTextField
          placeholder="Enter Exam Group"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </DialogContent>
    </DialogBox>
  );
};
