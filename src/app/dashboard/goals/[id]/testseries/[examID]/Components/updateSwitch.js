import StyledSwitch from "@/src/components/StyledSwitch/StyledSwitch";
import StyledTextField from "@/src/components/StyledTextField/StyledTextField";
import { Slider, Stack, Typography } from "@mui/material";

export default function UpdateSwitch({
  mode,
  data,
  setData,
  updateData,
  isLive,
}) {
  return (
    <Stack
      gap="15px"
      sx={{
        pointerEvents: isLive ? "none" : "auto",
        opacity: isLive ? 0.5 : 1,
      }}
    >
      <Stack gap="20px" flexDirection="row" alignItems="center">
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "14px",
            fontWeight: "700",
            color: "var(--text3)",
            width: "200px",
          }}
        >
          Auto Expire
        </Typography>
        <StyledSwitch
          checked={!data.isLifeTime}
          onChange={(e) => {
            setData((prev) => ({
              ...prev,
              isLifeTime: e.target.checked,
            }));
            updateData({ params: { isLifeTime: !e.target.checked } });
          }}
        />
      </Stack>
      <Stack gap="20px" flexDirection="row" alignItems="center">
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "14px",
            fontWeight: "700",
            color: "var(--text3)",
            width: "200px",
          }}
        >
          Only for Pro users
        </Typography>
        <StyledSwitch
          checked={
            mode === "mock"
              ? data.settings?.isProTest
              : data.settings?.isProTest
          }
          onChange={(e) => {
            const value = e.target.checked;
            setData((prev) => ({
              ...prev,
              settings: {
                ...prev.settings,
                isProTest: value,
              },
            }));
            updateData({ params: { isProTest: value } });
          }}
        />
      </Stack>
      <Stack gap="20px" flexDirection="row" alignItems="center">
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "14px",
            fontWeight: "700",
            color: "var(--text3)",
            width: "200px",
          }}
        >
          Show results to canditate
        </Typography>
        <StyledSwitch
          checked={
            mode === "mock"
              ? data.settings?.isShowResult
              : data.settings?.isShowResult
          }
          onChange={(e) => {
            const value = e.target.checked;
            setData((prev) => ({
              ...prev,
              settings: {
                ...prev.settings,
                isShowResult: value,
              },
            }));
            updateData({ params: { isShowResult: value } });
          }}
        />
      </Stack>
      <Stack gap="20px" flexDirection="row" alignItems="center">
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "14px",
            fontWeight: "700",
            color: "var(--text3)",
            width: "200px",
          }}
        >
          Anti-cheat
        </Typography>
        <StyledSwitch
          checked={
            mode === "mock"
              ? data.settings?.isAntiCheat
              : data.settings?.isAntiCheat
          }
          onChange={(e) => {
            const value = e.target.checked;
            setData((prev) => ({
              ...prev,
              settings: {
                ...prev.settings,
                isAntiCheat: value,
              },
            }));
            updateData({ params: { isAntiCheat: value } });
          }}
        />
      </Stack>
      <Stack gap="20px" flexDirection="row" alignItems="center">
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "14px",
            fontWeight: "700",
            color: "var(--text3)",
            width: "200px",
          }}
        >
          Full-screen mode
        </Typography>
        <StyledSwitch
          checked={
            mode === "mock"
              ? data.settings?.isFullScreenMode
              : data.settings?.isFullScreenMode
          }
          onChange={(e) => {
            const value = e.target.checked;
            setData((prev) => ({
              ...prev,
              settings: {
                ...prev.settings,
                isFullScreenMode: value,
              },
            }));
            updateData({ params: { isFullScreenMode: value } });
          }}
        />
      </Stack>
      <Stack gap="20px" flexDirection="row" alignItems="center">
        <Typography
          sx={{
            fontFamily: "Lato",
            fontSize: "14px",
            fontWeight: "700",
            color: "var(--text3)",
            width: "200px",
          }}
        >
          Randomize question ordering
        </Typography>
        <StyledSwitch
          checked={
            mode === "mock"
              ? data.settings?.isRandomQuestion
              : data.settings?.isRandomQuestion
          }
          onChange={(e) => {
            const value = e.target.checked;
            setData((prev) => ({
              ...prev,
              settings: {
                ...prev.settings,
                isRandomQuestion: value,
              },
            }));
            updateData({ params: { isRandomQuestion: value } });
          }}
        />
      </Stack>
      <Stack flexDirection="row" gap="50px">
        <Stack gap="20px" flexDirection="row" alignItems="center">
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "14px",
              fontWeight: "700",
              color: "var(--text3)",
              width: "200px",
            }}
          >
            Mcoins Reward
          </Typography>
          <StyledSwitch
            checked={
              mode === "mock"
                ? data.settings?.mCoinReward?.isEnabled
                : data.settings?.mCoinReward?.isEnabled
            }
            onChange={(e) => {
              setData((prev) => ({
                ...prev,
                settings: {
                  ...prev.settings,
                  mCoinReward: {
                    ...prev.settings.mCoinReward,
                    isEnabled: e.target.checked,
                  },
                },
              }));
              updateData({
                params: {
                  mCoinRewardIsEnabled: e.target.checked,
                },
              });
            }}
          />
        </Stack>
        <Stack>
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "14px",
              fontWeight: "700",
              color: "var(--text3)",
              width: "200px",
            }}
          >
            Select rewarding percentage
          </Typography>
          <Slider
            size="small"
            valueLabelDisplay={
              data.settings?.mCoinReward?.conditionPercent ? "auto" : "off"
            }
            value={data.settings?.mCoinReward?.conditionPercent}
            onChange={(e) => {
              setData((prev) => ({
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
            onBlur={(e) => {
              updateData({
                params: {
                  mCoinRewardConditionPercent: e.target.value,
                },
              });
            }}
            sx={{ color: "var(--primary-color)" }}
            disabled={!data.settings?.mCoinReward?.isEnabled}
          />
        </Stack>
        <Stack gap="5px">
          <Typography
            sx={{
              fontFamily: "Lato",
              fontSize: "14px",
              fontWeight: "700",
              color: "var(--text3)",
              width: "200px",
            }}
          >
            Coins to be rewarded
          </Typography>
          <StyledTextField
            placeholder="Enter coins"
            value={data.settings?.mCoinReward?.rewardCoin || ""}
            disabled={!data.settings?.mCoinReward?.isEnabled}
            onChange={(e) => {
              setData((prev) => ({
                ...prev,
                settings: {
                  ...prev.settings,
                  mCoinReward: {
                    ...prev.settings?.mCoinReward,
                    rewardCoin: e.target.value,
                  },
                },
              }));
            }}
            onFocus={(e) => {
              e.target.select();
            }}
            onBlur={(e) => {
              updateData({
                params: {
                  mCoinRewardRewardCoin: e.target.value,
                },
              });
            }}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
