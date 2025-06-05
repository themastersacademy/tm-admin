"use client";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
  Typography,
} from "@mui/material";
import gatecse_img from "@/public/Icons/gate_cse.svg";
import placements_img from "@/public/Icons/placements.svg";
import banking_img from "@/public/Icons/banking.svg";
import { useState } from "react";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/src/lib/apiFetch";
import { Close } from "@mui/icons-material";

export default function GoalDialogBox({ isOpen, onClose, actionButton }) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState(false);
  const router = useRouter();
  const onIconSelect = (value) => {
    setIcon(value);
  };
  const { showSnackbar } = useSnackbar();

  function OnGoalCreate() {
    //API: /api/goals/goal-create
    if (!title || !icon) {
      showSnackbar("Fill all data", "error", "", "3000");
      return;
    }

    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/create-goal`,
      {
        method: "POST",
        body: JSON.stringify({
          title,
          icon,
        }),
      },
      showSnackbar
    ).then((data) => {
      if (data.success) {
        showSnackbar(data.message, "success", "", "3000");
        onClose();
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
      router.push(`dashboard/goals/${data.data.goalID}`);
    });
  }

  return (
    <Dialog
      open={isOpen}
      TransitionComponent={Slide}
      sx={{
        "& .MuiDialog-paper": {
          width: "600px",
          borderRadius: "10px",
          border: "1px solid var(--border-color)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "Lato",
          fontSize: "20px",
          fontWeight: "700",
        }}
      >
        Goal
        {<Close onClick={onClose} sx={{ cursor: "pointer" }} />}
      </DialogTitle>
      <DialogContent
        sx={{ gap: "15px", display: "flex", flexDirection: "column" }}
      >
        <StyledTextField
          placeholder="Enter name"
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "14px",
            fontWeight: "600",
            color: "var(--text4)",
          }}
        >
          Select icon
        </Typography>
        <Stack flexDirection="row" gap={3} justifyContent="center">
          <Icon
            iconSrc={gatecse_img.src}
            icon={icon}
            value={"castle"}
            onIconSelect={onIconSelect}
          />
          <Icon
            iconSrc={placements_img.src}
            icon={icon}
            value={"org"}
            onIconSelect={onIconSelect}
          />
          <Icon
            iconSrc={banking_img.src}
            icon={icon}
            value={"bank"}
            onIconSelect={onIconSelect}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center" }} onClick={OnGoalCreate}>
        <Stack>{actionButton}</Stack>
      </DialogActions>
    </Dialog>
  );
}

const Icon = ({ iconSrc, onIconSelect, icon, value }) => {
  const isActive = icon === value;
  return (
    <Stack
      onClick={() => onIconSelect(value)}
      sx={{
        width: "50px",
        height: "50px",
        backgroundColor: isActive
          ? "var(--sec-color-acc-1)"
          : "var(--sec-color-acc-2)",
        borderRadius: "15px",
        border: isActive ? "1px solid var(--sec-color)" : "none",
        justifyContent: "center",
        alignItems: "center",
        "& > div": {
          opacity: isActive ? 1 : 0.5,
        },
        "&:hover": {
          backgroundColor: "var(--sec-color-acc-1)",
          "& > div": {
            opacity: 1,
          },
        },
      }}
      tabIndex={0}
    >
     <Stack
  width="17.5px"
  height="20px"
  sx={{
    WebkitMask: `url(${iconSrc}) no-repeat center`,
    mask: `url(${iconSrc}) no-repeat center`,
    backgroundColor: "var(--sec-color)",
    opacity: "0.4",
    maskSize: "contain",
  }}
></Stack>
    </Stack>
  );
};
