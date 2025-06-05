export const addOption = (options = [], questionType) => {
  const newOption = { title: "", weightage: 0, isCorrect: false };
  let updatedOptions = [...options, newOption];

  if (questionType === "FIB") {
    const totalBlanks = updatedOptions.length;
    updatedOptions = updatedOptions.map((opt) => ({
      ...opt,
      weightage: 100 / totalBlanks,
    }));
  }

  return updatedOptions;
};

export const removeOption = (options = [], index, questionType) => {
  let updatedOptions = options.filter((_, i) => i !== index);

  if (questionType === "MCQ") {
    if (updatedOptions.length > 0) {
      updatedOptions[0].isCorrect = true;
      updatedOptions[0].weightage = 100;
    }
  }

  if (questionType === "MSQ") {
    let totalWeightage = updatedOptions.reduce(
      (sum, opt) => sum + (opt.isCorrect ? opt.weightage : 0),
      0
    );

    if (totalWeightage !== 100 && updatedOptions.length > 0) {
      let correctOptions = updatedOptions.filter((opt) => opt.isCorrect);
      if (correctOptions.length > 0) {
        let distributedWeight = 100 / correctOptions.length;
        updatedOptions = updatedOptions.map((opt) => ({
          ...opt,
          weightage: opt.isCorrect ? distributedWeight : 0,
        }));
      }
    }
  }

  return updatedOptions;
};
