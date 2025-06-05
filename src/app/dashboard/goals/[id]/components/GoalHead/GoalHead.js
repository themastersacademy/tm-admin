"use client";
import {
  Button,
  CircularProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import Image from "next/image";
import gate_cse from "@/public/Icons/gate_cse.svg";
import placements from "@/public/Icons/placements.svg";
import banking from "@/public/Icons/banking.svg";
import { ArrowBackIosRounded } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { useState } from "react";

export default function GoalHead({ goal, goalLoading, fetchGoal }) {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const handleLive = () => {
    setIsLoading(true);
    try {
      apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/${goal.goalID}/live-unlive`
      ).then((data) => {
        if (data.success) {
          showSnackbar(data.message, "success", "", "3000");
          fetchGoal();
          setIsLoading(false);
        } else {
          showSnackbar(data.message, "error", "", "3000");
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  return (
    <Stack
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        backgroundColor: "var(--white)",
        padding: "20px",
        height: "60px",
      }}
    >
      <Stack flexDirection="row" alignItems="center" gap="15px">
        <ArrowBackIosRounded
          onClick={() => {
            router.back();
          }}
          sx={{
            fontSize: "20px",
            cursor: "pointer",
            fontWeight: "700",
          }}
        />
        <Stack
          sx={{
            width: "40px",
            height: "40px",
            backgroundColor: "var(--sec-color-acc-1)",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            src={
              goal.icon === "castle"
                ? gate_cse.src
                : goal.icon === "org"
                ? placements.src
                : banking.src
            }
            alt="icon"
            width="16"
            height="17"
          />
        </Stack>
        <Typography
          sx={{ fontFamily: "Lato", fontSize: "14px", fontWeight: "700" }}
        >
          {!goalLoading ? (
            goal.title ? (
              goal.title
            ) : (
              "Goal not found"
            )
          ) : (
            <Skeleton variant="text" animation="wave" width="100px" />
          )}
        </Typography>
      </Stack>
      <Button
        variant="contained"
        onClick={() => {
          handleLive();
        }}
        sx={{
          textTransform: "none",
          width: "120px",
          backgroundColor: "var(--sec-color)",
          fontFamily: "Lato",
          fontSize: "14px",
          fontWeight: "700",
          borderRadius: "5px",
        }}
        disableElevation
      >
        {isLoading ? (
          <CircularProgress size={22} sx={{ color: "white" }} />
        ) : goal.isLive === true ? (
          "Draft"
        ) : (
          "Publish"
        )}
      </Button>
    </Stack>
  );
}
