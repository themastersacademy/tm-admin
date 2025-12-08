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
import { useState, useEffect } from "react";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/src/lib/apiFetch";
import { Close, ArrowForward, Info } from "@mui/icons-material";
import Image from "next/image";
import GoalBannerUpload from "@/src/components/GoalBannerUpload/GoalBannerUpload";

export default function GoalDialogBox({
  isOpen,
  onClose,
  setGoalList,
  isEdit = false,
  goalData = null,
  onUpdateSuccess,
}) {
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(false);
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (isOpen) {
      if (isEdit && goalData) {
        setTitle(goalData.title || "");
        setTagline(goalData.tagline || "");
        setDescription(goalData.description || "");
        setIcon(goalData.icon || false);
      } else {
        setTitle("");
        setTagline("");
        setDescription("");
        setIcon(false);
      }
    }
  }, [isOpen, isEdit, goalData]);

  const onIconSelect = (value) => {
    setIcon(value);
  };

  function OnGoalCreate() {
    if (!title || !icon) {
      showSnackbar("Please fill in all fields", "error", "", "3000");
      return;
    }

    if (isEdit) {
      apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/${goalData.goalID}/update`,
        {
          method: "POST",
          body: JSON.stringify({
            title,
            icon,
            tagline,
            description,
          }),
        },
        showSnackbar
      ).then((data) => {
        if (data.success) {
          showSnackbar("Goal updated successfully", "success", "", "3000");
          if (onUpdateSuccess) onUpdateSuccess();
          onClose();
        } else {
          showSnackbar(data.message, "error", "", "3000");
        }
      });
    } else {
      apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/create-goal`,
        {
          method: "POST",
          body: JSON.stringify({
            title,
            icon,
            tagline,
            description,
          }),
        },
        showSnackbar
      ).then((data) => {
        if (data.success) {
          showSnackbar(data.message, "success", "", "3000");
          // Refresh goal list
          apiFetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/get-all-goals/`
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
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          border: "1px solid var(--border-color)",
          maxWidth: "700px",
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
            {isEdit ? "Edit Goal" : "Create New Goal"}
          </Typography>
          <Typography
            sx={{
              fontSize: "13px",
              color: "var(--text3)",
            }}
          >
            {isEdit
              ? "Update the details of this goal"
              : "Set up a new learning objective for your students"}
          </Typography>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Stack>

      <Divider />

      <DialogContent sx={{ padding: "32px" }}>
        <Stack gap="32px">
          {/* Info Banner */}
          {!isEdit && (
            <Stack
              direction="row"
              gap="12px"
              padding="16px 20px"
              sx={{
                backgroundColor: "rgba(var(--primary-rgb), 0.05)",
                borderRadius: "12px",
                border: "1px solid rgba(var(--primary-rgb), 0.1)",
              }}
            >
              <Info sx={{ color: "var(--primary-color)", fontSize: "20px" }} />
              <Typography
                sx={{
                  fontSize: "13px",
                  color: "var(--text2)",
                  lineHeight: 1.6,
                }}
              >
                Goals help organize your content. You can add courses, subjects,
                and blogs to each goal after creation.
              </Typography>
            </Stack>
          )}

          {/* Title Input */}
          <Stack gap="10px">
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--text1)",
                letterSpacing: "0.3px",
              }}
            >
              Goal Title *
            </Typography>
            <StyledTextField
              placeholder="e.g., GATE CSE 2025, Banking Preparation, Placements Prep"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "15px",
                  fontWeight: 500,
                },
              }}
            />
          </Stack>

          {/* Tagline Input */}
          <Stack gap="10px">
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--text1)",
                letterSpacing: "0.3px",
              }}
            >
              Tagline
            </Typography>
            <StyledTextField
              placeholder="A short catchy phrase (e.g., Master your path to GATE success)"
              value={tagline}
              onChange={(e) => {
                setTagline(e.target.value);
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "14px",
                },
              }}
            />
          </Stack>

          {/* Description Input */}
          <Stack gap="10px">
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--text1)",
                letterSpacing: "0.3px",
              }}
            >
              Description
            </Typography>
            <StyledTextField
              placeholder="Provide a detailed overview of what this goal covers, learning outcomes, and key features..."
              value={description}
              multiline
              rows={4}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "auto",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  alignItems: "flex-start",
                  padding: "12px 14px",
                },
              }}
            />
          </Stack>

          {/* Banner Upload (Only in Edit Mode) */}
          {isEdit && goalData && (
            <GoalBannerUpload
              goalID={goalData.goalID}
              bannerImage={goalData.bannerImage}
              onBannerChange={(url) => {
                // Optional: Update local state or trigger refresh if needed
                if (onUpdateSuccess) onUpdateSuccess();
              }}
            />
          )}

          {/* Icon Selection */}
          <Stack gap="12px">
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--text1)",
                letterSpacing: "0.3px",
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
          {isEdit ? "Update Goal" : "Create Goal"}
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
