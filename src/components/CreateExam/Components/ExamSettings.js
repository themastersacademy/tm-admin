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

// Compact Section Card
const SettingSection = ({ title, icon, children, isLive }) => (
  <Card
    elevation={0}
    sx={{
      border: "1px solid var(--border-color)",
      borderRadius: "10px",
      padding: "16px",
      backgroundColor: "var(--white)",
      opacity: isLive ? 0.6 : 1,
      pointerEvents: isLive ? "none" : "auto",
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: isLive ? "var(--border-color)" : "var(--primary-color)",
        boxShadow: isLive ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
      },
    }}
  >
    <Stack gap="12px">
      <Stack flexDirection="row" alignItems="center" gap="8px">
        <Box
          sx={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            backgroundColor: "var(--primary-color-acc-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary-color)",
            "& svg": { fontSize: "18px" },
          }}
        >
          {icon}
        </Box>
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: "700",
            color: "var(--text1)",
            fontFamily: "Lato",
          }}
        >
          {title}
        </Typography>
      </Stack>
      <Divider />
      {children}
    </Stack>
  </Card>
);

// Compact Field
const SettingField = ({ label, helper, children, error }) => (
  <Stack gap="4px">
    <Stack flexDirection="row" alignItems="center" gap="4px">
      <Typography
        sx={{
          fontSize: "13px",
          fontWeight: "600",
          color: "var(--text2)",
          fontFamily: "Lato",
        }}
      >
        {label}
      </Typography>
      {helper && (
        <Tooltip title={helper} placement="right">
          <InfoIcon sx={{ fontSize: "14px", color: "var(--text4)" }} />
        </Tooltip>
      )}
    </Stack>
    {children}
    {error && (
      <Typography
        sx={{ fontSize: "11px", color: "var(--delete-color)", fontFamily: "Lato" }}
      >
        {error}
      </Typography>
    )}
  </Stack>
);

