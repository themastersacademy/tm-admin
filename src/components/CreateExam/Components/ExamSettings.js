"use client";
import {
  Stack,
  Tooltip,
  Typography,
  CircularProgress,
  Card,
  Divider,
  Box,
  Chip,
  Slider,
} from "@mui/material";
import {
  Title as TitleIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
  Group as GroupIcon,
  Info as InfoIcon,
  CheckCircle,
} from "@mui/icons-material";
import StyledTextField from "../../StyledTextField/StyledTextField";
import StyledSwitch from "../../StyledSwitch/StyledSwitch";
import { useState } from "react";
import { useSnackbar } from "@/src/app/context/SnackbarContext";
import { apiFetch } from "@/src/lib/apiFetch";
import { useParams } from "next/navigation";
import DatePicker from "@/src/app/dashboard/goals/[id]/testseries/[examID]/Components/DatePicker";
import SelectBatch from "./SelectBatch";
import SelectStudent from "./SelectStudent";

// Reusable Section Card Component
const SettingSection = ({ title, description, icon, children, isLive }) => (
  <Card
    elevation={0}
    sx={{
      border: "1px solid var(--border-color)",
      borderRadius: "12px",
      padding: "24px",
      backgroundColor: "var(--white)",
      opacity: isLive ? 0.6 : 1,
      pointerEvents: isLive ? "none" : "auto",
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: isLive ? "var(--border-color)" : "var(--primary-color)",
        boxShadow: isLive ? "none" : "0 4px 12px rgba(0,0,0,0.05)",
      },
    }}
  >
    <Stack gap="20px">
      {/* Section Header */}
      <Stack flexDirection="row" alignItems="center" gap="12px">
        <Box
          sx={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            backgroundColor: "var(--primary-color-acc-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary-color)",
          }}
        >
          {icon}
        </Box>
        <Stack flex={1}>
          <Typography
            variant="h6"
            sx={{
              fontSize: "16px",
              fontWeight: "700",
              color: "var(--text1)",
              fontFamily: "Lato",
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography
              sx={{
                fontSize: "13px",
                color: "var(--text4)",
                fontFamily: "Lato",
              }}
            >
              {description}
            </Typography>
          )}
        </Stack>
      </Stack>

      <Divider />

      {/* Section Content */}
      {children}
    </Stack>
  </Card>
);

// Field Component with label and helper text
const SettingField = ({ label, helper, children, error }) => (
  <Stack gap="8px">
    <Stack flexDirection="row" alignItems="center" gap="6px">
      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: "600",
          color: "var(--text2)",
          fontFamily: "Lato",
        }}
      >
        {label}
      </Typography>
      {helper && (
        <Tooltip title={helper} placement="right">
          <InfoIcon sx={{ fontSize: "16px", color: "var(--text4)" }} />
        </Tooltip>
      )}
    </Stack>
    {children}
    {error && (
      <Typography
        sx={{
          fontSize: "12px",
          color: "var(--delete-color)",
          fontFamily: "Lato",
        }}
      >
        {error}
      </Typography>
    )}
  </Stack>
);

