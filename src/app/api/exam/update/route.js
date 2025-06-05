import { updateExamBasicInfo } from "@/src/util/exam/examController";

export async function POST(req) {
  const {
    examID,
    type,
    title,
    duration: durationRaw,
    startTimeStamp: startTimeRaw,
    endTimeStamp: endTimeRaw,
    isShowResult,
    isAntiCheat,
    isFullScreenMode,
    isProTest,
    isRandomQuestion,
    mCoinRewardIsEnabled,
    mCoinRewardConditionPercent: mCoinRewardCondRaw,
    mCoinRewardRewardCoin: mCoinRewardCoinRaw,
    isLifeTime,
  } = await req.json();
  if (!examID || !type) {
    return Response.json(
      { success: false, message: "examID and type are required" },
      { status: 400 }
    );
  }

  // 2) parse numbers only if they’re provided
  const duration = durationRaw !== undefined ? Number(durationRaw) : undefined;
  const startTimeStamp =
    startTimeRaw !== undefined ? Number(startTimeRaw) : undefined;
  const endTimeStamp =
    endTimeRaw !== undefined ? Number(endTimeRaw) : undefined;
  const mCoinRewardConditionPercent =
    mCoinRewardCondRaw !== undefined ? Number(mCoinRewardCondRaw) : undefined;
  const mCoinRewardRewardCoin =
    mCoinRewardCoinRaw !== undefined ? Number(mCoinRewardCoinRaw) : undefined;

  try {
    const result = await updateExamBasicInfo({
      examID,
      type,
      title,
      duration,
      isShowResult,
      isAntiCheat,
      isFullScreenMode,
      isProTest,
      startTimeStamp,
      isLifeTime,
      endTimeStamp,
      isRandomQuestion,
      mCoinRewardIsEnabled,
      mCoinRewardConditionPercent,
      mCoinRewardRewardCoin,
    });
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
