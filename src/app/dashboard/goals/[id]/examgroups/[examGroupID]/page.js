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
} from "@mui/material";
import { Add, Close, East, Info, Settings } from "@mui/icons-material";
import PrimaryCard from "@/src/components/PrimaryCard/PrimaryCard";
import calendar from "@/public/Icons/weekCalendar.svg";
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
            key="live"
            flexDirection="row"
            alignItems="center"
            gap="20px"
            sx={{ marginLeft: "auto" }}
          >
            <Typography sx={{ fontFamily: "Lato", fontSize: "14px" }}>
              Live
            </Typography>
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
            <Settings
              sx={{ color: "var(--primary-color)", cursor: "pointer" }}
              onClick={settingDialogopen}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={dialogOpen}
              sx={{
                backgroundColor: "var(--primary-color)",
                textTransform: "none",
                minWidth: "120px",
              }}
              disableElevation
            >
              Add
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
        <DialogBox
          isOpen={isDialogOpen}
          title="Add Test"
          icon={
            <IconButton sx={{ borderRadius: "8px", padding: "4px" }}>
              <Close onClick={dialogClose} />
            </IconButton>
          }
          actionButton={
            <Button
              variant="text"
              endIcon={<East />}
              onClick={() => createExam({ title })}
              sx={{ textTransform: "none", color: "var(--primary-color)" }}
            >
              Add
            </Button>
          }
        >
          <DialogContent>
            <Stack>
              <StyledTextField
                placeholder="Enter Test title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Stack>
          </DialogContent>
        </DialogBox>
        <Stack flexDirection="row" gap="30px">
          <StatusCard
            info
            title="Mcoins rewarded"
            count={
              exam?.mCoin?.rewardCoin ?? <Skeleton variant="text" width={25} />
            }
          />
          <StatusCard
            info
            title="No of attempts"
            count={
              exam?.mCoin?.conditionalPercent ?? (
                <Skeleton variant="text" width={25} />
              )
            }
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
                <PrimaryCard
                  key={index}
                  icon={calendar}
                  title={item.title}
                  actionButton="View"
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

  // const handleSave = () => {
  //   updateExamGroup({ params: localExam });
  //   settingDialogClose();
  // };
  const handleSave = () => {
    const updatedExam = {
      title: localExam.title,
      isProTest: localExam.isProTest,
      isAntiCheat: localExam.isAntiCheat,
      isFullScreenMode: localExam.isFullScreenMode,
      isShowResult: localExam.isShowResult,
      isRandomQuestion: localExam.isRandomQuestion,
      mCoinRewardIsEnabled: localExam.mCoin.isActive,
      mCoinRewardConditionPercent: localExam.mCoin.conditionalPercent,
      mCoinRewardRewardCoin: localExam.mCoin.rewardCoin,
    };

    updateExamGroup({ params: updatedExam });
    settingDialogClose();
  };

  return (
    <DialogBox
      isOpen={isSettingDialog}
      title="Group Settings"
      icon={
        <IconButton
          sx={{ borderRadius: "8px", padding: "4px" }}
          onClick={settingDialogClose}
        >
          <Close />
        </IconButton>
      }
      actionButton={
        <Button
          variant="text"
          endIcon={<East />}
          sx={{ textTransform: "none", color: "var(--primary-color)" }}
          onClick={handleSave}
        >
          Save
        </Button>
      }
    >
      <DialogContent>
        <Stack gap="10px">
          <Stack gap="5px">
            <Typography
              sx={{ fontFamily: "Lato", fontSize: "12px", fontWeight: "700" }}
            >
              Name
            </Typography>
            <StyledTextField
              placeholder="Enter test name"
              value={localExam.title}
              onChange={(e) =>
                setLocalExam({ ...localExam, title: e.target.value })
              }
            />
          </Stack>
          <Stack flexDirection="row" gap="20px">
            <Stack gap="6px">
              <Typography
                sx={{ fontFamily: "Lato", fontSize: "12px", fontWeight: "700" }}
              >
                Who can access this test
              </Typography>
              <StyledSwitch
                checked={localExam.isProTest || false}
                onChange={(e) =>
                  setLocalExam({ ...localExam, isProTest: e.target.checked })
                }
              />
            </Stack>
            <Stack gap="6px">
              <Typography
                sx={{ fontFamily: "Lato", fontSize: "12px", fontWeight: "700" }}
              >
                AntiCheat
              </Typography>
              <StyledSwitch
                checked={localExam.isAntiCheat}
                onChange={(e) =>
                  setLocalExam({ ...localExam, isAntiCheat: e.target.checked })
                }
              />
            </Stack>
          </Stack>
          <Stack flexDirection="row" gap="20px">
            <Stack gap="6px">
              <Typography
                sx={{ fontFamily: "Lato", fontSize: "12px", fontWeight: "700" }}
              >
                Show result after completion
              </Typography>
              <StyledSwitch
                checked={localExam.isShowResult}
                onChange={(e) => {
                  const value = e.target.checked;
                  setLocalExam({
                    ...localExam,
                    isShowResult: value,
                  });
                }}
              />
            </Stack>
            <Stack gap="6px">
              <Typography
                sx={{ fontFamily: "Lato", fontSize: "12px", fontWeight: "700" }}
              >
                Random Question
              </Typography>
              <StyledSwitch
                checked={localExam.isRandomQuestion}
                onChange={(e) => {
                  const value = e.target.checked;
                  setLocalExam({
                    ...localExam,
                    isRandomQuestion: value,
                  });
                }}
              />
            </Stack>
            <Stack gap="6px">
              <Typography
                sx={{ fontFamily: "Lato", fontSize: "12px", fontWeight: "700" }}
              >
                Full Screen Mode
              </Typography>
              <StyledSwitch
                checked={localExam.isFullScreenMode}
                onChange={(e) => {
                  const value = e.target.checked;
                  setLocalExam({
                    ...localExam,
                    isFullScreenMode: value,
                  });
                }}
              />
            </Stack>
          </Stack>
          <Stack flexDirection="row" justifyContent="space-between">
            <Stack>
              <Typography
                sx={{ fontFamily: "Lato", fontSize: "12px", fontWeight: "700" }}
              >
                MCoin rewards
              </Typography>
              <Stack flexDirection="row" alignItems="center" gap="5px">
                <StyledSwitch
                  checked={localExam?.mCoin?.isEnabled}
                  onChange={(e) => {
                    const value = e.target.checked;
                    setLocalExam({
                      ...localExam,
                      mCoin: { ...localExam.mCoin, isEnabled: value },
                    });
                  }}
                />
                <Tooltip
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: "var(--primary-color-acc-2)",
                        fontSize: "12px",
                        padding: "8px",
                        borderRadius: "8px",
                        width: "150px",
                        color: "var(--text1)",
                      },
                    },
                  }}
                  title="This will reward the user with MCoin based on the percentage of the test they complete"
                >
                  <Info sx={{ color: "var(--primary-color)" }} />
                </Tooltip>
              </Stack>
            </Stack>
            <Stack gap="10px">
              <Typography
                sx={{ fontFamily: "Lato", fontSize: "12px", fontWeight: "700" }}
              >
                Select rewarding percentage
              </Typography>
              <Slider
                size="small"
                valueLabelDisplay="auto"
                sx={{ color: "var(--primary-color)" }}
                disabled={!localExam?.mCoin?.isEnabled}
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
            </Stack>
            <Stack gap="5px">
              <Typography
                sx={{ fontFamily: "Lato", fontSize: "12px", fontWeight: "700" }}
              >
                Coins to be rewarded
              </Typography>
              <StyledTextField
                placeholder="Enter coins"
                disabled={!localExam?.mCoin?.isEnabled}
                value={localExam?.mCoin?.rewardCoin}
                type="number"
                onChange={(e) =>
                  setLocalExam({
                    ...localExam,
                    mCoin: { ...localExam.mCoin, rewardCoin: e.target.value },
                  })
                }
              />
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
    </DialogBox>
  );
};
