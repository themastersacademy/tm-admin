"use client";
import PrimaryCard from "@/src/components/PrimaryCard/PrimaryCard";
import { Add, East } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";
import { useState, useEffect } from "react";
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
        } else {
          setGoalList([]);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
      });
  }, []);

  const dialogOpen = () => {
    setIsDialogOpen(true);
  };

  const dialogClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <Stack padding="20px" gap="10px">
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
            }}
            disableElevation
          >
            Goal
          </Button>,
        ]}
      />
      <Stack flexDirection="row" justifyContent="space-between">
        <GoalDialogBox
          isOpen={isDialogOpen}
          onClose={dialogClose}
          actionButton={
            <Button
              variant="text"
              endIcon={<East />}
              sx={{ textTransform: "none", color: "var(--primary-color)" }}
            >
              Create
            </Button>
          }
        />
      </Stack>
      <Stack
        flexDirection="row"
        gap="20px"
        flexWrap="wrap"
        sx={{
          border: "1px solid var(--border-color)",
          backgroundColor: "var(--white)",
          borderRadius: "10px",
          padding: "20px",
          minHeight: "80vh",
        }}
      >
        {!isLoading ? (
          goalList.length > 0 ? (
            goalList.map((item, index) => (
              <PrimaryCard
                key={index}
                icon={
                  item.icon === "castle"
                    ? gate_cse.src
                    : item.icon === "org"
                    ? placements.src
                    : banking.src
                }
                title={item.title}
                actionButton="View"
                onClick={() => {
                  router.push(`dashboard/goals/${item.goalID}`);
                }}
                isLive={item.isLive === true ? "Live" : "Draft"}
              />
            ))
          ) : (
            <Stack
              width="100%"
              minHeight={"60vh"}
              justifyContent="center"
              alignItems={"center"}
            >
              <NoDataFound info="No goal Created yet" />
            </Stack>
          )
        ) : (
          [...Array(4)].map((_, index) => <PrimaryCardSkeleton key={index} />)
        )}
      </Stack>
    </Stack>
  );
}
