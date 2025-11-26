"use client";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import {
  Dialog,
  DialogContent,
  Stack,
  Typography,
  Button,
  IconButton,
  Divider,
} from "@mui/material";
import gatecse_img from "@/public/Icons/gate_cse.svg";
import placements_img from "@/public/Icons/placements.svg";
import banking_img from "@/public/Icons/banking.svg";
import { useState } from "react";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/src/lib/apiFetch";
import { Close, ArrowForward, Info } from "@mui/icons-material";
import Image from "next/image";

export default function GoalDialogBox({ isOpen, onClose, setGoalList }) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState(false);
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const onIconSelect = (value) => {
    setIcon(value);
  };

  function OnGoalCreate() {
    if (!title || !icon) {
      showSnackbar("Please fill in all fields", "error", "", "3000");
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
        // Refresh goal list
        apiFetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/get-all-goals`
        ).then((response) => {
          if (response.success) {
            setGoalList(response.data.goals);
          }
        });
        onClose();
        router.push(`dashboard/goals/${data.data.goalID}`);
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
    });
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          border: "1px solid var(--border-color)",
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        padding="24px 24px 20px 24px"
      >
        <Stack gap="4px">
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--text1)",
            }}
          >
            Create New Goal
          </Typography>
          <Typography
            sx={{
              fontSize: "13px",
              color: "var(--text3)",
            }}
          >
            Set up a new learning objective for your students
          </Typography>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Stack>

      <Divider />

      <DialogContent sx={{ padding: "24px" }}>
        <Stack gap="28px">
          {/* Info Banner */}
          <Stack
            direction="row"
            gap="12px"
            padding="16px"
            sx={{
              backgroundColor: "rgba(var(--primary-rgb), 0.05)",
              borderRadius: "12px",
              border: "1px solid rgba(var(--primary-rgb), 0.1)",
            }}
          >
            <Info sx={{ color: "var(--primary-color)", fontSize: "20px" }} />
            <Typography
              sx={{ fontSize: "13px", color: "var(--text2)", lineHeight: 1.6 }}
            >
              Goals help organize your content. You can add courses, subjects,
              and blogs to each goal after creation.
            </Typography>
          </Stack>

          {/* Title Input */}
          <Stack gap="8px">
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--text2)",
              }}
            >
              Goal Title *
            </Typography>
            <StyledTextField
              placeholder="e.g., GATE CSE, Banking Exams, Placements"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
          </Stack>

          {/* Icon Selection */}
          <Stack gap="12px">
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--text2)",
              }}
            >
              Select Icon *
            </Typography>
            <Stack
              direction="row"
              gap="16px"
              justifyContent="center"
              flexWrap="wrap"
            >
              <IconCard
                iconSrc={gatecse_img.src}
                icon={icon}
                value="castle"
                label="GATE / Engineering"
                onIconSelect={onIconSelect}
              />
              <IconCard
                iconSrc={placements_img.src}
                icon={icon}
                value="org"
                label="Placements"
                onIconSelect={onIconSelect}
              />
              <IconCard
                iconSrc={banking_img.src}
                icon={icon}
                value="bank"
                label="Banking / Finance"
                onIconSelect={onIconSelect}
              />
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>

      {/* Footer */}
      <Divider />
      <Stack
        direction="row"
        justifyContent="flex-end"
        gap="12px"
        padding="20px 24px"
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            padding: "8px 24px",
            fontWeight: 600,
            borderColor: "var(--border-color)",
            color: "var(--text2)",
            "&:hover": {
              borderColor: "var(--text3)",
              backgroundColor: "transparent",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={OnGoalCreate}
          endIcon={<ArrowForward />}
          disabled={!title || !icon}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            padding: "8px 24px",
            fontWeight: 600,
            backgroundColor: "var(--primary-color)",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "var(--primary-color-dark)",
              boxShadow: "0 4px 12px rgba(var(--primary-rgb), 0.3)",
            },
            "&:disabled": {
              backgroundColor: "var(--text3)",
              color: "var(--white)",
              opacity: 0.5,
            },
          }}
        >
          Create Goal
        </Button>
      </Stack>
    </Dialog>
  );
}

const IconCard = ({ iconSrc, onIconSelect, icon, value, label }) => {
  const isActive = icon === value;
  return (
    <Stack
      onClick={() => onIconSelect(value)}
      gap="8px"
      alignItems="center"
      sx={{
        width: "140px",
        padding: "20px 16px",
        backgroundColor: isActive
          ? "rgba(var(--primary-rgb), 0.08)"
          : "var(--bg-color)",
        borderRadius: "16px",
        border: `2px solid ${
          isActive ? "var(--primary-color)" : "var(--border-color)"
        }`,
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "var(--primary-color)",
          backgroundColor: "rgba(var(--primary-rgb), 0.05)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Stack
        width="60px"
        height="60px"
        justifyContent="center"
        alignItems="center"
        sx={{
          backgroundColor: isActive
            ? "var(--primary-color)"
            : "rgba(var(--primary-rgb), 0.1)",
          borderRadius: "16px",
          transition: "all 0.2s ease",
        }}
      >
        <Image
          src={iconSrc}
          alt={label}
          width={28}
          height={32}
          style={{
            filter: isActive ? "brightness(0) invert(1)" : "none",
          }}
        />
      </Stack>
      <Typography
        sx={{
          fontFamily: "Lato",
          fontSize: "12px",
          fontWeight: 600,
          color: isActive ? "var(--primary-color)" : "var(--text2)",
          textAlign: "center",
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
};
