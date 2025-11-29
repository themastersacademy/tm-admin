/**
 * Ensure that your exam item has everything we need
 * to produce a student‐facing “blob.”
 */
export function validateExamForBlob(exam) {
  if (!exam || typeof exam !== "object") {
    throw new Error("Exam object is required");
  }

  // Top‐level string fields
  for (const key of ["title", "type"]) {
    if (typeof exam[key] !== "string" || !exam[key].trim()) {
      throw new Error(`Exam.${key} must be a non-empty string`);
    }
  }

  // Numeric fields
  for (const key of ["duration", "startTimeStamp"]) {
    if (typeof exam[key] !== "number") {
      throw new Error(`Exam.${key} must be a number`);
    }
  }

  // questionSection
  if (!Array.isArray(exam.questionSection) || !exam.questionSection.length) {
    throw new Error("Exam.questionSection must be a non-empty array");
  }
  exam.questionSection.forEach((sec, si) => {
    if (typeof sec.title !== "string") {
      throw new Error(`section[${si}].title must be a string`);
    }
    ["pMark", "nMark"].forEach((mk) => {
      if (sec[mk] == null || isNaN(sec[mk])) {
        throw new Error(`section[${si}].${mk} is required and must be numeric`);
      }
    });
    if (!Array.isArray(sec.questions) || !sec.questions.length) {
      throw new Error(`section[${si}].questions must be a non-empty array`);
    }
    sec.questions.forEach((q, qi) => {
      if (!q.questionID || !q.subjectID) {
        throw new Error(
          `section[${si}].questions[${qi}] must have questionID & subjectID`
        );
      }
    });
  });

  // settings
  if (typeof exam.settings !== "object" || exam.settings === null) {
    throw new Error("Exam.settings must be an object");
  }
  for (const flag of [
    "isShowResult",
    "isAntiCheat",
    "isFullScreenMode",
    "isProTest",
    "isRandomQuestion",
  ]) {
    if (typeof exam.settings[flag] !== "boolean") {
      throw new Error(`settings.${flag} must be a boolean`);
    }
  }
  const r = exam.settings.mCoinReward;
  if (typeof r !== "object" || r === null) {
    throw new Error("settings.mCoinReward must be an object");
  }
  if (typeof r.isEnabled !== "boolean") {
    throw new Error("settings.mCoinReward.isEnabled must be a boolean");
  }
  if (typeof r.conditionPercent !== "number") {
    throw new Error("settings.mCoinReward.conditionPercent must be a number");
  }
  if (typeof r.rewardCoin !== "number") {
    throw new Error("settings.mCoinReward.rewardCoin must be a number");
  }
}

/**
 * Validate that the batch list does not exceed the DynamoDB transaction limit.
 * @param {Array} batchList
 */
export function validateBatchListLimit(batchList) {
  if (batchList && batchList.length > 99) {
    throw new Error(
      "Cannot schedule exam for more than 99 batches at once due to system limits."
    );
  }
}
