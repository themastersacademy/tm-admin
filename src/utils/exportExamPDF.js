"use client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Export exam details to PDF with enhanced first page and professional question design
 * @param {Object} examDetails - The exam details object containing questions, student info, etc.
 * @param {Array} answerList - The answer key for the exam
 * @param {Object} student - The student profile object
 */
export const exportExamToPDF = (examDetails, answerList = [], student = {}) => {
  if (!examDetails) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Colors
  const colors = {
    primary: [102, 126, 234],
    primaryLight: [240, 242, 253],
    text: [33, 33, 33],
    textLight: [117, 117, 117],
    success: [76, 175, 80],
    successLight: [232, 245, 233],
    error: [244, 67, 54],
    errorLight: [255, 235, 238],
    warning: [255, 152, 0],
    warningLight: [255, 243, 224],
    grey: [158, 158, 158],
    greyLight: [245, 245, 245],
    border: [224, 224, 224],
    white: [255, 255, 255],
  };

  // Helper: Draw rounded box
  const drawBox = (
    x,
    y,
    width,
    height,
    fillColor,
    borderColor = null,
    radius = 3
  ) => {
    doc.setFillColor(...fillColor);
    if (borderColor) {
      doc.setDrawColor(...borderColor);
      doc.roundedRect(x, y, width, height, radius, radius, "FD");
    } else {
      doc.roundedRect(x, y, width, height, radius, radius, "F");
    }
  };

  // Calculate comprehensive stats
  let totalCorrect = 0,
    totalIncorrect = 0,
    totalSkipped = 0,
    totalUnattempted = 0;
  let mcqCorrect = 0,
    mcqTotal = 0;
  let msqCorrect = 0,
    msqTotal = 0;
  let fibCorrect = 0,
    fibTotal = 0;

  examDetails.questions?.forEach((q) => {
    const ua = q.userAnswer;

    // Count by type
    if (q.type === "MCQ") mcqTotal++;
    else if (q.type === "MSQ") msqTotal++;
    else if (q.type === "FIB") fibTotal++;

    if (!ua) {
      totalUnattempted++;
    } else {
      const isSkippedMCQMSQ =
        (q.type === "MCQ" || q.type === "MSQ") &&
        ua.selectedOptions?.length === 0;
      const isSkippedFIB =
        q.type === "FIB" &&
        (ua.blankAnswers?.length === 0 ||
          ua.blankAnswers?.every((a) => a.trim() === ""));

      if (isSkippedMCQMSQ || isSkippedFIB) {
        totalSkipped++;
      } else if (ua.isCorrect) {
        totalCorrect++;
        if (q.type === "MCQ") mcqCorrect++;
        else if (q.type === "MSQ") msqCorrect++;
        else if (q.type === "FIB") fibCorrect++;
      } else {
        totalIncorrect++;
      }
    }
  });

  const percentage = Math.round(
    (examDetails.obtainedMarks / examDetails.totalMarks) * 100
  );

  // === PAGE 1: COMPREHENSIVE SUMMARY ===

  // Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.text);
  doc.text("Exam Report", margin, yPosition);
  yPosition += 8;

  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Student Info Card
  drawBox(
    margin,
    yPosition,
    pageWidth - 2 * margin,
    38,
    colors.greyLight,
    colors.border
  );

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.text);
  doc.text("Student Information", margin + 8, yPosition + 8);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.textLight);
  doc.text("Name:", margin + 8, yPosition + 17);
  doc.setTextColor(...colors.text);
  doc.text(student.name || "N/A", margin + 35, yPosition + 17);

  doc.setTextColor(...colors.textLight);
  doc.text("Email:", margin + 8, yPosition + 24);
  doc.setTextColor(...colors.text);
  const emailText = doc.splitTextToSize(
    student.email || "N/A",
    pageWidth - 2 * margin - 45
  );
  doc.text(emailText, margin + 35, yPosition + 24);

  doc.setTextColor(...colors.textLight);
  doc.text("Phone:", margin + 8, yPosition + 31);
  doc.setTextColor(...colors.text);
  doc.text(student.phoneNumber || "N/A", margin + 35, yPosition + 31);

  yPosition += 48;

  // Exam Details Card
  drawBox(
    margin,
    yPosition,
    pageWidth - 2 * margin,
    45,
    colors.primaryLight,
    colors.primary
  );

  const titleLines = doc.splitTextToSize(
    examDetails.title,
    pageWidth - 2 * margin - 80
  );
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.text);
  doc.text(titleLines, margin + 8, yPosition + 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.textLight);
  doc.text(
    new Date(examDetails.startTimeStamp).toLocaleString(),
    margin + 8,
    yPosition + 12 + titleLines.length * 5.5 + 5
  );

  doc.setFontSize(10);
  doc.text(
    `Type: ${examDetails.type || "Practice"}`,
    margin + 8,
    yPosition + 12 + titleLines.length * 5.5 + 12
  );

  // Score display
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primary);
  doc.text(`${percentage}%`, pageWidth - margin - 8, yPosition + 22, {
    align: "right",
  });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.textLight);
  doc.text(
    `${examDetails.obtainedMarks} / ${examDetails.totalMarks} marks`,
    pageWidth - margin - 8,
    yPosition + 32,
    { align: "right" }
  );

  yPosition += 55;

  // Performance Overview
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.text);
  doc.text("Performance Overview", margin, yPosition);
  yPosition += 10;

  const cardWidth = (pageWidth - 2 * margin - 15) / 4;
  const stats = [
    {
      label: "Total",
      value: examDetails.questions?.length || 0,
      color: colors.primary,
      bgColor: colors.primaryLight,
    },
    {
      label: "Correct",
      value: totalCorrect,
      color: colors.success,
      bgColor: colors.successLight,
    },
    {
      label: "Incorrect",
      value: totalIncorrect,
      color: colors.error,
      bgColor: colors.errorLight,
    },
    {
      label: "Skipped",
      value: totalSkipped + totalUnattempted,
      color: colors.warning,
      bgColor: colors.warningLight,
    },
  ];

  stats.forEach((stat, index) => {
    const x = margin + index * (cardWidth + 5);
    drawBox(x, yPosition, cardWidth, 22, stat.bgColor, stat.color, 2);

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.textLight);
    doc.text(stat.label.toUpperCase(), x + cardWidth / 2, yPosition + 7, {
      align: "center",
    });

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...stat.color);
    doc.text(String(stat.value), x + cardWidth / 2, yPosition + 17, {
      align: "center",
    });
  });

  yPosition += 32;

  // Detailed Statistics Table
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.text);
  doc.text("Detailed Statistics", margin, yPosition);
  yPosition += 8;

  const detailedStats = [
    ["Question Type", "Total", "Correct", "Accuracy"],
    [
      "Multiple Choice (MCQ)",
      mcqTotal,
      mcqCorrect,
      mcqTotal > 0 ? `${Math.round((mcqCorrect / mcqTotal) * 100)}%` : "N/A",
    ],
    [
      "Multiple Select (MSQ)",
      msqTotal,
      msqCorrect,
      msqTotal > 0 ? `${Math.round((msqCorrect / msqTotal) * 100)}%` : "N/A",
    ],
    [
      "Fill in Blanks (FIB)",
      fibTotal,
      fibCorrect,
      fibTotal > 0 ? `${Math.round((fibCorrect / fibTotal) * 100)}%` : "N/A",
    ],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [detailedStats[0]],
    body: detailedStats.slice(1),
    theme: "grid",
    headStyles: {
      fillColor: colors.primary,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      halign: "center",
    },
    columnStyles: {
      0: { halign: "left", fontStyle: "bold" },
    },
    margin: { left: margin, right: margin },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // Summary box
  drawBox(
    margin,
    yPosition,
    pageWidth - 2 * margin,
    30,
    colors.greyLight,
    colors.border
  );

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.text);
  doc.text("Summary", margin + 8, yPosition + 10);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.textLight);

  const grade =
    percentage >= 90
      ? "Excellent"
      : percentage >= 75
      ? "Very Good"
      : percentage >= 60
      ? "Good"
      : percentage >= 40
      ? "Pass"
      : "Needs Improvement";
  const attemptRate = Math.round(
    ((totalCorrect + totalIncorrect) / examDetails.questions.length) * 100
  );

  doc.text(
    `Grade: ${grade} | Attempt Rate: ${attemptRate}% | Total Marks: ${examDetails.obtainedMarks}/${examDetails.totalMarks}`,
    margin + 8,
    yPosition + 18
  );
  doc.text(
    `Questions Breakdown: ${totalCorrect} Correct, ${totalIncorrect} Incorrect, ${totalSkipped} Skipped, ${totalUnattempted} Unattempted`,
    margin + 8,
    yPosition + 25
  );

  // === PAGE 2+: QUESTION ANALYSIS ===
  doc.addPage();
  yPosition = margin;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.text);
  doc.text("Question-wise Analysis", margin, yPosition);
  yPosition += 5;

  doc.setDrawColor(...colors.border);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  examDetails.questions?.forEach((question, index) => {
    const ua = question.userAnswer;
    const answerInfo = answerList.find(
      (a) =>
        a.questionID === question.questionID || a.questionID === question.id
    );

    // Determine status
    let statusText = "Not Attempted";
    let statusColor = colors.grey;

    if (ua) {
      const isSkippedMCQMSQ =
        (question.type === "MCQ" || question.type === "MSQ") &&
        ua.selectedOptions?.length === 0;
      const isSkippedFIB =
        question.type === "FIB" &&
        (ua.blankAnswers?.length === 0 ||
          ua.blankAnswers?.every((a) => a.trim() === ""));

      if (isSkippedMCQMSQ || isSkippedFIB) {
        statusText = "Skipped";
        statusColor = colors.warning;
      } else if (ua.isCorrect) {
        statusText = "Correct";
        statusColor = colors.success;
      } else {
        statusText = "Incorrect";
        statusColor = colors.error;
      }
    }

    // Check page break
    if (yPosition + 60 > pageHeight - margin - 15) {
      doc.addPage();
      yPosition = margin;
    }

    // Question header - simple and professional
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.text);
    doc.text(`Q${index + 1}.`, margin, yPosition);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.textLight);
    doc.text(`[${question.type}]`, margin + 12, yPosition);

    doc.setTextColor(...statusColor);
    doc.setFont("helvetica", "bold");
    doc.text(statusText, margin + 30, yPosition);

    doc.setTextColor(...colors.textLight);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Marks: ${ua?.pMarkObtained || 0}/${question.pMark || 0}`,
      pageWidth - margin - 8,
      yPosition,
      { align: "right" }
    );

    yPosition += 8;

    // Question text
    const qText = (question.title || "")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.text);
    const qLines = doc.splitTextToSize(qText, pageWidth - 2 * margin - 5);
    doc.text(qLines, margin + 3, yPosition);
    yPosition += qLines.length * 4.5 + 5;

    // Options - clean table format
    if (question.type === "MCQ" || question.type === "MSQ") {
      const optionsData =
        question.options?.map((option, optIndex) => {
          const isSelected = ua?.selectedOptions?.includes(option.id);
          const correctOptionIds = answerInfo?.correct?.map((o) => o.id) || [];
          const isCorrect = correctOptionIds.includes(option.id);

          const optText = (option.text || "")
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/g, " ");
          const label = String.fromCharCode(65 + optIndex);

          let status = "";
          if (isSelected && isCorrect) status = "✓ Your Answer (Correct)";
          else if (isSelected && !isCorrect) status = "✗ Your Answer (Wrong)";
          else if (isCorrect) status = "✓ Correct Answer";

          return [label, optText, status];
        }) || [];

      autoTable(doc, {
        startY: yPosition,
        head: [["", "Option", "Status"]],
        body: optionsData,
        theme: "plain",
        headStyles: {
          fillColor: colors.greyLight,
          textColor: colors.text,
          fontSize: 8,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 9,
        },
        columnStyles: {
          0: { cellWidth: 10, fontStyle: "bold", halign: "center" },
          1: { cellWidth: pageWidth - 2 * margin - 50 },
          2: { cellWidth: 40, fontSize: 8 },
        },
        margin: { left: margin + 3 },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 2) {
            const text = data.cell.text[0];
            if (text.includes("✓ Your Answer")) {
              data.cell.styles.textColor = colors.success;
              data.cell.styles.fontStyle = "bold";
            } else if (text.includes("✗")) {
              data.cell.styles.textColor = colors.error;
              data.cell.styles.fontStyle = "bold";
            } else if (text.includes("✓ Correct")) {
              data.cell.styles.textColor = colors.success;
            }
          }
        },
      });

      yPosition = doc.lastAutoTable.finalY + 5;
    }

    // FIB - simple format
    if (question.type === "FIB" && ua?.blankAnswers) {
      ua.blankAnswers.forEach((ans, bIndex) => {
        const correctAnswers =
          answerInfo?.blanks?.[bIndex]?.correctAnswers || [];
        const isCorrect = correctAnswers.some(
          (a) => a.trim().toLowerCase() === ans.trim().toLowerCase()
        );

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...colors.textLight);
        doc.text(`Blank ${bIndex + 1}:`, margin + 5, yPosition);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(...colors.text);
        doc.text(`Your Answer: ${ans}`, margin + 25, yPosition);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(...(isCorrect ? colors.success : colors.error));
        doc.text(
          isCorrect ? "✓ Correct" : "✗ Incorrect",
          pageWidth - margin - 25,
          yPosition,
          { align: "right" }
        );

        yPosition += 6;
      });
      yPosition += 3;
    }

    // Separator
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 12;
  });

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    doc.setFontSize(8);
    doc.setTextColor(...colors.textLight);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });
    doc.text(
      `Generated: ${new Date().toLocaleString()}`,
      margin,
      pageHeight - 10
    );
  }

  const filename = `${
    student.name?.replace(/[^a-z0-9]/gi, "_") || "Student"
  }_Exam_Report.pdf`;
  doc.save(filename);
};
