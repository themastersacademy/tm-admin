"use client";
import {
  Add,
  Close,
  East,
  School,
  PlayCircle,
  AccessTime,
  CheckCircle,
  Cancel,
  MoreVert,
  Search,
  Wallet,
} from "@mui/icons-material";
import {
  Button,
  Chip,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  Grid,
  LinearProgress,
  Box,
  Menu,
  MenuItem,
  CircularProgress,
  Switch,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/apiFetch";
import { useParams } from "next/navigation";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import { useCourses } from "@/src/app/context/CourseProvider";
import { enqueueSnackbar } from "notistack";

export default function StudentCourse() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { courseDetails, loading } = useCourses();

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${id}/get-course-enrollment`
      );
      if (data.success) {
        const enrichedCourses = data.data.map((enrolledCourse) => {
          const matchedCourse = courseDetails?.find(
            (course) => course.courseID === enrolledCourse.courseID
          );
          return {
            ...enrolledCourse,
            title: matchedCourse?.title || enrolledCourse.title,
            thumbnail: matchedCourse?.thumbnail || enrolledCourse.thumbnail,
            lessons: matchedCourse?.lessons || enrolledCourse.lessons || 0,
            description: matchedCourse?.description,
          };
        });
        setCourses(enrichedCourses);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [courseDetails, id]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses, loading]);

  return (
    <Stack gap="32px" padding="24px">
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack>
          <Typography
            sx={{
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--text1)",
              fontFamily: "Lato",
            }}
          >
            Enrolled Courses
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "var(--text3)" }}>
            Manage course access and track progress
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsDialogOpen(true)}
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
            borderRadius: "8px",
          }}
          disableElevation
        >
          Assign Course
        </Button>
      </Stack>

      {/* Course Grid */}
      {isLoading ? (
        <Stack alignItems="center" padding="40px">
          <CircularProgress />
        </Stack>
      ) : courses.length > 0 ? (
        <Grid container spacing={3}>
          {courses.map((course, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <EnrolledCourseCard
                course={course}
                userId={id}
                onUpdate={fetchCourses}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Stack
          minHeight="400px"
          width="100%"
          justifyContent="center"
          alignItems="center"
          sx={{
            backgroundColor: "var(--bg-color)",
            borderRadius: "16px",
            border: "1px dashed var(--border-color)",
          }}
        >
          <School sx={{ fontSize: "48px", color: "var(--text3)", mb: 2 }} />
          <Typography
            sx={{ fontSize: "16px", fontWeight: 600, color: "var(--text2)" }}
          >
            No Courses Enrolled
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "var(--text3)", mt: 1 }}>
            Assign a course to start learning journey.
          </Typography>
        </Stack>
      )}

      <AddCourseDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        userId={id}
        onSuccess={fetchCourses}
      />
    </Stack>
  );
}

const EnrolledCourseCard = ({ course, userId, onUpdate }) => {
  const [isActive, setIsActive] = useState(course.status === "active");
  const [anchorEl, setAnchorEl] = useState(null);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.checked;
    setIsActive(newStatus);
    try {
      await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/update-enrollment-status`,
        {
          method: "POST",
          body: JSON.stringify({
            enrollmentID: course.id,
            isActive: newStatus,
          }),
        }
      );
      enqueueSnackbar("Course status updated", { variant: "success" });
      onUpdate();
    } catch (error) {
      setIsActive(!newStatus);
      enqueueSnackbar("Failed to update status", { variant: "error" });
    }
  };

  // Mock progress for now (random between 10-90 if active)
  const progress = isActive ? Math.floor(Math.random() * 80) + 10 : 0;

  return (
    <Stack
      sx={{
        backgroundColor: "var(--white)",
        borderRadius: "16px",
        border: "1px solid var(--border-color)",
        overflow: "hidden",
        height: "100%",
        transition: "all 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
          borderColor: "var(--primary-color)",
        },
      }}
    >
      {/* Thumbnail Area */}
      <Box
        sx={{
          height: "140px",
          backgroundColor: "var(--bg-color)",
          backgroundImage: `url(${course.thumbnail})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)",
          }}
        />
        <Chip
          label={isActive ? "Active" : "Paused"}
          size="small"
          sx={{
            position: "absolute",
            top: "12px",
            right: "12px",
            backgroundColor: isActive ? "#4CAF50" : "#F44336",
            color: "white",
            fontWeight: 700,
            fontSize: "11px",
            height: "24px",
          }}
        />
      </Box>

      {/* Content */}
      <Stack padding="20px" gap="16px" flex={1}>
        <Stack gap="8px">
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--text1)",
              fontFamily: "Lato",
              lineHeight: 1.4,
              height: "44px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {course.title}
          </Typography>
          <Stack direction="row" gap="12px" alignItems="center">
            <Stack direction="row" gap="4px" alignItems="center">
              <PlayCircle sx={{ fontSize: "14px", color: "var(--text3)" }} />
              <Typography sx={{ fontSize: "12px", color: "var(--text3)" }}>
                {course.lessons} Lessons
              </Typography>
            </Stack>
            <Stack direction="row" gap="4px" alignItems="center">
              <AccessTime sx={{ fontSize: "14px", color: "var(--text3)" }} />
              <Typography sx={{ fontSize: "12px", color: "var(--text3)" }}>
                {course.duration} {course.type === "MONTHLY" ? "Mo" : "Yr"}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        {/* Progress */}
        <Stack gap="6px">
          <Stack direction="row" justifyContent="space-between">
            <Typography
              sx={{ fontSize: "11px", fontWeight: 600, color: "var(--text2)" }}
            >
              Course Progress
            </Typography>
            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--primary-color)",
              }}
            >
              {progress}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: "6px",
              borderRadius: "3px",
              backgroundColor: "var(--bg-color)",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "var(--primary-color)",
                borderRadius: "3px",
              },
            }}
          />
        </Stack>

        {/* Footer Actions */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          pt="16px"
          borderTop="1px solid var(--border-color)"
          mt="auto"
        >
          <Stack direction="row" alignItems="center" gap="8px">
            <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
              Status
            </Typography>
            <StyledSwitch checked={isActive} onChange={handleStatusChange} />
          </Stack>
          <Button
            size="small"
            endIcon={<East />}
            sx={{
              textTransform: "none",
              color: "var(--primary-color)",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            Details
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

const StyledSwitch = ({ checked, onChange }) => (
  <Switch
    checked={checked}
    onChange={onChange}
    size="small"
    sx={{
      width: 36,
      height: 20,
      padding: 0,
      "& .MuiSwitch-switchBase": {
        padding: 0,
        margin: "2px",
        transitionDuration: "300ms",
        "&.Mui-checked": {
          transform: "translateX(16px)",
          color: "#fff",
          "& + .MuiSwitch-track": {
            backgroundColor: "var(--primary-color)",
            opacity: 1,
            border: 0,
          },
          "&.Mui-disabled + .MuiSwitch-track": {
            opacity: 0.5,
          },
        },
        "&.Mui-focusVisible .MuiSwitch-thumb": {
          color: "#33cf4d",
          border: "6px solid #fff",
        },
      },
      "& .MuiSwitch-thumb": {
        boxSizing: "border-box",
        width: 16,
        height: 16,
      },
      "& .MuiSwitch-track": {
        borderRadius: 20 / 2,
        backgroundColor: "#E9E9EA",
        opacity: 1,
        transition: "background-color 500ms",
      },
    }}
  />
);

const AddCourseDialog = ({ isOpen, onClose, userId, onSuccess }) => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/course/get-all`)
        .then((res) => {
          if (res.success) {
            setCourses(res.data);
            setFilteredCourses(res.data);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = courses.filter((course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchQuery, courses]);

  const handleAssign = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/add-course-enrollment`,
        {
          method: "POST",
          body: JSON.stringify({
            courseID: selectedCourse.courseID,
            goalID: selectedCourse.goalID,
            subscriptionPlanIndex: selectedPlanIndex,
          }),
        }
      );
      if (res.success) {
        enqueueSnackbar("Course assigned successfully", { variant: "success" });
        onSuccess();
        onClose();
        setSelectedCourse(null);
        setSelectedPlanIndex(0);
      } else {
        enqueueSnackbar(res.message || "Failed to assign course", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Error assigning course", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = selectedCourse?.subscription?.plans?.[selectedPlanIndex];

  return (
    <DialogBox
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Course to Student"
      customWidth="900px"
      icon={
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      }
      actionButton={
        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={!selectedCourse || loading}
          startIcon={loading ? null : <CheckCircle />}
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
            padding: "10px 24px",
            fontWeight: 600,
          }}
        >
          {loading ? "Assigning..." : "Assign Course"}
        </Button>
      }
    >
      <DialogContent sx={{ padding: 0, overflow: "hidden" }}>
        <Stack>
          {/* Header Section with Info */}
          <Box
            sx={{
              padding: "20px 24px",
              backgroundColor: "#F8F9FA",
              borderBottom: "1px solid #E0E0E0",
            }}
          >
            <Stack gap="12px">
              <Typography
                sx={{ fontSize: "13px", color: "#616161", lineHeight: 1.5 }}
              >
                Select a course from the list below and choose a subscription
                plan to assign to the student.
              </Typography>

              {/* Search Bar */}
              <Box
                sx={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E0E0E0",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Search sx={{ fontSize: "20px", color: "#9E9E9E" }} />
                <input
                  placeholder="Search courses by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    fontSize: "14px",
                    width: "100%",
                    color: "#212121",
                    fontFamily: "inherit",
                  }}
                />
                {searchQuery && (
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery("")}
                    sx={{ padding: "4px" }}
                  >
                    <Close sx={{ fontSize: "18px" }} />
                  </IconButton>
                )}
              </Box>
            </Stack>
          </Box>

          {/* Main Content - Two Column Layout */}
          <Stack direction="row" sx={{ height: "500px" }}>
            {/* Left: Course List */}
            <Box
              sx={{
                width: "60%",
                borderRight: "1px solid #E0E0E0",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #E0E0E0",
                  backgroundColor: "#FAFAFA",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#757575",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Available Courses ({filteredCourses.length})
                </Typography>
              </Box>

              <Stack
                gap="0"
                sx={{
                  overflowY: "auto",
                  flex: 1,
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "#F5F5F5",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#BDBDBD",
                    borderRadius: "3px",
                  },
                }}
              >
                {filteredCourses.length === 0 ? (
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    sx={{ height: "100%", padding: "40px 20px" }}
                  >
                    <Typography sx={{ color: "#9E9E9E", fontSize: "14px" }}>
                      No courses found
                    </Typography>
                  </Stack>
                ) : (
                  filteredCourses.map((course) => {
                    const isSelected =
                      selectedCourse?.courseID === course.courseID;
                    return (
                      <Stack
                        key={course.courseID}
                        onClick={() => {
                          setSelectedCourse(course);
                          setSelectedPlanIndex(0);
                        }}
                        sx={{
                          padding: "16px 20px",
                          borderBottom: "1px solid #F0F0F0",
                          backgroundColor: isSelected ? "#E3F2FD" : "#FFFFFF",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          position: "relative",
                          "&:hover": {
                            backgroundColor: isSelected ? "#E3F2FD" : "#F5F5F5",
                          },
                        }}
                      >
                        {isSelected && (
                          <Box
                            sx={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: "4px",
                              backgroundColor: "#2196F3",
                            }}
                          />
                        )}

                        <Stack
                          direction="row"
                          gap="14px"
                          alignItems="flex-start"
                        >
                          <Box
                            sx={{
                              width: "60px",
                              height: "60px",
                              borderRadius: "8px",
                              backgroundImage: `url(${course.thumbnail})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              backgroundColor: "#F5F5F5",
                              border: "1px solid #E0E0E0",
                              flexShrink: 0,
                            }}
                          />
                          <Stack flex={1} gap="6px">
                            <Typography
                              sx={{
                                fontWeight: 600,
                                color: isSelected ? "#1976D2" : "#212121",
                                fontSize: "14px",
                                lineHeight: 1.4,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {course.title}
                            </Typography>
                            <Stack
                              direction="row"
                              gap="12px"
                              alignItems="center"
                              flexWrap="wrap"
                            >
                              <Stack
                                direction="row"
                                gap="4px"
                                alignItems="center"
                              >
                                <PlayCircle
                                  sx={{ fontSize: "14px", color: "#757575" }}
                                />
                                <Typography
                                  sx={{ fontSize: "12px", color: "#757575" }}
                                >
                                  {course.lessons} Lessons
                                </Typography>
                              </Stack>
                              <Stack
                                direction="row"
                                gap="4px"
                                alignItems="center"
                              >
                                <Wallet
                                  sx={{ fontSize: "14px", color: "#757575" }}
                                />
                                <Typography
                                  sx={{ fontSize: "12px", color: "#757575" }}
                                >
                                  {course.subscription?.plans?.length || 0}{" "}
                                  Plans
                                </Typography>
                              </Stack>
                              <Typography
                                sx={{
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  color: "#2E7D32",
                                  marginLeft: "4px",
                                }}
                              >
                                {course.subscription?.plans?.[0]?.priceWithTax
                                  ? `₹${course.subscription.plans[0].priceWithTax}`
                                  : "Free"}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Stack>
                    );
                  })
                )}
              </Stack>
            </Box>

            {/* Right: Selected Course Details */}
            <Box
              sx={{
                width: "40%",
                backgroundColor: "#FAFAFA",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {!selectedCourse ? (
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    height: "100%",
                    padding: "40px 20px",
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      backgroundColor: "#E3F2FD",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <School sx={{ fontSize: "40px", color: "#2196F3" }} />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#424242",
                      marginBottom: "6px",
                    }}
                  >
                    No Course Selected
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#9E9E9E" }}>
                    Select a course to view details
                  </Typography>
                </Stack>
              ) : (
                <Stack sx={{ height: "100%", overflow: "auto" }}>
                  {/* Course Header */}
                  <Box
                    sx={{
                      padding: "20px",
                      backgroundColor: "#FFFFFF",
                      borderBottom: "1px solid #E0E0E0",
                    }}
                  >
                    <Stack gap="12px">
                      <Box
                        sx={{
                          width: "100%",
                          height: "140px",
                          borderRadius: "8px",
                          backgroundImage: `url(${selectedCourse.thumbnail})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundColor: "#F5F5F5",
                          border: "1px solid #E0E0E0",
                        }}
                      />
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: "#212121",
                          fontSize: "15px",
                          lineHeight: 1.4,
                        }}
                      >
                        {selectedCourse.title}
                      </Typography>
                      <Stack direction="row" gap="16px" flexWrap="wrap">
                        <Stack direction="row" gap="6px" alignItems="center">
                          <PlayCircle
                            sx={{ fontSize: "16px", color: "#2196F3" }}
                          />
                          <Typography
                            sx={{
                              fontSize: "13px",
                              color: "#616161",
                              fontWeight: 500,
                            }}
                          >
                            {selectedCourse.lessons} Lessons
                          </Typography>
                        </Stack>
                        <Stack direction="row" gap="6px" alignItems="center">
                          <AccessTime
                            sx={{ fontSize: "16px", color: "#2196F3" }}
                          />
                          <Typography
                            sx={{
                              fontSize: "13px",
                              color: "#616161",
                              fontWeight: 500,
                            }}
                          >
                            {selectedCourse.duration || "N/A"}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Box>

                  {/* Plan Selection */}
                  {selectedCourse.subscription?.plans &&
                  selectedCourse.subscription.plans.length > 0 ? (
                    <Box sx={{ padding: "20px" }}>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#424242",
                          marginBottom: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Select Subscription Plan
                      </Typography>
                      <Stack gap="10px">
                        {selectedCourse.subscription.plans.map((plan, idx) => {
                          const isSelectedPlan = selectedPlanIndex === idx;
                          return (
                            <Stack
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPlanIndex(idx);
                              }}
                              sx={{
                                border: isSelectedPlan
                                  ? "2px solid #2196F3"
                                  : "1px solid #E0E0E0",
                                borderRadius: "8px",
                                padding: "14px",
                                backgroundColor: isSelectedPlan
                                  ? "#E3F2FD"
                                  : "#FFFFFF",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                position: "relative",
                                "&:hover": {
                                  borderColor: "#2196F3",
                                  boxShadow:
                                    "0 2px 8px rgba(33, 150, 243, 0.15)",
                                },
                              }}
                            >
                              {isSelectedPlan && (
                                <Box
                                  sx={{
                                    position: "absolute",
                                    top: "8px",
                                    right: "8px",
                                    color: "#2196F3",
                                  }}
                                >
                                  <CheckCircle sx={{ fontSize: "20px" }} />
                                </Box>
                              )}
                              <Stack gap="6px">
                                <Typography
                                  sx={{
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    color: isSelectedPlan
                                      ? "#1976D2"
                                      : "#212121",
                                  }}
                                >
                                  {plan.duration}{" "}
                                  {plan.type === "MONTHLY" ? "Month" : "Year"}
                                  {plan.duration > 1 ? "s" : ""}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "20px",
                                    fontWeight: 700,
                                    color: isSelectedPlan
                                      ? "#2196F3"
                                      : "#424242",
                                  }}
                                >
                                  ₹{plan.priceWithTax}
                                </Typography>
                                <Typography
                                  sx={{ fontSize: "11px", color: "#757575" }}
                                >
                                  {plan.type === "MONTHLY"
                                    ? "Per Month"
                                    : "Per Year"}
                                </Typography>
                              </Stack>
                            </Stack>
                          );
                        })}
                      </Stack>

                      {/* Summary */}
                      {selectedPlan && (
                        <Box
                          sx={{
                            marginTop: "16px",
                            padding: "14px",
                            backgroundColor: "#FFF3E0",
                            borderRadius: "8px",
                            border: "1px solid #FFE0B2",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "#E65100",
                              marginBottom: "6px",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Summary
                          </Typography>
                          <Stack gap="4px">
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography
                                sx={{ fontSize: "12px", color: "#6D4C41" }}
                              >
                                Duration:
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  color: "#6D4C41",
                                }}
                              >
                                {selectedPlan.duration}{" "}
                                {selectedPlan.type === "MONTHLY"
                                  ? "Month"
                                  : "Year"}
                                {selectedPlan.duration > 1 ? "s" : ""}
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography
                                sx={{ fontSize: "12px", color: "#6D4C41" }}
                              >
                                Total Amount:
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  color: "#E65100",
                                }}
                              >
                                ₹{selectedPlan.priceWithTax}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ padding: "20px" }}>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          color: "#9E9E9E",
                          textAlign: "center",
                        }}
                      >
                        No subscription plans available
                      </Typography>
                    </Box>
                  )}
                </Stack>
              )}
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
    </DialogBox>
  );
};
