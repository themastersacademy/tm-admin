/**
 * Validates a question object against our flat schema:
 * {
 *   subjectID, title, type, difficultyLevel, options, answerKey, blanks, solution
 * }
 * @param {object} data - The full question data object.
 * @returns {boolean} - true if valid, false otherwise.
 */
export default function checkQuestionFormat(data) {
  const {
    subjectID,
    title,
    type,
    difficultyLevel,
    options = [],
    answerKey = [],
    blanks = [],
    solution,
  } = data;

  // Required top-level fields
  if (!subjectID || typeof subjectID !== "string") return false;
  if (!title || typeof title !== "string") return false;
  if (typeof solution !== "string") return false;
  if (!["MCQ", "MSQ", "FIB"].includes(type)) return false;
  if (![1, 2, 3].includes(difficultyLevel)) return false;
  // MCQ / MSQ validation
  if (type === "MCQ" || type === "MSQ") {
    if (!Array.isArray(options) || options.length < 2) return false;
    if (!Array.isArray(answerKey)) return false;
    // MCQ must have exactly 1 correct answer; MSQ at least 2
    if (type === "MCQ" && answerKey.length !== 1) return false;
    if (type === "MSQ" && answerKey.length < 2) return false;

    let totalWeight = 0;
    const validIds = new Set();
    for (const opt of options) {
      if (typeof opt.id !== "number") return false;
      validIds.add(opt.id);
      if (!opt.text || typeof opt.text !== "string") return false;
      if (typeof opt.weight !== "number" || opt.weight < 0) return false;
      totalWeight += opt.weight;
    }
    if (totalWeight !== 100) return false;
    // Ensure answerKey IDs match the options
    for (const id of answerKey) {
      if (!validIds.has(id)) return false;
    }
  }
  // FIB validation
  if (type === "FIB") {
    if (!Array.isArray(blanks) || blanks.length < 1) return false;
    for (const blank of blanks) {
      if (typeof blank.id !== "number") return false;
      if (
        !Array.isArray(blank.correctAnswers) ||
        blank.correctAnswers.length < 1
      )
        return false;
      for (const ans of blank.correctAnswers) {
        if (!ans || typeof ans !== "string") return false;
      }
    }
  }
  return true;
}
