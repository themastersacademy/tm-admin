"use client";
import GoalCard from "@/src/components/GoalCard/GoalCard";
import { Add } from "@mui/icons-material";
import { Button, Stack, Skeleton } from "@mui/material";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import GoalDialogBox from "./goals/[id]/components/GoalDialogBox/GoalDialogBox";
import { apiFetch } from "@/src/lib/apiFetch";
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

  const fetchGoals = useCallback(async (signal) => {
    setIsLoading(true);
    try {
      const abortSignal = signal instanceof AbortSignal ? signal : null;
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/get-all-goals`,
        { signal: abortSignal }
      );
      if (data.success) {
        setGoalList(data.data.goals);
      } else {
        setGoalList([]);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching goals:", error);
        setGoalList([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchGoals(controller.signal);
    return () => controller.abort();
  }, [fetchGoals]);

  const statistics = useMemo(() => {
    const total = goalList.length;
    const live = goalList.filter((g) => g.isLive).length;
    const draft = total - live;
    return { total, live, draft };
  }, [goalList]);

  return (
    <Stack padding="20px" gap="16px">
      <GoalsHeader
        totalCount={goalList.length}
        stats={statistics}
        actions={
          <Button
            variant="contained"
            onClick={() => setIsDialogOpen(true)}
            startIcon={<Add sx={{ fontSize: "16px" }} />}
            disableElevation
            sx={{
              backgroundColor: "var(--primary-color)",
              color: "#fff",
              textTransform: "none",
              borderRadius: "8px",
              padding: "6px 16px",
              fontWeight: 600,
              fontSize: "12px",
              height: "34px",
              "&:hover": {
                backgroundColor: "var(--primary-color-dark)",
              },
            }}
          >
            Create Goal
          </Button>
        }
      />

      <GoalDialogBox
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        setGoalList={setGoalList}
      />

      <Stack
        direction="row"
        gap="16px"
        flexWrap="wrap"
        alignItems="flex-start"
        sx={{ minHeight: "60vh" }}
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
                onClick={() => {
                  router.push(`/dashboard/goals/${item.goalID}`);
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
              minHeight="50vh"
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
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              width={280}
              height={140}
              sx={{ borderRadius: "10px" }}
            />
          ))
        )}
      </Stack>
    </Stack>
  );
}
