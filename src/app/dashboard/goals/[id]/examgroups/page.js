"use client";
import { Button, Stack, TextField } from "@mui/material";
import { Add, Groups, CheckCircle, Quiz } from "@mui/icons-material";
import ExamGroupCard from "@/src/components/ExamGroupCard/ExamGroupCard";
import { useParams, useRouter } from "next/navigation";
import CreateExamDialog from "@/src/components/CreateExamDialog/CreateExamDialog";
import { useEffect, useState, useCallback } from "react";
import Header from "@/src/components/Header/Header";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { apiFetch } from "@/src/lib/apiFetch";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import SecondaryCardSkeleton from "@/src/components/SecondaryCardSkeleton/SecondaryCardSkeleton";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";

export default function Examgroups() {
  const params = useParams();
  const goalID = params.id;
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [title, setTitle] = useState("");
  const [isDialogOpen, setIsDialogOPen] = useState(false);
  const [groupList, setGroupList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const dialogOpen = () => {
    setIsDialogOPen(true);
  };
  const dialogClose = () => {
    setIsDialogOPen(false);
  };

  const fetchExamGroups = useCallback(() => {
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
  }, [goalID, showSnackbar]);

  const createExamGroup = () => {
    if (!title) {
      return showSnackbar("Fill all data", "error", "", "3000");
    }
    setIsCreating(true);
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
      setIsCreating(false);
    });
  };

  useEffect(() => {
    fetchExamGroups();
  }, [fetchExamGroups]);

  // Calculate statistics
  const totalGroups = groupList.length;
  const liveGroups = groupList.filter((group) => group.isLive).length;
  const totalExams = groupList.reduce(
    (acc, group) =>
      acc +
      (group?.examCount ||
        group?.examList?.length ||
        group?.exams?.length ||
        group?.totalExams ||
        0),
    0
  );

  return (
    <Stack padding="20px" gap="20px">
      <Header
        title="Exam Groups"
        back
        button={[
          <Button
            key="create"
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
            Create Group
          </Button>,
        ]}
      />

      {/* Analytics Cards */}
      <Stack flexDirection="row" gap="20px" flexWrap="wrap">
        <SecondaryCard
          icon={<Groups sx={{ color: "var(--primary-color)" }} />}
          title="Total Groups"
          subTitle={isLoading ? "..." : totalGroups}
          cardWidth="200px"
        />
        <SecondaryCard
          icon={<CheckCircle sx={{ color: "var(--primary-color)" }} />}
          title="Live Groups"
          subTitle={isLoading ? "..." : liveGroups}
          cardWidth="200px"
        />
        <SecondaryCard
          icon={<Quiz sx={{ color: "var(--primary-color)" }} />}
          title="Total Exams"
          subTitle={isLoading ? "..." : totalExams}
          cardWidth="200px"
        />
      </Stack>

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
          onCreate={createExamGroup}
          isLoading={isCreating}
          title="Create Exam Group"
          subtitle="Group multiple exams together for structured learning."
          icon={<Groups />}
          infoText="Exam Groups allow you to bundle exams for a comprehensive assessment."
        >
          <TextField
            fullWidth
            placeholder="Enter Exam Group Title"
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

        <Stack flexWrap="wrap" flexDirection="row" gap="20px">
          {!isLoading ? (
            groupList.length > 0 ? (
              groupList.map((item, index) => (
                <ExamGroupCard
                  key={index}
                  group={item}
                  onClick={() => {
                    router.push(
                      `/dashboard/goals/${goalID}/examgroups/${item.id}`
                    );
                  }}
                />
              ))
            ) : (
              <Stack minHeight="60vh" width="100%">
                <NoDataFound info="No Exam Group Created yet" />
              </Stack>
            )
          ) : (
            <>
              <SecondaryCardSkeleton questionCard />
              <SecondaryCardSkeleton questionCard />
              <SecondaryCardSkeleton questionCard />
            </>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
