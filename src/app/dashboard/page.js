"use client";
import GoalCard from "@/src/components/GoalCard/GoalCard";
import { Add } from "@mui/icons-material";
import { Button, Stack, Typography, Chip } from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/src/components/Header/Header";
import GoalDialogBox from "./goals/[id]/components/GoalDialogBox/GoalDialogBox";
import { apiFetch } from "@/src/lib/apiFetch";
import PrimaryCardSkeleton from "@/src/components/PrimaryCardSkeleton/PrimaryCardSkeleton";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import gate_cse from "@/public/Icons/gate_cse.svg";
import placements from "@/public/Icons/placements.svg";
import banking from "@/public/Icons/banking.svg";

export default function Home() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [goalList, setGoalList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/get-all-goals`)
      .then((data) => {
        setIsLoading(false);
        if (data.success) {
          setGoalList(data.data.goals);
          console.log(data.data.goals);
        } else {
          setGoalList([]);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
      });
  }, []);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = goalList.length;
    const live = goalList.filter((g) => g.isLive).length;
    const draft = total - live;
    return { total, live, draft };
  }, [goalList]);

  const dialogOpen = () => {
    setIsDialogOpen(true);
  };

  const dialogClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <Stack padding="20px" gap="24px">
      <Stack gap="16px">
        <Header
          title="Goals"
          button={[
            <Button
              key="goal"
              variant="contained"
              onClick={dialogOpen}
              startIcon={<Add />}
              sx={{
                backgroundColor: "var(--primary-color)",
                textTransform: "none",
                borderRadius: "8px",
                fontWeight: 600,
                padding: "8px 24px",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "var(--primary-color-dark)",
                  boxShadow: "0 4px 12px rgba(var(--primary-rgb), 0.3)",
                },
              }}
              disableElevation
            >
              Create Goal
            </Button>,
          ]}
        />

        {/* Statistics Overview */}
        {!isLoading && goalList.length > 0 && (
          <Stack
            direction="row"
            gap="16px"
            flexWrap="wrap"
            sx={{
              padding: "20px",
              backgroundColor: "var(--white)",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              gap="12px"
              padding="12px 20px"
              sx={{
                backgroundColor: "rgba(var(--primary-rgb), 0.05)",
                borderRadius: "8px",
                border: "1px solid rgba(var(--primary-rgb), 0.1)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text3)",
                }}
              >
                Total Goals:
              </Typography>
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--primary-color)",
                  fontFamily: "Lato",
                }}
              >
                {statistics.total}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              gap="12px"
              padding="12px 20px"
              sx={{
                backgroundColor: "rgba(76, 175, 80, 0.05)",
                borderRadius: "8px",
                border: "1px solid rgba(76, 175, 80, 0.1)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text3)",
                }}
              >
                Published:
              </Typography>
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--success-color)",
                  fontFamily: "Lato",
                }}
              >
                {statistics.live}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              gap="12px"
              padding="12px 20px"
              sx={{
                backgroundColor: "rgba(158, 158, 158, 0.05)",
                borderRadius: "8px",
                border: "1px solid rgba(158, 158, 158, 0.1)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text3)",
                }}
              >
                Drafts:
              </Typography>
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--text3)",
                  fontFamily: "Lato",
                }}
              >
                {statistics.draft}
              </Typography>
            </Stack>
          </Stack>
        )}
      </Stack>

      <GoalDialogBox
        isOpen={isDialogOpen}
        onClose={dialogClose}
        setGoalList={setGoalList}
      />

      <Stack
        flexDirection="row"
        gap="24px"
        flexWrap="wrap"
        alignItems="flex-start"
        sx={{
          border: "1px solid var(--border-color)",
          backgroundColor: "var(--white)",
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        {!isLoading ? (
          goalList.length > 0 ? (
            goalList.map((item, index) => (
              <GoalCard
                key={index}
                icon={
                  item.icon === "castle"
                    ? gate_cse.src
                    : item.icon === "org"
                    ? placements.src
                    : item.icon === "bank"
                    ? banking.src
                    : ""
                }
                title={item.title}
                actionButton="View Details"
                onClick={() => {
                  router.push(`dashboard/goals/${item.goalID}`);
                }}
                isLive={item.isLive === true ? "Live" : "Draft"}
                coursesCount={item.coursesCount}
                subjectsCount={item.subjectsCount}
                blogsCount={item.blogsCount}
                updatedAt={item.updatedAt}
              />
            ))
          ) : (
            <Stack
              width="100%"
              minHeight="60vh"
              justifyContent="center"
              alignItems="center"
            >
              <NoDataFound
                info="No goals created yet"
                subInfo="Click 'Create Goal' to get started"
              />
            </Stack>
          )
        ) : (
          [...Array(4)].map((_, index) => <PrimaryCardSkeleton key={index} />)
        )}
      </Stack>
    </Stack>
  );
}
