"use client";
import {
  Button,
  CircularProgress,
  Skeleton,
  Stack,
  Typography,
  Chip,
  Divider,
  Breadcrumbs,
  Link,
} from "@mui/material";
import Image from "next/image";
import gate_cse from "@/public/Icons/gate_cse.svg";
import placements from "@/public/Icons/placements.svg";
import banking from "@/public/Icons/banking.svg";
import {
  ArrowBackIosRounded,
  Home,
  School,
  MenuBook,
  Article,
  Quiz,
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

  // Calculate stats
  const coursesCount = goal?.coursesList?.length || 0;
  const subjectsCount = goal?.subjectList?.length || 0;
  const blogsCount = goal?.blogList?.length || 0;

  return (
    <Stack
      sx={{
        backgroundColor: "var(--white)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Top Section: Breadcrumbs & Actions */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        padding="16px 24px"
        sx={{
          borderBottom: "1px solid var(--border-color)",
          backgroundColor: "#F8F9FA",
        }}
      >
        {/* Breadcrumbs */}
        <Stack direction="row" alignItems="center" gap="12px">
          <ArrowBackIosRounded
            onClick={() => router.back()}
            sx={{
              fontSize: "18px",
              cursor: "pointer",
              color: "var(--text3)",
              "&:hover": {
                color: "var(--primary-color)",
              },
            }}
          />
          <Breadcrumbs
            separator="›"
            sx={{
              fontSize: "13px",
              "& .MuiBreadcrumbs-separator": {
                color: "var(--text3)",
              },
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
                color: "var(--text3)",
                fontSize: "13px",
                cursor: "pointer",
                "&:hover": {
                  color: "var(--primary-color)",
                },
              }}
            >
              <Home sx={{ fontSize: "16px" }} />
              Dashboard
            </Link>
            <Typography
              sx={{ fontSize: "13px", color: "var(--text2)", fontWeight: 600 }}
            >
              {goalLoading ? (
                <Skeleton variant="text" width="80px" height="20px" />
              ) : (
                goal.title || "Goal"
              )}
            </Typography>
          </Breadcrumbs>
        </Stack>

        {/* Publish/Draft Button */}
        <Button
          variant="contained"
          onClick={handleLive}
          disabled={isLoading || goalLoading}
          sx={{
            textTransform: "none",
            backgroundColor: goal.isLive ? "#FFA726" : "#4CAF50",
            color: "#FFFFFF",
            borderRadius: "8px",
            padding: "8px 24px",
            fontWeight: 600,
            fontSize: "13px",
            minWidth: "120px",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: goal.isLive ? "#FB8C00" : "#43A047",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            },
            "&:disabled": {
              backgroundColor: "#9E9E9E",
              color: "#FFFFFF",
            },
          }}
          disableElevation
        >
          {isLoading ? (
            <CircularProgress size={20} sx={{ color: "white" }} />
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
            paddingBottom: "33.33%", // 3:1 aspect ratio (1200/400 = 3)
            borderBottom: "1px solid var(--border-color)",
            overflow: "hidden",
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

      {/* Main Section: Title & Icon */}
      <Stack padding="24px 24px 20px 24px" gap="16px">
        <Stack direction="row" alignItems="flex-start" gap="20px">
          {/* Icon */}
          <Stack
            sx={{
              width: "64px",
              height: "64px",
              backgroundColor: "var(--bg-color)",
              borderRadius: "16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "1px solid var(--border-color)",
              flexShrink: 0,
            }}
          >
            {goalLoading ? (
              <Skeleton variant="circular" width={32} height={32} />
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
                width="32"
                height="36"
              />
            )}
          </Stack>

          {/* Title & Status */}
          <Stack flex={1} gap="8px">
            <Stack direction="row" alignItems="center" gap="12px">
              {goalLoading ? (
                <Skeleton variant="text" width="200px" height="32px" />
              ) : (
                <Typography
                  sx={{
                    fontFamily: "Lato",
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "var(--text1)",
                  }}
                >
                  {goal.title || "Goal not found"}
                </Typography>
              )}
              {!goalLoading && (
                <Stack direction="row" gap="8px" alignItems="center">
                  <Chip
                    label={goal.isLive ? "Published" : "Draft"}
                    size="small"
                    sx={{
                      backgroundColor: goal.isLive
                        ? "rgba(76, 175, 80, 0.1)"
                        : "rgba(158, 158, 158, 0.1)",
                      color: goal.isLive
                        ? "var(--success-color)"
                        : "var(--text3)",
                      fontWeight: 700,
                      fontSize: "11px",
                      height: "24px",
                    }}
                  />
                  <Stack
                    onClick={() => setIsEditDialogOpen(true)}
                    sx={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: "var(--bg-color)",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      border: "1px solid var(--border-color)",
                      "&:hover": {
                        backgroundColor: "var(--primary-color)",
                        borderColor: "var(--primary-color)",
                        "& svg": {
                          color: "white",
                        },
                      },
                    }}
                  >
                    <Edit
                      sx={{
                        fontSize: "14px",
                        color: "var(--text3)",
                        transition: "all 0.2s ease",
                      }}
                    />
                  </Stack>
                </Stack>
              )}
            </Stack>
            {goal.tagline && (
              <Typography
                sx={{
                  fontSize: "14px",
                  color: "var(--text2)",
                  fontStyle: "italic",
                }}
              >
                {goal.tagline}
              </Typography>
            )}
            <Typography sx={{ fontSize: "13px", color: "var(--text3)" }}>
              {goalLoading ? (
                <Skeleton variant="text" width="300px" />
              ) : (
                `Manage courses, subjects, blogs, and exams for this goal`
              )}
            </Typography>
          </Stack>
        </Stack>

        {/* Stats Cards */}
        <Stack direction="row" gap="16px" marginTop="8px" flexWrap="wrap">
          <StatCard
            icon={<School />}
            label="Courses"
            value={coursesCount}
            color="#2196F3"
            isLoading={goalLoading}
          />
          <StatCard
            icon={<MenuBook />}
            label="Subjects"
            value={subjectsCount}
            color="#9C27B0"
            isLoading={goalLoading}
          />
          <StatCard
            icon={<Article />}
            label="Blogs"
            value={blogsCount}
            color="#FF9800"
            isLoading={goalLoading}
          />
        </Stack>
      </Stack>
      <GoalDialogBox
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        isEdit={true}
        goalData={goal}
        onUpdateSuccess={fetchGoal}
      />
    </Stack>
  );
}

// Stat Card Component
const StatCard = ({ icon, label, value, color, isLoading }) => (
  <Stack
    direction="row"
    alignItems="center"
    gap="12px"
    padding="12px 16px"
    sx={{
      backgroundColor: "var(--bg-color)",
      borderRadius: "10px",
      border: "1px solid var(--border-color)",
      minWidth: "140px",
    }}
  >
    <Stack
      sx={{
        width: "36px",
        height: "36px",
        backgroundColor: "var(--white)",
        borderRadius: "8px",
        justifyContent: "center",
        alignItems: "center",
        border: `1px solid ${color}20`,
      }}
    >
      {icon &&
        React.cloneElement(icon, {
          sx: { fontSize: "20px", color: color },
        })}
    </Stack>
    <Stack gap="2px">
      <Typography
        sx={{
          fontSize: "11px",
          color: "var(--text3)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </Typography>
      {isLoading ? (
        <Skeleton variant="text" width="30px" height="24px" />
      ) : (
        <Typography
          sx={{
            fontSize: "20px",
            fontWeight: 800,
            color: "var(--text1)",
            fontFamily: "Lato",
            lineHeight: 1,
          }}
        >
          {value}
        </Typography>
      )}
    </Stack>
  </Stack>
);

// Import React for cloneElement
import React from "react";
