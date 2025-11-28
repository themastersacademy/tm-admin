/**
 * Sanitize raw Excel JSON into structured question objects with validation.
 * Supported question types: MCQ, MSQ, FIB
 * Returns an object containing an array of sanitized questions and any errors encountered.
 *
 * @param {Array<Object>} rows - Raw JSON rows from Excel import
 * @param {string} subjectID - ID of the subject to which all questions belong
 * @returns {{ questions: Array<Object>, errors: Array<Object> }}
 */
export function sanitizeQuestions(rows, subjectID) {
  console.log(rows);
  const questions = [];
  const errors = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 1;
    const qErrors = [];

    // Extract & normalize
    const title = String(row["Question"] || "").trim();
    const type = String(row["Type"] || "")
      .trim()
      .toUpperCase();
    const rawLevel = Number(row["Level"]);

    // Normalize difficulty level: Excel uses 0,1,2 but DB expects 1,2,3
    // So we add 1 to convert 0->1, 1->2, 2->3
    let difficultyLevel = NaN;
    if (
      Number.isFinite(rawLevel) &&
      Number.isInteger(rawLevel) &&
      rawLevel >= 0
    ) {
      difficultyLevel = rawLevel + 1; // Convert 0-based to 1-based
    }

    const solution = String(row["Solution"] || "").trim();

    // Top-level validation
    if (!subjectID) qErrors.push("System Error: Invalid Subject ID.");
    if (!title) qErrors.push("Question Text is missing.");
    if (!solution) qErrors.push("Solution/Explanation is missing.");
    if (!["MCQ", "MSQ", "FIB"].includes(type))
      qErrors.push(
        `Invalid Question Type "${row["Type"]}". Allowed: MCQ, MSQ, FIB.`
      );
    if (
      !Number.isInteger(difficultyLevel) ||
      difficultyLevel < 1 ||
      difficultyLevel > 3
    )
      qErrors.push(
        `Invalid Difficulty Level "${row["Level"]}". Must be 0 (Easy), 1 (Medium), or 2 (Hard).`
      );

    // Base object
    const question = {
      subjectID,
      title,
      type,
      difficultyLevel,
      options: [],
      answerKey: [],
      blanks: [],
      solution,
    };

    if (type === "MCQ" || type === "MSQ") {
      // Build options
      const opts = [];
      for (let i = 1; i <= 4; i++) {
        const rawOpt = row[`Option ${i}`];
        const text = rawOpt != null ? String(rawOpt).trim() : "";
        if (text) opts.push({ id: opts.length, text, weight: 0 });
      }
      if (opts.length < 2) qErrors.push("At least 2 Options are required.");

      // Parse answers
      const rawAns = String(row["Correct answers"] || "").trim();
      const keys = rawAns ? rawAns.split(",").map((s) => s.trim()) : [];
      if (!rawAns) qErrors.push("Correct Answer is missing.");
      if (type === "MSQ" && keys.length < 2)
        qErrors.push("MSQ must have at least two correct answers.");
      if (type === "MCQ" && keys.length !== 1)
        qErrors.push("MCQ must have exactly one correct answer.");

      // Map keys to option IDs (1-based numbers or exact text)
      const foundSet = new Set();
      keys.forEach((k) => {
        let id = NaN;
        // If numeric, treat as 1-based index
        if (/^\d+$/.test(k)) {
          const num = Number(k);
          if (num >= 1 && num <= opts.length) id = num - 1;
        }
        // Fallback to matching text
        if (isNaN(id)) {
          const opt = opts.find((o) => o.text === k);
          if (opt) id = opt.id;
        }
        if (!isNaN(id)) {
          foundSet.add(id);
        } else {
          qErrors.push(`Answer Key "${k}" does not match any provided Option.`);
        }
      });
      const foundKeys = Array.from(foundSet).sort((a, b) => a - b);

      // Distribute weightages
      if (foundKeys.length) {
        const share = Math.floor(100 / foundKeys.length);
        foundKeys.forEach((id) => {
          opts[id].weight = share;
        });
        const total = opts.reduce((sum, o) => sum + o.weight, 0);
        const diff = 100 - total;
        if (diff !== 0) opts[foundKeys[foundKeys.length - 1]].weight += diff;
      }

      // Validate total weight
      const totalWeight = opts.reduce((sum, o) => sum + o.weight, 0);
      if (totalWeight !== 100)
        qErrors.push(`Total weightage must equal 100, got ${totalWeight}.`);

      question.options = opts;
      question.answerKey = foundKeys;
    } else if (type === "FIB") {
      // Collect blanks (normalize typo Bank)
      const blanks = [];
      for (let i = 1; i <= 4; i++) {
        const key = row.hasOwnProperty(`Blank ${i}`)
          ? `Blank ${i}`
          : row.hasOwnProperty(`Bank ${i}`)
          ? `Bank ${i}`
          : null;
        if (!key) continue;
        const raw = row[key];
        if (raw !== "" && raw != null) {
          blanks.push({
            id: blanks.length,
            correctAnswers: [String(raw).trim()],
            weight: 0,
          });
        }
      }
      if (blanks.length < 1) qErrors.push("FIB must have at least one blank.");

      // Distribute weightages equally
      if (blanks.length) {
        const share = Math.floor(100 / blanks.length);
        blanks.forEach((b) => (b.weight = share));
        const total = blanks.reduce((sum, b) => sum + b.weight, 0);
        const diff = 100 - total;
        if (diff !== 0) blanks[blanks.length - 1].weight += diff;
      }

      question.blanks = blanks;
    }

    // Final record
    if (qErrors.length > 0) {
      errors.push({ row: rowNum, errors: qErrors });
    } else {
      questions.push(question);
    }
  });

  return { questions, errors };
}