export default function ExamSettings({ exam, setExam, type, isLive }) {
  const [initialValues, setInitialValues] = useState({
    title: exam.title || "",
    duration: exam.duration || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { showSnackbar } = useSnackbar();
  const params = useParams();
  const examID = params.examID;

  // Validation function
  const validateField = (field, value) => {
    const errors = {};

    if (field === "title") {
      if (!value || value.trim().length === 0) {
        errors.title = "Title is required";
      } else if (value.length > 200) {
        errors.title = "Title must be less than 200 characters";
      }
    }

    if (field === "duration") {
      const duration = parseInt(value);
      if (value && (isNaN(duration) || duration < 1 || duration > 600)) {
        errors.duration = "Duration must be between 1 and 600 minutes";
      }
    }

    return errors;
  };

  // Update exam with error handling and validation
  const updateExam = async ({ params = {} }) => {
    setIsSaving(true);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examID: examID,
            type: type,
            ...params,
          }),
        }
      );

      if (data.success) {
        setExam((prev) => ({ ...prev, ...params }));
        showSnackbar("Exam updated successfully", "success", "", "2000");
      } else {
        showSnackbar(
          data.message || "Failed to update exam",
          "error",
          "",
          "3000"
        );
      }
    } catch (error) {
      console.error("Update exam error:", error);
      showSnackbar("Network error. Please try again.", "error", "", "3000");
    } finally {
      setIsSaving(false);
    }
  };

  // Update batch list with error handling
  const updateBatchList = async (batchList) => {
    setIsSaving(true);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/batch-list-update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ examID, batchList }),
        }
      );

      if (data.success) {
        setExam((prev) => ({ ...prev, batchList }));
        showSnackbar("Batches updated successfully", "success", "", "2000");
      } else {
        showSnackbar(
          data.message || "Failed to update batches",
          "error",
          "",
          "3000"
        );
      }
    } catch (error) {
      console.error("Update batch list error:", error);
      showSnackbar("Network error. Please try again.", "error", "", "3000");
    } finally {
      setIsSaving(false);
    }
  };

  // Update student list with error handling
  const updateStudentList = async (studentList) => {
    setIsSaving(true);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/student-list-update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ examID, studentList }),
        }
      );

      if (data.success) {
        setExam((prev) => ({ ...prev, studentList }));
        showSnackbar(
          "Student list updated successfully",
          "success",
          "",
          "2000"
        );
      } else {
        showSnackbar(
          data.message || "Failed to update student list",
          "error",
          "",
          "3000"
        );
      }
    } catch (error) {
      console.error("Update student list error:", error);
      showSnackbar("Network error. Please try again.", "error", "", "3000");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle field blur with validation
  const handleFieldBlur = (field, value) => {
    const errors = validateField(field, value);
    setValidationErrors((prev) => ({ ...prev, ...errors }));

    // Only update if valid and different from initial
    if (Object.keys(errors).length === 0 && value !== initialValues[field]) {
      if (value && value.trim()) {
        updateExam({ params: { [field]: value } });
        setInitialValues((prev) => ({ ...prev, [field]: value }));
      }
    }
  };

  return (
    <Tooltip
      title={isLive ? "You cannot edit settings while exam is live" : ""}
      followCursor
      placement="top"
    >
      <Stack gap="20px" padding="20px">
        {/* Saving Indicator */}
        {isSaving && (
          <Card
            elevation={0}
            sx={{
              padding: "12px 16px",
              backgroundColor: "var(--primary-color-acc-2)",
              borderRadius: "8px",
              border: "1px solid var(--primary-color)",
              width: "fit-content",
            }}
          >
            <Stack flexDirection="row" alignItems="center" gap="12px">
              <CircularProgress
                size={18}
                sx={{ color: "var(--primary-color)" }}
              />
              <Typography
                sx={{
                  fontSize: "14px",
                  color: "var(--primary-color)",
                  fontWeight: 600,
                  fontFamily: "Lato",
                }}
              >
                Saving changes...
              </Typography>
            </Stack>
          </Card>
        )}

        {/* Live Exam Warning */}
        {isLive && (
          <Card
            elevation={0}
            sx={{
              padding: "12px 16px",
              backgroundColor: "#fff3e0",
              borderRadius: "8px",
              border: "1px solid #ff9800",
            }}
          >
            <Stack flexDirection="row" alignItems="center" gap="12px">
              <InfoIcon sx={{ color: "#ff9800", fontSize: "20px" }} />
              <Typography
                sx={{
                  fontSize: "14px",
                  color: "#e65100",
                  fontWeight: 500,
                  fontFamily: "Lato",
                }}
              >
                This exam is currently live. Settings cannot be modified.
              </Typography>
            </Stack>
          </Card>
        )}

        {/* Basic Information Section */}
        <SettingSection
          title="Basic Information"
          description="Configure the fundamental details of your exam"
          icon={<TitleIcon />}
          isLive={isLive}
        >
          <SettingField
            label="Exam Title"
            helper="Give your exam a clear, descriptive title (max 200 characters)"
            error={validationErrors.title}
          >
            <StyledTextField
              placeholder="e.g., Mathematics Final Exam 2024"
              fullWidth
              value={exam.title || ""}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const newTitle = e.target.value;
                setExam((prev) => ({ ...prev, title: newTitle }));
                if (validationErrors.title) {
                  setValidationErrors((prev) => {
                    const { title, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              onBlur={(e) => handleFieldBlur("title", e.target.value)}
              disabled={isLive}
              error={!!validationErrors.title}
              InputProps={{
                endAdornment: !validationErrors.title && exam.title && (
                  <CheckCircle
                    sx={{ color: "var(--primary-color)", fontSize: "20px" }}
                  />
                ),
              }}
            />
          </SettingField>

          <SettingField
            label="Duration"
            helper="Set exam duration in minutes (1-600 minutes)"
            error={validationErrors.duration}
          >
            <Stack flexDirection="row" alignItems="center" gap="12px">
              <StyledTextField
                placeholder="45"
                value={exam.duration || ""}
                onChange={(e) => {
                  const newDuration = e.target.value;
                  if (/^\d*$/.test(newDuration)) {
                    setExam((prev) => ({ ...prev, duration: newDuration }));
                    if (validationErrors.duration) {
                      setValidationErrors((prev) => {
                        const { duration, ...rest } = prev;
                        return rest;
                      });
                    }
                  }
                }}
                onFocus={(e) => e.target.select()}
                onBlur={(e) => handleFieldBlur("duration", e.target.value)}
                disabled={isLive}
                error={!!validationErrors.duration}
                sx={{ width: "200px" }}
                InputProps={{
                  endAdornment: !validationErrors.duration && exam.duration && (
                    <CheckCircle
                      sx={{ color: "var(--primary-color)", fontSize: "20px" }}
                    />
                  ),
                }}
              />
              <Chip
                icon={<TimerIcon sx={{ fontSize: "16px" }} />}
                label={`${exam.duration || 0} minutes`}
                sx={{
                  backgroundColor: "var(--sec-color-acc-2)",
                  color: "var(--sec-color)",
                  fontWeight: 600,
                }}
              />
            </Stack>
          </SettingField>
        </SettingSection>

        {/* Schedule Section */}
        <SettingSection
          title="Exam Schedule"
          description="Define when your exam will be available to students"
          icon={<ScheduleIcon />}
          isLive={isLive}
        >
          <Stack gap="20px">
            <SettingField
              label="Start Date & Time"
              helper="When will students be able to access this exam?"
            >
              <DatePicker
                data={exam}
                setData={setExam}
                updateData={updateExam}
                field="startTimeStamp"
              />
            </SettingField>

            <SettingField
              label="End Date & Time"
              helper="When will the exam automatically close?"
            >
              <DatePicker
                data={exam}
                setData={setExam}
                updateData={updateExam}
                field="endTimeStamp"
              />
            </SettingField>

            <Divider sx={{ my: 1 }} />

            {/* Auto Expire Setting */}
            <Stack
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                padding: "12px 16px",
                backgroundColor: "var(--primary-color-acc-2)",
                borderRadius: "8px",
              }}
            >
              <Stack flex={1}>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--text2)",
                    fontFamily: "Lato",
                  }}
                >
                  Auto Expire
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--text4)",
                    fontFamily: "Lato",
                  }}
                >
                  Automatically close exam after end time
                </Typography>
              </Stack>
              <StyledSwitch
                checked={!exam.isLifeTime}
                onChange={(e) => {
                  setExam((prev) => ({
                    ...prev,
                    isLifeTime: !e.target.checked,
                  }));
                  updateExam({ params: { isLifeTime: !e.target.checked } });
                }}
              />
            </Stack>
          </Stack>
        </SettingSection>

        {/* Participants Section */}
        {type === "scheduled" && (
          <SettingSection
            title="Participants"
            description="Select which batches or students can access this exam"
            icon={<GroupIcon />}
            isLive={isLive}
          >
            <Stack gap="24px">
              <SettingField
                label="Select Batches"
                helper="Students from selected batches will be able to take this exam"
              >
                <SelectBatch
                  exam={exam}
                  setExam={setExam}
                  updateBatchList={updateBatchList}
                  isLive={isLive}
                />
                {exam.batchList && exam.batchList.length > 0 && (
                  <Stack
                    flexDirection="row"
                    alignItems="center"
                    gap="8px"
                    sx={{
                      padding: "8px 12px",
                      backgroundColor: "var(--primary-color-acc-2)",
                      borderRadius: "6px",
                      width: "fit-content",
                      marginTop: "8px",
                    }}
                  >
                    <GroupIcon
                      sx={{ fontSize: "18px", color: "var(--primary-color)" }}
                    />
                    <Typography
                      sx={{
                        fontSize: "13px",
                        color: "var(--primary-color)",
                        fontWeight: 600,
                      }}
                    >
                      {exam.batchList.length} batch
                      {exam.batchList.length !== 1 ? "es" : ""} selected
                    </Typography>
                  </Stack>
                )}
              </SettingField>

              <Divider />

              <SettingField
                label="Select Individual Students"
                helper="Search and select specific students to assign this exam to"
              >
                <SelectStudent
                  exam={exam}
                  setExam={setExam}
                  updateStudentList={updateStudentList}
                  isLive={isLive}
                />
                {exam.studentList && exam.studentList.length > 0 && (
                  <Stack
                    flexDirection="row"
                    alignItems="center"
                    gap="8px"
                    sx={{
                      padding: "8px 12px",
                      backgroundColor: "var(--primary-color-acc-2)",
                      borderRadius: "6px",
                      width: "fit-content",
                      marginTop: "8px",
                    }}
                  >
                    <GroupIcon
                      sx={{ fontSize: "18px", color: "var(--primary-color)" }}
                    />
                    <Typography
                      sx={{
                        fontSize: "13px",
                        color: "var(--primary-color)",
                        fontWeight: 600,
                      }}
                    >
                      {exam.studentList.length} student
                      {exam.studentList.length !== 1 ? "s" : ""} selected
                    </Typography>
                  </Stack>
                )}
              </SettingField>
            </Stack>
          </SettingSection>
        )}

        {/* Advanced Settings Section */}
        <SettingSection
          title="Exam Features"
          description="Configure student access and exam behavior"
          icon={<InfoIcon />}
          isLive={isLive}
        >
          <Stack gap="16px">
            {/* Pro Users Only */}
            <Stack
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                padding: "12px 16px",
                backgroundColor: "var(--primary-color-acc-2)",
                borderRadius: "8px",
              }}
            >
              <Stack flex={1}>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--text2)",
                    fontFamily: "Lato",
                  }}
                >
                  Only for Pro Users
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--text4)",
                    fontFamily: "Lato",
                  }}
                >
                  Restrict exam access to premium users only
                </Typography>
              </Stack>
              <StyledSwitch
                checked={exam.settings?.isProTest}
                onChange={(e) => {
                  const value = e.target.checked;
                  setExam((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      isProTest: value,
                    },
                  }));
                  updateExam({ params: { isProTest: value } });
                }}
              />
            </Stack>

            {/* Show Results */}
            <Stack
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                padding: "12px 16px",
                backgroundColor: "var(--sec-color-acc-2)",
                borderRadius: "8px",
              }}
            >
              <Stack flex={1}>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--text2)",
                    fontFamily: "Lato",
                  }}
                >
                  Show Results to Candidates
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--text4)",
                    fontFamily: "Lato",
                  }}
                >
                  Display scores and correct answers after submission
                </Typography>
              </Stack>
              <StyledSwitch
                checked={exam.settings?.isShowResult}
                onChange={(e) => {
                  const value = e.target.checked;
                  setExam((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      isShowResult: value,
                    },
                  }));
                  updateExam({ params: { isShowResult: value } });
                }}
              />
            </Stack>

            {/* Anti-Cheat */}
            <Stack
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                padding: "12px 16px",
                backgroundColor: "#ffebee",
                borderRadius: "8px",
              }}
            >
              <Stack flex={1}>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--text2)",
                    fontFamily: "Lato",
                  }}
                >
                  Anti-Cheat Measures
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--text4)",
                    fontFamily: "Lato",
                  }}
                >
                  Enable monitoring to prevent cheating during exam
                </Typography>
              </Stack>
              <StyledSwitch
                checked={exam.settings?.isAntiCheat}
                onChange={(e) => {
                  const value = e.target.checked;
                  setExam((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      isAntiCheat: value,
                    },
                  }));
                  updateExam({ params: { isAntiCheat: value } });
                }}
              />
            </Stack>

            {/* Full-Screen Mode */}
            <Stack
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                padding: "12px 16px",
                backgroundColor: "#e3f2fd",
                borderRadius: "8px",
              }}
            >
              <Stack flex={1}>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--text2)",
                    fontFamily: "Lato",
                  }}
                >
                  Full-Screen Mode
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--text4)",
                    fontFamily: "Lato",
                  }}
                >
                  Force students to take exam in full-screen
                </Typography>
              </Stack>
              <StyledSwitch
                checked={exam.settings?.isFullScreenMode}
                onChange={(e) => {
                  const value = e.target.checked;
                  setExam((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      isFullScreenMode: value,
                    },
                  }));
                  updateExam({ params: { isFullScreenMode: value } });
                }}
              />
            </Stack>

            {/* Randomize Questions */}
            <Stack
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                padding: "12px 16px",
                backgroundColor: "#f3e5f5",
                borderRadius: "8px",
              }}
            >
              <Stack flex={1}>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--text2)",
                    fontFamily: "Lato",
                  }}
                >
                  Randomize Question Order
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--text4)",
                    fontFamily: "Lato",
                  }}
                >
                  Shuffle questions for each student
                </Typography>
              </Stack>
              <StyledSwitch
                checked={exam.settings?.isRandomQuestion}
                onChange={(e) => {
                  const value = e.target.checked;
                  setExam((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      isRandomQuestion: value,
                    },
                  }));
                  updateExam({ params: { isRandomQuestion: value } });
                }}
              />
            </Stack>
          </Stack>
        </SettingSection>

        {/* Rewards Section */}
        <SettingSection
          title="Rewards & Incentives"
          description="Configure coin rewards for student performance"
          icon={<InfoIcon />}
          isLive={isLive}
        >
          <Stack gap="16px">
            {/* Enable Rewards */}
            <Stack
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                padding: "12px 16px",
                backgroundColor: "#fff9c4",
                borderRadius: "8px",
              }}
            >
              <Stack flex={1}>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--text2)",
                    fontFamily: "Lato",
                  }}
                >
                  Enable Coin Rewards
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--text4)",
                    fontFamily: "Lato",
                  }}
                >
                  Reward students with coins based on performance
                </Typography>
              </Stack>
              <StyledSwitch
                checked={exam.settings?.mCoinReward?.isEnabled}
                onChange={(e) => {
                  setExam((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      mCoinReward: {
                        ...prev.settings?.mCoinReward,
                        isEnabled: e.target.checked,
                      },
                    },
                  }));
                  updateExam({
                    params: {
                      mCoinRewardIsEnabled: e.target.checked,
                    },
                  });
                }}
              />
            </Stack>

            {/* Reward Configuration */}
            {exam.settings?.mCoinReward?.isEnabled && (
              <Stack
                gap="16px"
                sx={{
                  padding: "16px",
                  backgroundColor: "#fffde7",
                  borderRadius: "8px",
                  border: "1px dashed #fbc02d",
                }}
              >
                <SettingField
                  label="Minimum Score Required (%)"
                  helper="Students must score at least this percentage to earn rewards"
                >
                  <Slider
                    size="small"
                    valueLabelDisplay="auto"
                    value={exam.settings?.mCoinReward?.conditionPercent || 0}
                    onChange={(e) => {
                      setExam((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          mCoinReward: {
                            ...prev.settings?.mCoinReward,
                            conditionPercent: e.target.value,
                          },
                        },
                      }));
                    }}
                    onChangeCommitted={(e) => {
                      updateExam({
                        params: {
                          mCoinRewardConditionPercent: e.target.value,
                        },
                      });
                    }}
                    sx={{ color: "#fbc02d" }}
                  />
                </SettingField>

                <SettingField
                  label="Coins to Reward"
                  helper="Number of coins each qualifying student will receive"
                >
                  <StyledTextField
                    placeholder="e.g., 100"
                    value={exam.settings?.mCoinReward?.rewardCoin || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        setExam((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            mCoinReward: {
                              ...prev.settings?.mCoinReward,
                              rewardCoin: value,
                            },
                          },
                        }));
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    onBlur={(e) => {
                      updateExam({
                        params: {
                          mCoinRewardRewardCoin: e.target.value,
                        },
                      });
                    }}
                    sx={{ width: "200px" }}
                  />
                </SettingField>
              </Stack>
            )}
          </Stack>
        </SettingSection>
      </Stack>
    </Tooltip>
  );
}
