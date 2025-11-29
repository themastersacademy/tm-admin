"use client";
import { useState, useEffect } from "react";
import {
  Stack,
  Typography,
  Button,
  Checkbox,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Box,
} from "@mui/material";
import {
  Save,
  Refresh,
  CheckCircle,
  RadioButtonUnchecked,
} from "@mui/icons-material";
import { apiFetch } from "@/src/lib/apiFetch";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";

export default function FeaturedGoalsManagement() {
  const { showSnackbar } = useSnackbar();
  const [goals, setGoals] = useState([]);
  const [featuredGoalIDs, setFeaturedGoalIDs] = useState([]);
  const [originalFeaturedGoalIDs, setOriginalFeaturedGoalIDs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const [goalsData, featuredData] = await Promise.all([
        apiFetch("/api/goals/get-all-goals"),
        apiFetch("/api/homepage/featured-goals"),
      ]);

      if (goalsData.success) {
        setGoals(goalsData.data.goals);
      }
      if (featuredData.success) {
        const featuredIDs = featuredData.data.featuredGoalIDs;
        setFeaturedGoalIDs(featuredIDs);
        setOriginalFeaturedGoalIDs(featuredIDs);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showSnackbar("Error loading data", "error", "", "3000");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (goalID) => {
    setFeaturedGoalIDs((prev) =>
      prev.includes(goalID)
        ? prev.filter((id) => id !== goalID)
        : [...prev, goalID]
    );
  };

  const hasChanges = () => {
    if (featuredGoalIDs.length !== originalFeaturedGoalIDs.length) {
      return true;
    }
    const sortedCurrent = [...featuredGoalIDs].sort();
    const sortedOriginal = [...originalFeaturedGoalIDs].sort();
    return !sortedCurrent.every((id, index) => id === sortedOriginal[index]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = await apiFetch("/api/homepage/featured-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featuredGoalIDs }),
      });

      if (data.success) {
        setOriginalFeaturedGoalIDs(featuredGoalIDs);
        showSnackbar(
          "Featured goals updated successfully",
          "success",
          "",
          "3000"
        );
      } else {
        showSnackbar(data.message, "error", "", "3000");
      }
    } catch (error) {
      console.error("Error saving:", error);
      showSnackbar("Error saving changes", "error", "", "3000");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  if (isLoading) {
    return (
      <Stack alignItems="center" padding="40px">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack gap="24px">
      {/* Header Section with Info */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        padding="20px 24px"
        sx={{
          background:
            "linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(245, 124, 0, 0.02) 100%)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 152, 0, 0.15)",
        }}
      >
        <Stack gap="8px">
          <Stack direction="row" alignItems="center" gap="12px">
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--text1)",
              }}
            >
              Featured Goals
            </Typography>
            <Stack
              sx={{
                backgroundColor: "rgba(255, 152, 0, 0.12)",
                padding: "4px 12px",
                borderRadius: "20px",
                border: "1px solid rgba(255, 152, 0, 0.25)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#FF9800",
                }}
              >
                {featuredGoalIDs.length} Selected
              </Typography>
            </Stack>
          </Stack>
          <Typography sx={{ fontSize: "13px", color: "var(--text3)" }}>
            Select goals to showcase on the user app home page
          </Typography>
        </Stack>

        <Stack direction="row" gap="12px">
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchGoals}
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              padding: "10px 20px",
              fontWeight: 600,
              fontSize: "14px",
              borderColor: "var(--border-color)",
              color: "var(--text2)",
              height: "48px",
              "&:hover": {
                borderColor: "#FF9800",
                backgroundColor: "rgba(255, 152, 0, 0.04)",
              },
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={isSaving || !hasChanges()}
            sx={{
              background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
              color: "#FFFFFF",
              textTransform: "none",
              borderRadius: "10px",
              padding: "10px 24px",
              fontWeight: 700,
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(255, 152, 0, 0.25)",
              minWidth: "140px",
              height: "48px",
              "&:hover": {
                background: "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
                boxShadow: "0 6px 16px rgba(255, 152, 0, 0.35)",
                transform: "translateY(-1px)",
              },
              "&:disabled": {
                background: "var(--border-color)",
                color: "var(--text3)",
                boxShadow: "none",
              },
            }}
            disableElevation
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </Stack>
      </Stack>

      {/* Goals List */}
      {goals.length > 0 ? (
        <Stack direction="row" gap="12px" flexWrap="wrap">
          {goals.map((goal) => {
            const isSelected = featuredGoalIDs.includes(goal.goalID);
            return (
              <Card
                key={goal.goalID}
                sx={{
                  flex: "1 1 calc(33.333% - 12px)", // 3 cards per row
                  minWidth: "300px",
                  maxWidth: "100%",
                  border: isSelected
                    ? "2px solid #FF9800"
                    : "1px solid var(--border-color)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  backgroundColor: isSelected
                    ? "rgba(255, 152, 0, 0.02)"
                    : "var(--white)",
                  "&:hover": {
                    boxShadow: isSelected
                      ? "0 4px 12px rgba(255, 152, 0, 0.15)"
                      : "0 2px 8px rgba(0,0,0,0.06)",
                    transform: "translateY(-1px)",
                    borderColor: isSelected
                      ? "#F57C00"
                      : "rgba(255, 152, 0, 0.3)",
                  },
                }}
                onClick={() => handleToggle(goal.goalID)}
                elevation={0}
              >
                <CardContent
                  sx={{
                    padding: "8px 12px",
                    "&:last-child": { paddingBottom: "8px" },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    gap="12px"
                  >
                    {/* Left Section: Checkbox + Content */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      gap="10px"
                      flex={1}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggle(goal.goalID)}
                        onClick={(e) => e.stopPropagation()}
                        icon={
                          <RadioButtonUnchecked
                            sx={{
                              fontSize: "18px",
                              color: "var(--border-color)",
                            }}
                          />
                        }
                        checkedIcon={
                          <CheckCircle
                            sx={{ fontSize: "18px", color: "#FF9800" }}
                          />
                        }
                        sx={{
                          padding: 0,
                          "&:hover": {
                            backgroundColor: "transparent",
                          },
                        }}
                      />
                      <Stack gap="2px" flex={1}>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: "13px",
                            color: isSelected ? "#FF9800" : "var(--text1)",
                            letterSpacing: "0.2px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {goal.title}
                        </Typography>
                        <Stack direction="row" alignItems="center" gap="8px">
                          <Typography
                            sx={{
                              fontSize: "11px",
                              color: "var(--text3)",
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                          >
                            <Box
                              component="span"
                              sx={{
                                fontWeight: 600,
                                color: isSelected ? "#FF9800" : "var(--text2)",
                              }}
                            >
                              {goal.coursesCount || 0}
                            </Box>
                            courses
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "11px",
                              color: "var(--text3)",
                            }}
                          >
                            •
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "11px",
                              color: "var(--text3)",
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                          >
                            <Box
                              component="span"
                              sx={{
                                fontWeight: 600,
                                color: isSelected ? "#FF9800" : "var(--text2)",
                              }}
                            >
                              {goal.subjectsCount || 0}
                            </Box>
                            subjects
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>

                    {/* Right Section: Status Badge */}
                    <Chip
                      label={goal.isLive ? "Live" : "Draft"}
                      size="small"
                      sx={{
                        fontSize: "10px",
                        fontWeight: 600,
                        height: "20px",
                        borderRadius: "4px",
                        backgroundColor: goal.isLive
                          ? "rgba(76, 175, 80, 0.12)"
                          : "rgba(158, 158, 158, 0.12)",
                        color: goal.isLive ? "#4CAF50" : "#757575",
                        border: `1px solid ${
                          goal.isLive
                            ? "rgba(76, 175, 80, 0.3)"
                            : "rgba(158, 158, 158, 0.3)"
                        }`,
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      ) : (
        <Stack sx={{ minHeight: "300px" }}>
          <NoDataFound info="No goals available" />
        </Stack>
      )}
    </Stack>
  );
}
