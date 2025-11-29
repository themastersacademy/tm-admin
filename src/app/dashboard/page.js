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
import GoalsHeader from "@/src/components/GoalsHeader/GoalsHeader";
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
      <GoalsHeader
        totalCount={goalList.length}
        stats={statistics}
        actions={
          <Button
            variant="contained"
            onClick={dialogOpen}
            startIcon={<Add />}
            sx={{
              background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
              color: "white",
              textTransform: "none",
              borderRadius: "10px",
              padding: "10px 24px",
              fontWeight: 700,
              fontSize: "14px",
              minWidth: "140px",
              height: "48px",
              boxShadow: "0 4px 12px rgba(255, 152, 0, 0.25)",
              "&:hover": {
                background: "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
                boxShadow: "0 6px 16px rgba(255, 152, 0, 0.35)",
                transform: "translateY(-1px)",
              },
            }}
            disableElevation
          >
            Create Goal
          </Button>
        }
      />

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
