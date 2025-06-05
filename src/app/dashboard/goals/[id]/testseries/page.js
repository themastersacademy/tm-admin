"use client";
import { Button, DialogContent, IconButton, Stack } from "@mui/material";
import { Add, Close, East } from "@mui/icons-material";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import Header from "@/src/components/Header/Header";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import mocks from "@/public/Icons/series.svg";
import Image from "next/image";

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

  const dialogOpen = () => {
    setIsDialogOPen(true);
  };
  const dialogClose = () => {
    setIsDialogOPen(false);
  };

  function fetchGoal() {
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
  }

  useEffect(() => {
    fetchGoal();
  }, []);

  const createTestSeries = () => {
    if (!title) {
      return showSnackbar("Fill all data", "error", "", "3000");
    }
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
    });
  };

  const fetchTestSeries = () => {
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
  };

  useEffect(() => {
    fetchTestSeries();
  }, []);

  return (
    <Stack padding="20px" gap="15px">
      <Header title="TMA Test series" back />
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
          Create
        </Button>
        <CreateDialog
          isDialogOpen={isDialogOpen}
          dialogClose={dialogClose}
          createTestSeries={createTestSeries}
          title={title}
          setTitle={setTitle}
        />
        <Stack
          flexWrap="wrap"
          flexDirection="row"
          rowGap="20px"
          columnGap="20px"
        >
          {!isLoading ? (
            mockList.length > 0 ? (
              mockList.map((item, index) => (
                <SecondaryCard
                  key={index}
                  icon={
                    <Image src={mocks.src} alt="mocks" width={24} height={24} />
                  }
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
                          `/dashboard/goals/${id}/testseries/${item.id}`
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

const CreateDialog = ({
  isDialogOpen,
  dialogClose,
  createTestSeries,
  title,
  setTitle,
}) => {
  return (
    <DialogBox
      isOpen={isDialogOpen}
      title="Test series"
      icon={
        <IconButton sx={{ borderRadius: "8px", padding: "4px" }}>
          <Close onClick={dialogClose} />
        </IconButton>
      }
      actionButton={
        <Button
          variant="text"
          endIcon={<East />}
          onClick={createTestSeries}
          sx={{ textTransform: "none", color: "var(--primary-color)" }}
        >
          Create
        </Button>
      }
    >
      <DialogContent>
        <StyledTextField
          placeholder="Enter Test series"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </DialogContent>
    </DialogBox>
  );
};
