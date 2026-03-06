"use client";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import {
  Dialog,
  DialogContent,
  Stack,
  Typography,
  Button,
  IconButton,
  Box,
} from "@mui/material";
import gatecse_img from "@/public/Icons/gate_cse.svg";
import placements_img from "@/public/Icons/placements.svg";
import banking_img from "@/public/Icons/banking.svg";
import { useState, useEffect } from "react";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/src/lib/apiFetch";
import { Close, ArrowForward } from "@mui/icons-material";
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
          body: JSON.stringify({ title, icon, tagline, description }),
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
          body: JSON.stringify({ title, icon, tagline, description }),
        },
        showSnackbar
      ).then((data) => {
        if (data.success) {
          showSnackbar(data.message, "success", "", "3000");
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
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          maxWidth: "480px",
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        padding="16px 20px"
        sx={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <Typography
          sx={{
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--text1)",
          }}
        >
          {isEdit ? "Edit Goal" : "Create New Goal"}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ width: 28, height: 28 }}>
          <Close sx={{ fontSize: "16px" }} />
        </IconButton>
      </Stack>

      <DialogContent sx={{ padding: "20px" }}>
        <Stack gap="16px">
          {/* Title */}
          <Stack gap="6px">
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "var(--text2)" }}>
              Goal Title *
            </Typography>
            <StyledTextField
              placeholder="e.g., GATE CSE 2025, Banking Prep"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "13px",
                  height: "38px",
                  borderRadius: "8px",
                },
              }}
            />
          </Stack>

          {/* Tagline */}
          <Stack gap="6px">
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "var(--text2)" }}>
              Tagline
            </Typography>
            <StyledTextField
              placeholder="A short catchy phrase"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "13px",
                  height: "38px",
                  borderRadius: "8px",
                },
              }}
            />
          </Stack>

          {/* Description */}
          <Stack gap="6px">
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "var(--text2)" }}>
              Description
            </Typography>
            <StyledTextField
              placeholder="Overview of what this goal covers..."
              value={description}
              multiline
              rows={3}
              onChange={(e) => setDescription(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "auto",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  alignItems: "flex-start",
                  padding: "10px 12px",
                  borderRadius: "8px",
                },
              }}
            />
          </Stack>

          {/* Banner Upload (Edit Mode) */}
          {isEdit && goalData && (
            <GoalBannerUpload
              goalID={goalData.goalID}
              bannerImage={goalData.bannerImage}
              onBannerChange={(url) => {
                if (onUpdateSuccess) onUpdateSuccess();
              }}
            />
          )}

          {/* Icon Selection */}
          <Stack gap="8px">
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "var(--text2)" }}>
              Select Icon *
            </Typography>
            <Stack direction="row" gap="10px" justifyContent="center">
              <IconCard
                iconSrc={gatecse_img.src}
                icon={icon}
                value="castle"
                label="Engineering"
                onIconSelect={setIcon}
              />
              <IconCard
                iconSrc={placements_img.src}
                icon={icon}
                value="org"
                label="Placements"
                onIconSelect={setIcon}
              />
              <IconCard
                iconSrc={banking_img.src}
                icon={icon}
                value="bank"
                label="Banking"
                onIconSelect={setIcon}
              />
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>

      {/* Footer */}
      <Stack
        direction="row"
        justifyContent="flex-end"
        gap="8px"
        padding="12px 20px 16px"
        sx={{ borderTop: "1px solid var(--border-color)" }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            padding: "6px 16px",
            fontWeight: 600,
            fontSize: "12px",
            height: "34px",
            borderColor: "var(--border-color)",
            color: "var(--text2)",
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={OnGoalCreate}
          endIcon={<ArrowForward sx={{ fontSize: "14px" }} />}
          disabled={!title || !icon}
          disableElevation
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            padding: "6px 16px",
            fontWeight: 600,
            fontSize: "12px",
            height: "34px",
            backgroundColor: "var(--primary-color)",
            "&:hover": {
              backgroundColor: "var(--primary-color-dark)",
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
      gap="6px"
      alignItems="center"
      sx={{
        width: "120px",
        padding: "14px 12px",
        backgroundColor: isActive
          ? "var(--primary-color-acc-2)"
          : "var(--bg-color, #fafafa)",
        borderRadius: "10px",
        border: `2px solid ${isActive ? "var(--primary-color)" : "var(--border-color)"}`,
        cursor: "pointer",
        transition: "all 0.15s ease",
        "&:hover": {
          borderColor: "var(--primary-color)",
        },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isActive
            ? "var(--primary-color)"
            : "var(--primary-color-acc-2)",
          borderRadius: "10px",
          transition: "all 0.15s ease",
        }}
      >
        <Image
          src={iconSrc}
          alt={label}
          width={22}
          height={24}
          style={{
            filter: isActive ? "brightness(0) invert(1)" : "none",
          }}
        />
      </Box>
      <Typography
        sx={{
          fontSize: "11px",
          fontWeight: 600,
          color: isActive ? "var(--primary-color)" : "var(--text3)",
          textAlign: "center",
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
};
