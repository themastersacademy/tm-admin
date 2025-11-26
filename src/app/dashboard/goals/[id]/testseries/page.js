"use client";
import {
  Button,
  DialogContent,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import { Add, Close, East, Quiz } from "@mui/icons-material";
import ScheduledExamCard from "@/src/components/ScheduledExamCard/ScheduledExamCard";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import Header from "@/src/components/Header/Header";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import CreateExamDialog from "@/src/components/CreateExamDialog/CreateExamDialog";

export default function TestSeries() {
  const [goal, setGoal] = useState({});
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [isDialogOpen, setIsDialogOPen] = useState(false);
  const [title, setTitle] = useState("");
  const { showSnackbar } = useSnackbar();
  const [mockList, setMockList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const dialogOpen = () => {
    setIsDialogOPen(true);
  };
  const dialogClose = () => {
    setIsDialogOPen(false);
  };

  const fetchGoal = useCallback(() => {
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/${id}`).then(
      (json) => {
        if (json.success) {
          setGoal(json.data);
        } else {
          showSnackbar("No Goal Found", "error", "", "3000");
          router.push(`/404`);
        }
      }
    );
  }, [id, router, showSnackbar]);

  useEffect(() => {
    fetchGoal();
  }, [fetchGoal]);

  const fetchTestSeries = useCallback(() => {
    setIsLoading(true);
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalID: id, type: "mock" }),
    }).then((data) => {
      if (data.success) {
        setMockList(data.data);
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
      setIsLoading(false);
    });
  }, [id, showSnackbar]);

  const createTestSeries = () => {
    if (!title) {
      return showSnackbar("Fill all data", "error", "", "3000");
    }
    setIsCreating(true);
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title,
        goalID: id,
        type: "mock",
      }),
    }).then((data) => {
      if (data.success) {
        showSnackbar(data.message, "success", "", "3000");
        dialogClose();
        setTitle("");
        fetchTestSeries();
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
      setIsCreating(false);
    });
  };

  useEffect(() => {
    fetchTestSeries();
  }, [fetchTestSeries]);

  const headerButtons = [
    <Button
      key="create-btn"
      variant="contained"
      startIcon={<Add />}
      onClick={dialogOpen}
      sx={{
        backgroundColor: "var(--primary-color)",
        textTransform: "none",
      }}
      disableElevation
    >
      Create
    </Button>,
  ];

  return (
    <Stack padding="20px" gap="15px">
      <Header title="TMA Test series" back button={headerButtons} />
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
        <CreateExamDialog
          isOpen={isDialogOpen}
          onClose={dialogClose}
          onCreate={createTestSeries}
          isLoading={isCreating}
          title="Create Test Series"
          subtitle="Create a new test series to assess student performance."
          icon={<Quiz />}
          infoText="Test Series are great for regular practice and mock exams."
        >
          <TextField
            fullWidth
            placeholder="Enter Test Series Title"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "#fff",
                "& fieldset": {
                  borderColor: "var(--border-color)",
                },
                "&:hover fieldset": {
                  borderColor: "var(--primary-color)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--primary-color)",
                  borderWidth: "2px",
                },
              },
              "& .MuiInputLabel-root": {
                color: "var(--text3)",
                "&.Mui-focused": {
                  color: "var(--primary-color)",
                },
              },
            }}
          />
        </CreateExamDialog>
        <Stack
          flexWrap="wrap"
          flexDirection="row"
          rowGap="20px"
          columnGap="20px"
        >
          {!isLoading ? (
            mockList.length > 0 ? (
              mockList.map((item, index) => (
                <ScheduledExamCard
                  key={index}
                  exam={item}
                  onClick={() => {
                    router.push(`/dashboard/goals/${id}/testseries/${item.id}`);
                  }}
                />
              ))
            ) : (
              <Stack minHeight="60vh" width="100%">
                <NoDataFound info="No Test series Created yet" />
              </Stack>
            )
          ) : (
            <>
              <Stack gap="20px" width="500px">
                <SecondaryCardSkeleton questionCard />
              </Stack>
              <Stack gap="20px" width="500px">
                <SecondaryCardSkeleton questionCard />
              </Stack>
            </>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