// Compact Toggle Row
const ToggleRow = ({ label, description, checked, onChange, bg }) => (
  <Stack
    flexDirection="row"
    alignItems="center"
    justifyContent="space-between"
    sx={{
      padding: "8px 12px",
      backgroundColor: bg || "var(--primary-color-acc-2)",
      borderRadius: "8px",
    }}
  >
    <Stack flex={1} sx={{ mr: 1 }}>
      <Typography
        sx={{
          fontSize: "13px",
          fontWeight: "600",
          color: "var(--text2)",
          fontFamily: "Lato",
        }}
      >
        {label}
      </Typography>
      {description && (
        <Typography
          sx={{ fontSize: "11px", color: "var(--text4)", fontFamily: "Lato" }}
        >
          {description}
        </Typography>
      )}
    </Stack>
    <StyledSwitch checked={checked} onChange={onChange} />
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

  const validateField = (field, value) => {
    const errors = {};
    if (field === "title") {
      if (!value || value.trim().length === 0) errors.title = "Title is required";
      else if (value.length > 200) errors.title = "Title must be less than 200 characters";
    }
    if (field === "duration") {
      const duration = parseInt(value);
      if (value && (isNaN(duration) || duration < 1 || duration > 600))
        errors.duration = "Duration must be between 1 and 600 minutes";
    }
    return errors;
  };

  const updateExam = async ({ params = {} }) => {
    setIsSaving(true);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ examID, type, ...params }),
        }
      );
      if (data.success) {
        setExam((prev) => ({ ...prev, ...params }));
        showSnackbar("Exam updated successfully", "success", "", "2000");
      } else {
        showSnackbar(data.message || "Failed to update exam", "error", "", "3000");
      }
    } catch (error) {
      console.error("Update exam error:", error);
      showSnackbar("Network error. Please try again.", "error", "", "3000");
    } finally {
      setIsSaving(false);
    }
  };

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
        showSnackbar(data.message || "Failed to update batches", "error", "", "3000");
      }
    } catch (error) {
      showSnackbar("Network error. Please try again.", "error", "", "3000");
    } finally {
      setIsSaving(false);
    }
  };

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
        showSnackbar("Student list updated successfully", "success", "", "2000");
      } else {
        showSnackbar(data.message || "Failed to update student list", "error", "", "3000");
      }
    } catch (error) {
      showSnackbar("Network error. Please try again.", "error", "", "3000");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldBlur = (field, value) => {
    const errors = validateField(field, value);
    setValidationErrors((prev) => ({ ...prev, ...errors }));
    if (Object.keys(errors).length === 0 && value !== initialValues[field]) {
      if (value && value.trim()) {
        updateExam({ params: { [field]: value } });
        setInitialValues((prev) => ({ ...prev, [field]: value }));
      }
    }
  };

  const handleSettingToggle = (key) => (e) => {
    const value = e.target.checked;
    setExam((prev) => ({
      ...prev,
      settings: { ...prev.settings, [key]: value },
    }));
    updateExam({ params: { [key]: value } });
  };

  return (
    <Tooltip
      title={isLive ? "You cannot edit settings while exam is live" : ""}
      followCursor
      placement="top"
    >
      <Stack gap="14px" padding="16px">
        {/* Saving Indicator */}
        {isSaving && (
          <Stack
            flexDirection="row"
            alignItems="center"
            gap="8px"
            sx={{
              padding: "8px 12px",
              backgroundColor: "var(--primary-color-acc-2)",
              borderRadius: "6px",
              border: "1px solid var(--primary-color)",
              width: "fit-content",
            }}
          >
            <CircularProgress size={14} sx={{ color: "var(--primary-color)" }} />
            <Typography
              sx={{ fontSize: "12px", color: "var(--primary-color)", fontWeight: 600 }}
            >
              Saving...
            </Typography>
          </Stack>
        )}

        {/* Live Warning */}
        {isLive && (
          <Stack
            flexDirection="row"
            alignItems="center"
            gap="8px"
            sx={{
              padding: "8px 12px",
              backgroundColor: "#fff3e0",
              borderRadius: "6px",
              border: "1px solid #ff9800",
            }}
          >
            <InfoIcon sx={{ color: "#ff9800", fontSize: "16px" }} />
            <Typography
              sx={{ fontSize: "12px", color: "#e65100", fontWeight: 500 }}
            >
              This exam is live. Settings cannot be modified.
            </Typography>
          </Stack>
        )}

        {/* Two-column grid for Basic Info + Schedule */}
        <Stack
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: "14px",
          }}
        >
          {/* Basic Information */}
          <SettingSection title="Basic Information" icon={<TitleIcon />} isLive={isLive}>
            <Stack gap="12px">
              <SettingField
                label="Exam Title"
                helper="Max 200 characters"
                error={validationErrors.title}
              >
                <StyledTextField
                  placeholder="e.g., Mathematics Final Exam 2024"
                  fullWidth
                  size="small"
                  value={exam.title || ""}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    setExam((prev) => ({ ...prev, title: e.target.value }));
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
                        sx={{ color: "var(--primary-color)", fontSize: "16px" }}
                      />
                    ),
                  }}
                />
              </SettingField>

              <SettingField
                label="Duration"
                helper="1-600 minutes"
                error={validationErrors.duration}
              >
                <Stack flexDirection="row" alignItems="center" gap="8px">
                  <StyledTextField
                    placeholder="45"
                    size="small"
                    value={exam.duration || ""}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        setExam((prev) => ({ ...prev, duration: e.target.value }));
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
                    sx={{ width: "120px" }}
                    InputProps={{
                      endAdornment: !validationErrors.duration && exam.duration && (
                        <CheckCircle
                          sx={{ color: "var(--primary-color)", fontSize: "16px" }}
                        />
                      ),
                    }}
                  />
                  <Chip
                    icon={<TimerIcon sx={{ fontSize: "14px" }} />}
                    label={`${exam.duration || 0} min`}
                    size="small"
                    sx={{
                      backgroundColor: "var(--sec-color-acc-2)",
                      color: "var(--sec-color)",
                      fontWeight: 600,
                      fontSize: "12px",
                      height: "26px",
                    }}
                  />
                </Stack>
              </SettingField>
            </Stack>
          </SettingSection>

          {/* Schedule */}
          <SettingSection title="Schedule" icon={<ScheduleIcon />} isLive={isLive}>
            <Stack gap="12px">
              <SettingField label="Start Date & Time" helper="When exam becomes available">
                <DatePicker
                  data={exam}
                  setData={setExam}
                  updateData={updateExam}
                  field="startTimeStamp"
                />
              </SettingField>

              <SettingField label="End Date & Time" helper="When exam closes">
                <DatePicker
                  data={exam}
                  setData={setExam}
                  updateData={updateExam}
                  field="endTimeStamp"
                />
              </SettingField>

              <ToggleRow
                label="Auto Expire"
                description="Close exam after end time"
                checked={!exam.isLifeTime}
                onChange={(e) => {
                  setExam((prev) => ({ ...prev, isLifeTime: !e.target.checked }));
                  updateExam({ params: { isLifeTime: !e.target.checked } });
                }}
              />
            </Stack>
          </SettingSection>
        </Stack>

        {/* Participants - full width */}
        {type === "scheduled" && (
          <SettingSection title="Participants" icon={<GroupIcon />} isLive={isLive}>
            <Stack
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: "14px",
              }}
            >
              <SettingField
                label="Select Batches"
                helper="Students from selected batches can take this exam"
              >
                <SelectBatch
                  exam={exam}
                  setExam={setExam}
                  updateBatchList={updateBatchList}
                  isLive={isLive}
                />
                {exam.batchList?.length > 0 && (
                  <Chip
                    icon={<GroupIcon sx={{ fontSize: "14px" }} />}
                    label={`${exam.batchList.length} batch${exam.batchList.length !== 1 ? "es" : ""} selected`}
                    size="small"
                    sx={{
                      mt: 1,
                      width: "fit-content",
                      backgroundColor: "var(--primary-color-acc-2)",
                      color: "var(--primary-color)",
                      fontWeight: 600,
                      fontSize: "12px",
                      height: "26px",
                    }}
                  />
                )}
              </SettingField>

              <SettingField
                label="Select Students"
                helper="Assign exam to specific students"
              >
                <SelectStudent
                  exam={exam}
                  setExam={setExam}
                  updateStudentList={updateStudentList}
                  isLive={isLive}
                />
                {exam.studentList?.length > 0 && (
                  <Chip
                    icon={<GroupIcon sx={{ fontSize: "14px" }} />}
                    label={`${exam.studentList.length} student${exam.studentList.length !== 1 ? "s" : ""} selected`}
                    size="small"
                    sx={{
                      mt: 1,
                      width: "fit-content",
                      backgroundColor: "var(--primary-color-acc-2)",
                      color: "var(--primary-color)",
                      fontWeight: 600,
                      fontSize: "12px",
                      height: "26px",
                    }}
                  />
                )}
              </SettingField>
            </Stack>
          </SettingSection>
        )}

        {/* Exam Features - 2-column grid of toggles */}
        <SettingSection title="Exam Features" icon={<InfoIcon />} isLive={isLive}>
          <Stack
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: "8px",
            }}
          >
            <ToggleRow
              label="Pro Users Only"
              description="Restrict to premium users"
              checked={exam.settings?.isProTest}
              onChange={handleSettingToggle("isProTest")}
            />
            <ToggleRow
              label="Show Results"
              description="Display scores after submission"
              checked={exam.settings?.isShowResult}
              onChange={handleSettingToggle("isShowResult")}
              bg="var(--sec-color-acc-2)"
            />
            <ToggleRow
              label="Anti-Cheat"
              description="Monitor to prevent cheating"
              checked={exam.settings?.isAntiCheat}
              onChange={handleSettingToggle("isAntiCheat")}
              bg="#ffebee"
            />
            <ToggleRow
              label="Full-Screen Mode"
              description="Force full-screen during exam"
              checked={exam.settings?.isFullScreenMode}
              onChange={handleSettingToggle("isFullScreenMode")}
              bg="rgba(24, 113, 99, 0.06)"
            />
            <ToggleRow
              label="Randomize Questions"
              description="Shuffle for each student"
              checked={exam.settings?.isRandomQuestion}
              onChange={handleSettingToggle("isRandomQuestion")}
              bg="rgba(24, 113, 99, 0.04)"
            />
          </Stack>
        </SettingSection>

        {/* Rewards */}
        <SettingSection title="Rewards" icon={<InfoIcon />} isLive={isLive}>
          <Stack gap="10px">
            <ToggleRow
              label="Enable Coin Rewards"
              description="Reward students based on performance"
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
                updateExam({ params: { mCoinRewardIsEnabled: e.target.checked } });
              }}
              bg="#fff9c4"
            />

            {exam.settings?.mCoinReward?.isEnabled && (
              <Stack
                gap="10px"
                sx={{
                  padding: "12px",
                  backgroundColor: "#fffde7",
                  borderRadius: "8px",
                  border: "1px dashed #fbc02d",
                }}
              >
                <SettingField
                  label="Minimum Score (%)"
                  helper="Min percentage to earn rewards"
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
                        params: { mCoinRewardConditionPercent: e.target.value },
                      });
                    }}
                    sx={{ color: "#fbc02d" }}
                  />
                </SettingField>

                <SettingField label="Coins to Reward" helper="Coins per qualifying student">
                  <StyledTextField
                    placeholder="e.g., 100"
                    size="small"
                    value={exam.settings?.mCoinReward?.rewardCoin || ""}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        setExam((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            mCoinReward: {
                              ...prev.settings?.mCoinReward,
                              rewardCoin: e.target.value,
                            },
                          },
                        }));
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    onBlur={(e) => {
                      updateExam({
                        params: { mCoinRewardRewardCoin: e.target.value },
                      });
                    }}
                    sx={{ width: "150px" }}
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
