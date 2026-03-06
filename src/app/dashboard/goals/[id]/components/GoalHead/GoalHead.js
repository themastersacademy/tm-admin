"use client";
import React from "react";
import {
  Button,
  CircularProgress,
  Skeleton,
  Stack,
  Typography,
  Chip,
  Breadcrumbs,
  Link,
  IconButton,
  Box,
} from "@mui/material";
import Image from "next/image";
import gate_cse from "@/public/Icons/gate_cse.svg";
import placements from "@/public/Icons/placements.svg";
import banking from "@/public/Icons/banking.svg";
import {
  ArrowBack,
  Home,
  School,
  MenuBook,
  Article,
  Edit,
} from "@mui/icons-material";
import GoalDialogBox from "../GoalDialogBox/GoalDialogBox";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { useState } from "react";

export default function GoalHead({ goal, goalLoading, fetchGoal }) {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleLive = () => {
    setIsLoading(true);
    try {
      apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/goals/${goal.goalID}/live-unlive`
      ).then((data) => {
        if (data.success) {
          showSnackbar(data.message, "success", "", "3000");
          fetchGoal();
        } else {
          showSnackbar(data.message, "error", "", "3000");
        }
        setIsLoading(false);
      });
    } catch (error) {
      setIsLoading(false);
    }
  };

  const coursesCount = goal?.coursesList?.length || 0;
  const subjectsCount = goal?.subjectList?.length || 0;
  const blogsCount = goal?.blogList?.length || 0;

  return (
    <>
      {/* Breadcrumb Bar */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          backgroundColor: "var(--white)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "12px 20px",
        }}
      >
        <Stack direction="row" alignItems="center" gap="10px">
          <IconButton
            onClick={() => router.back()}
            sx={{
              width: 30,
              height: 30,
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "var(--primary-color)",
                borderColor: "var(--primary-color)",
                "& svg": { color: "#fff" },
              },
            }}
          >
            <ArrowBack sx={{ fontSize: "16px", color: "var(--text2)", transition: "color 0.2s" }} />
          </IconButton>
          <Breadcrumbs
            separator="›"
            sx={{
              fontSize: "13px",
              "& .MuiBreadcrumbs-separator": { color: "var(--text4)" },
            }}
          >
            <Link
              underline="hover"
              color="inherit"
              href="/dashboard"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: "var(--text4)",
                fontSize: "12px",
                "&:hover": { color: "var(--primary-color)" },
              }}
            >
              <Home sx={{ fontSize: "14px" }} />
              Dashboard
            </Link>
            <Typography
              sx={{ fontSize: "12px", color: "var(--text1)", fontWeight: 600 }}
            >
              {goalLoading ? (
                <Skeleton variant="text" width={100} height={18} />
              ) : (
                goal.title || "Goal"
              )}
            </Typography>
          </Breadcrumbs>
        </Stack>

        <Button
          variant="contained"
          onClick={handleLive}
          disabled={isLoading || goalLoading}
          disableElevation
          sx={{
            textTransform: "none",
            backgroundColor: goal.isLive ? "#FF9800" : "#4CAF50",
            color: "#fff",
            borderRadius: "8px",
            padding: "6px 16px",
            fontWeight: 600,
            fontSize: "12px",
            height: "34px",
            "&:hover": {
              backgroundColor: goal.isLive ? "#F57C00" : "#388E3C",
            },
            "&:disabled": {
              backgroundColor: "#9E9E9E",
              color: "#fff",
            },
          }}
        >
          {isLoading ? (
            <CircularProgress size={16} sx={{ color: "white" }} />
          ) : goal.isLive ? (
            "Set to Draft"
          ) : (
            "Publish Goal"
          )}
        </Button>
      </Stack>

      {/* Banner Image */}
      {goal.bannerImage && (
        <Stack
          sx={{
            width: "100%",
            position: "relative",
            paddingBottom: "25%",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-color)",
          }}
        >
          <img
            src={goal.bannerImage}
            alt="Goal Banner"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </Stack>
      )}

      {/* Main Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          backgroundColor: "var(--white)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "16px 20px",
        }}
      >
        <Stack direction="row" alignItems="center" gap="12px">
          {/* Icon */}
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "10px",
              backgroundColor: "var(--primary-color-acc-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(24, 113, 99, 0.15)",
              flexShrink: 0,
            }}
          >
            {goalLoading ? (
              <Skeleton variant="rounded" width={22} height={24} />
            ) : (
              <Image
                src={
                  goal.icon === "castle"
                    ? gate_cse.src
                    : goal.icon === "org"
                    ? placements.src
                    : banking.src
                }
                alt="icon"
                width={22}
                height={24}
              />
            )}
          </Box>

          {/* Title + Status */}
          <Stack>
            <Stack direction="row" alignItems="center" gap="8px">
              {goalLoading ? (
                <Skeleton variant="text" width={200} height={24} />
              ) : (
                <>
                  <Typography
                    sx={{
                      fontFamily: "Lato",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "var(--text1)",
                    }}
                  >
                    {goal.title || "Goal"}
                  </Typography>
                  <Chip
                    label={goal.isLive ? "Published" : "Draft"}
                    size="small"
                    sx={{
                      height: "20px",
                      fontSize: "10px",
                      fontWeight: 700,
                      backgroundColor: goal.isLive
                        ? "rgba(76, 175, 80, 0.08)"
                        : "rgba(0, 0, 0, 0.04)",
                      color: goal.isLive ? "#4CAF50" : "#9E9E9E",
                      border: `1px solid ${goal.isLive ? "#4caf5030" : "#00000015"}`,
                      "& .MuiChip-label": { padding: "0 6px" },
                    }}
                  />
                  <IconButton
                    onClick={() => setIsEditDialogOpen(true)}
                    size="small"
                    sx={{
                      width: 24,
                      height: 24,
                      border: "1px solid var(--border-color)",
                      borderRadius: "6px",
                      "&:hover": {
                        backgroundColor: "var(--primary-color)",
                        borderColor: "var(--primary-color)",
                        "& svg": { color: "#fff" },
                      },
                    }}
                  >
                    <Edit sx={{ fontSize: "12px", color: "var(--text3)", transition: "color 0.15s" }} />
                  </IconButton>
                </>
              )}
            </Stack>
            {goalLoading ? (
              <Skeleton variant="text" width={250} height={16} />
            ) : (
              <Stack direction="row" alignItems="center" gap="12px">
                {goal.tagline && (
                  <Typography sx={{ fontSize: "12px", color: "var(--text3)", fontStyle: "italic" }}>
                    {goal.tagline}
                  </Typography>
                )}
                <Stack direction="row" alignItems="center" gap="4px">
                  <School sx={{ fontSize: "12px", color: "var(--primary-color)" }} />
                  <Typography sx={{ fontSize: "12px", color: "var(--text4)" }}>
                    {coursesCount} courses
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap="4px">
                  <MenuBook sx={{ fontSize: "12px", color: "#4CAF50" }} />
                  <Typography sx={{ fontSize: "12px", color: "var(--text4)" }}>
                    {subjectsCount} subjects
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap="4px">
                  <Article sx={{ fontSize: "12px", color: "#2196F3" }} />
                  <Typography sx={{ fontSize: "12px", color: "var(--text4)" }}>
                    {blogsCount} blogs
                  </Typography>
                </Stack>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>

      <GoalDialogBox
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        isEdit={true}
        goalData={goal}
        onUpdateSuccess={fetchGoal}
      />
    </>
  );
}
