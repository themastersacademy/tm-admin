"use client";
import {
  Button,
  DialogContent,
  IconButton,
  Skeleton,
  Slider,
  Stack,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import {
  Add,
  Close,
  East,
  Info,
  Settings,
  Groups,
  Quiz,
  Schedule,
  EmojiEvents,
} from "@mui/icons-material";
import SecondaryCard from "@/src/components/SecondaryCard/SecondaryCard";
import { useParams, useRouter } from "next/navigation";
import DialogBox from "@/src/components/DialogBox/DialogBox";
import { useCallback, useEffect, useState } from "react";
import StatusCard from "@/src/components/CreateExam/Components/StatusCard";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import Header from "@/src/components/Header/Header";
import { apiFetch } from "@/src/lib/apiFetch";
import NoDataFound from "@/src/components/NoDataFound/NoDataFound";
import PrimaryCardSkeleton from "@/src/components/PrimaryCardSkeleton/PrimaryCardSkeleton";
import StyledSwitch from "@/src/components/StyledSwitch/StyledSwitch";
import { enqueueSnackbar } from "notistack";
import CreateExamDialog from "@/src/components/CreateExamDialog/CreateExamDialog";
import ScheduledExamCard from "@/src/components/ScheduledExamCard/ScheduledExamCard";

export default function ExamGroupID() {
  const params = useParams();
  const router = useRouter();
  const goalID = params.id;
  const examGroupID = params.examGroupID;
  const [isDialogOpen, setIsDialogOPen] = useState(false);
  const [isSettingDialog, setIsSettingDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [exam, setExam] = useState({});
  const [examList, setExamList] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  const dialogOpen = () => {
    setIsDialogOPen(true);
  };
  const dialogClose = () => {
    setIsDialogOPen(false);
  };

  const settingDialogopen = () => {
    setIsSettingDialog(true);
  };
  const settingDialogClose = () => {
    setIsSettingDialog(false);
  };

  const createExam = ({ title }) => {
    if (!title) {
      enqueueSnackbar("Enter a title", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }
    setIsCreating(true);
    apiFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groupID: examGroupID,
        title: title,
        goalID: goalID,
        type: "group",
      }),
    }).then((data) => {
      if (data.success) {
        enqueueSnackbar(data.message, {
          variant: "success",
          autoHideDuration: 3000,
        });
        dialogClose();
        setTitle("");
        fetchExam();
      } else {
        enqueueSnackbar(data.message, {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
      setIsCreating(false);
    });
  };

  const fetchExamData = useCallback(async () => {
    setIsLoading(true);
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/group/${examGroupID}`
    ).then((data) => {
      if (data.success) {
        setExam(data.data);
      } else {
        enqueueSnackbar(data.message, {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
      setIsLoading(false);
    });
  }, [examGroupID]);
  useEffect(() => {
    fetchExamData();
  }, [examGroupID, fetchExamData]);

  const fetchExam = useCallback(() => {
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/group/get-exam-list`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupID: examGroupID,
        }),
      }
    ).then((data) => {
      if (data.success) {
        setExamList(data.data);
      } else {
        enqueueSnackbar(data.message, {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
    });
  }, [examGroupID]);
  useEffect(() => {
    fetchExam();
  }, [examGroupID, fetchExam]);

  const updateExamGroup = ({ params = {} }) => {
    apiFetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/group/update-group`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goalID: goalID,
          examGroupID: examGroupID,
          ...params,
        }),
      }
    ).then((data) => {
      if (data.success) {
        setExam((prev) => ({
          ...prev,
          ...params,
        }));
        fetchExamData();
      } else {
        enqueueSnackbar(data.message, {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
    });
  };

  return (
    <Stack padding="20px" gap="15px">
      <Header
        title={
          isLoading ? (
            <Skeleton variant="text" sx={{ width: "100px" }} />
          ) : (
            exam.title
          )
        }
        back
        button={[
          <Stack
            key="actions"
            flexDirection="row"
            alignItems="center"
            gap="12px"
            sx={{ marginLeft: "auto" }}
          >
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={settingDialogopen}
              sx={{
                textTransform: "none",
                borderColor: "var(--border-color)",
                color: "var(--text1)",
                "&:hover": {
                  borderColor: "var(--primary-color)",
                  backgroundColor: "var(--primary-color-light, #e3f2fd)",
                },
              }}
            >
              Group Settings
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={dialogOpen}
              sx={{
                backgroundColor: "var(--primary-color)",
                textTransform: "none",
              }}
              disableElevation
            >
              Add Exam
            </Button>
          </Stack>,
        ]}
      />
      <Stack
        sx={{
          backgroundColor: "var(--white)",
          border: "1px solid",
          borderColor: "var(--border-color)",
          borderRadius: "10px",
          padding: "20px",
          gap: "20px",
          minHeight: "100vh",
        }}
      >
        <SettingsDialog
          isSettingDialog={isSettingDialog}
          settingDialogClose={settingDialogClose}
          updateExamGroup={updateExamGroup}
          exam={exam}
        />
        <CreateExamDialog
          isOpen={isDialogOpen}
          onClose={dialogClose}
          onCreate={() => createExam({ title })}
          isLoading={isCreating}
          title="Add Exam to Group"
          subtitle="Add a new exam to this exam group."
          icon={<Add />}
          infoText="This exam will be part of the group and share its settings."
        >
          <StyledTextField
            placeholder="Enter Test title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </CreateExamDialog>

        {/* Live Status Control */}
        <Stack
          sx={{
            padding: "16px 20px",
            borderRadius: "10px",
            border: "1px solid",
            borderColor: exam.isLive ? "#4caf50" : "var(--border-color)",
            backgroundColor: exam.isLive ? "#e8f5e9" : "#f5f5f5",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "12px",
            transition: "all 0.3s ease",
          }}
        >
          <Stack flex={1}>
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "14px",
                fontWeight: "600",
                color: exam.isLive ? "#2e7d32" : "var(--text2)",
              }}
            >
              {exam.isLive ? "✓ Group is Live" : "Group is Offline"}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "12px",
                color: exam.isLive ? "#66bb6a" : "var(--text3)",
              }}
            >
              {exam.isLive
                ? "Students can access all exams in this group"
                : "Activate to make exams visible to students"}
            </Typography>
          </Stack>
          <StyledSwitch
            checked={exam.isLive || false}
            onChange={(e) => {
              apiFetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/exam/group/${examGroupID}/update-group-live`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    isLive: e.target.checked,
                    goalID: goalID,
                  }),
                }
              ).then((data) => {
                if (data.success) {
                  enqueueSnackbar(data.message, {
                    variant: "success",
                    autoHideDuration: 3000,
                  });
                  fetchExamData();
                } else {
                  enqueueSnackbar(data.message, {
                    variant: "error",
                    autoHideDuration: 3000,
                  });
                }
              });
            }}
          />
        </Stack>

        {/* Group Overview Banner */}
        <Stack
          sx={{
            padding: "16px 20px",
            borderRadius: "10px",
            backgroundColor: "#f8f9fa",
            border: "1px solid var(--border-color)",
          }}
        >
          <Stack
            flexDirection="row"
            alignItems="center"
            gap="12px"
            marginBottom="8px"
          >
            <Groups sx={{ color: "var(--primary-color)" }} />
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "16px",
                fontWeight: "700",
                color: "var(--text1)",
              }}
            >
              Group Overview
            </Typography>
          </Stack>
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "14px",
              color: "var(--text2)",
              lineHeight: 1.6,
            }}
          >
            This group contains {examList?.length || 0} exam
            {examList?.length !== 1 ? "s" : ""}. All exams in this group share
            the same settings configured in Group Settings.
          </Typography>
        </Stack>

        {/* Real Analytics Cards */}
        <Stack flexDirection="row" gap="20px" flexWrap="wrap">
          <SecondaryCard
            icon={<Quiz sx={{ color: "var(--primary-color)" }} />}
            title="Total Exams"
            subTitle={isLoading ? "..." : examList?.length || 0}
            cardWidth="200px"
          />
          <SecondaryCard
            icon={<Schedule sx={{ color: "var(--primary-color)" }} />}
            title="Live Exams"
            subTitle={
              isLoading ? "..." : examList?.filter((e) => e.isLive).length || 0
            }
            cardWidth="200px"
          />
          <SecondaryCard
            icon={<Quiz sx={{ color: "var(--primary-color)" }} />}
            title="Total Questions"
            subTitle={
              isLoading
                ? "..."
                : examList?.reduce(
                    (acc, e) => acc + (e.totalQuestions || 0),
                    0
                  ) || 0
            }
            cardWidth="200px"
          />
          <SecondaryCard
            icon={<EmojiEvents sx={{ color: "var(--primary-color)" }} />}
            title="Total Marks"
            subTitle={
              isLoading
                ? "..."
                : examList?.reduce((acc, e) => acc + (e.totalMarks || 0), 0) ||
                  0
            }
            cardWidth="200px"
          />
        </Stack>
        <Stack
          flexDirection="row"
          flexWrap="wrap"
          columnGap="20px"
          rowGap="15px"
          marginTop="25px"
        >
          {!isLoading ? (
            examList?.length > 0 ? (
              examList.map((item, index) => (
                <ScheduledExamCard
                  key={index}
                  exam={item}
                  onClick={() =>
                    router.push(
                      `/dashboard/goals/${goalID}/examgroups/${examGroupID}/${item.id}`
                    )
                  }
                />
              ))
            ) : (
              <Stack minHeight="60vh" width="100%">
                <NoDataFound info="No Exam Group Created yet" />
              </Stack>
            )
          ) : (
            <Stack flexDirection="row" gap="20px" flexWrap="wrap">
              <PrimaryCardSkeleton />
              <PrimaryCardSkeleton />
              <PrimaryCardSkeleton />
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}

const SettingsDialog = ({
  isSettingDialog,
  settingDialogClose,
  updateExamGroup,
  exam,
}) => {
  const [localExam, setLocalExam] = useState(exam);

  useEffect(() => {
    if (exam) {
      const {
        title,
        settings: {
          isProTest,
          isAntiCheat,
          isShowResult,
          isRandomQuestion,
          isFullScreenMode,
          mCoinReward: {
            isEnabled = false,
            conditionPercent = 0,
            rewardCoin = 0,
          } = {},
        } = {},
      } = exam;

      setLocalExam({
        title,
        isProTest,
        isAntiCheat,
        isShowResult,
        isRandomQuestion,
        isFullScreenMode,
        mCoin: {
          isEnabled: isEnabled,
          conditionalPercent: conditionPercent,
          rewardCoin: rewardCoin,
        },
      });
    }
  }, [exam]);

  const handleSave = () => {
    const updatedExam = {
      title: localExam.title,
      isProTest: localExam.isProTest,
      isAntiCheat: localExam.isAntiCheat,
      isFullScreenMode: localExam.isFullScreenMode,
      isShowResult: localExam.isShowResult,
      isRandomQuestion: localExam.isRandomQuestion,
      mCoinRewardIsEnabled: localExam.mCoin.isEnabled,
      mCoinRewardConditionPercent: localExam.mCoin.conditionalPercent,
      mCoinRewardRewardCoin: localExam.mCoin.rewardCoin,
    };

    updateExamGroup({ params: updatedExam });
    settingDialogClose();
  };

  const SettingRow = ({ label, description, checked, onChange }) => (
    <Stack
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        padding: "16px",
        borderRadius: "8px",
        backgroundColor: "#f8f9fa",
        border: "1px solid var(--border-color)",
        transition: "all 0.2s",
        "&:hover": {
          backgroundColor: "#e9ecef",
        },
      }}
    >
      <Stack flex={1}>
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "14px",
            fontWeight: "600",
            color: "var(--text1)",
            marginBottom: "4px",
          }}
        >
          {label}
        </Typography>
        {description && (
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "12px",
              color: "var(--text3)",
              lineHeight: 1.5,
            }}
          >
            {description}
          </Typography>
        )}
      </Stack>
      <StyledSwitch checked={checked} onChange={onChange} />
    </Stack>
  );

  const SectionHeader = ({ icon, title }) => (
    <Stack
      flexDirection="row"
      alignItems="center"
      gap="8px"
      marginBottom="12px"
      marginTop="8px"
    >
      {icon}
      <Typography
        sx={{
          fontFamily: "Lato",
          fontSize: "15px",
          fontWeight: "700",
          color: "var(--text1)",
        }}
      >
        {title}
      </Typography>
    </Stack>
  );

  return (
    <Dialog
      open={isSettingDialog}
      onClose={settingDialogClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "12px",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 24px",
          borderBottom: "1px solid var(--border-color)",
          backgroundColor: "#fafafa",
        }}
      >
        <Stack flexDirection="row" alignItems="center" gap="12px">
          <Settings sx={{ color: "var(--primary-color)" }} />
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "18px",
              fontWeight: "700",
            }}
          >
            Group Settings
          </Typography>
        </Stack>
        <IconButton
          onClick={settingDialogClose}
          sx={{
            "&:hover": {
              backgroundColor: "var(--primary-color-light, #e3f2fd)",
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: "24px" }}>
        <Stack gap="24px">
          {/* Group Name */}
          <Stack gap="8px">
            <Typography
              sx={{
                fontFamily: "Lato",
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text1)",
              }}
            >
              Group Name
            </Typography>
            <StyledTextField
              placeholder="Enter group name"
              value={localExam.title}
              onChange={(e) =>
                setLocalExam({ ...localExam, title: e.target.value })
              }
            />
          </Stack>

          {/* Exam Access Section */}
          <Stack>
            <SectionHeader
              icon={<Groups sx={{ color: "var(--primary-color)" }} />}
              title="Exam Access"
            />
            <SettingRow
              label="Pro Users Only"
              description="Restrict access to users with premium subscription"
              checked={localExam.isProTest || false}
              onChange={(e) =>
                setLocalExam({ ...localExam, isProTest: e.target.checked })
              }
            />
          </Stack>

          {/* Security Features Section */}
          <Stack>
            <SectionHeader
              icon={<Info sx={{ color: "var(--primary-color)" }} />}
              title="Security Features"
            />
            <Stack gap="12px">
              <SettingRow
                label="Anti-Cheat Detection"
                description="Monitor suspicious activities during exam"
                checked={localExam.isAntiCheat}
                onChange={(e) =>
                  setLocalExam({ ...localExam, isAntiCheat: e.target.checked })
                }
              />
              <SettingRow
                label="Full Screen Mode"
                description="Force students to stay in fullscreen while taking exam"
                checked={localExam.isFullScreenMode}
                onChange={(e) =>
                  setLocalExam({
                    ...localExam,
                    isFullScreenMode: e.target.checked,
                  })
                }
              />
            </Stack>
          </Stack>

          {/* Display Options Section */}
          <Stack>
            <SectionHeader
              icon={<Quiz sx={{ color: "var(--primary-color)" }} />}
              title="Display Options"
            />
            <Stack gap="12px">
              <SettingRow
                label="Show Results After Completion"
                description="Students can see their score and answers immediately"
                checked={localExam.isShowResult}
                onChange={(e) =>
                  setLocalExam({
                    ...localExam,
                    isShowResult: e.target.checked,
                  })
                }
              />
              <SettingRow
                label="Randomize Questions"
                description="Questions appear in random order for each student"
                checked={localExam.isRandomQuestion}
                onChange={(e) =>
                  setLocalExam({
                    ...localExam,
                    isRandomQuestion: e.target.checked,
                  })
                }
              />
            </Stack>
          </Stack>

          {/* MCoin Rewards Section */}
          <Stack>
            <SectionHeader
              icon={<EmojiEvents sx={{ color: "var(--primary-color)" }} />}
              title="Rewards"
            />
            <Stack gap="16px">
              <SettingRow
                label="Enable MCoin Rewards"
                description="Reward students with coins based on performance"
                checked={localExam?.mCoin?.isEnabled}
                onChange={(e) => {
                  const value = e.target.checked;
                  setLocalExam({
                    ...localExam,
                    mCoin: { ...localExam.mCoin, isEnabled: value },
                  });
                }}
              />

              {localExam?.mCoin?.isEnabled && (
                <Stack
                  gap="16px"
                  sx={{
                    padding: "16px",
                    borderRadius: "8px",
                    backgroundColor: "#f0f7ff",
                    border: "1px solid var(--primary-color-light, #bbdefb)",
                  }}
                >
                  <Stack gap="8px">
                    <Typography
                      sx={{
                        fontFamily: "Lato",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "var(--text1)",
                      }}
                    >
                      Minimum Score Required (%)
                    </Typography>
                    <Stack flexDirection="row" alignItems="center" gap="16px">
                      <Slider
                        size="small"
                        valueLabelDisplay="auto"
                        sx={{ color: "var(--primary-color)", flex: 1 }}
                        value={localExam?.mCoin?.conditionalPercent || 0}
                        onChange={(e) =>
                          setLocalExam({
                            ...localExam,
                            mCoin: {
                              ...localExam.mCoin,
                              conditionalPercent: e.target.value,
                            },
                          })
                        }
                      />
                      <Typography
                        sx={{
                          fontFamily: "Lato",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "var(--primary-color)",
                          minWidth: "45px",
                        }}
                      >
                        {localExam?.mCoin?.conditionalPercent || 0}%
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        fontFamily: "Lato",
                        fontSize: "11px",
                        color: "var(--text3)",
                      }}
                    >
                      Students must score at least this percentage to earn
                      rewards
                    </Typography>
                  </Stack>

                  <Stack gap="8px">
                    <Typography
                      sx={{
                        fontFamily: "Lato",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "var(--text1)",
                      }}
                    >
                      Coins to Award
                    </Typography>
                    <StyledTextField
                      placeholder="Enter coins"
                      value={localExam?.mCoin?.rewardCoin}
                      type="number"
                      onChange={(e) =>
                        setLocalExam({
                          ...localExam,
                          mCoin: {
                            ...localExam.mCoin,
                            rewardCoin: e.target.value,
                          },
                        })
                      }
                    />
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          padding: "16px 24px",
          borderTop: "1px solid var(--border-color)",
          backgroundColor: "#fafafa",
        }}
      >
        <Button onClick={settingDialogClose} variant="text">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            backgroundColor: "var(--primary-color)",
            textTransform: "none",
          }}
          disableElevation
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
