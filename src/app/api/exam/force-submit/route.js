import { dynamoDB } from "@/src/util/awsAgent";
import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const USER_TABLE = `${process.env.AWS_DB_NAME}users`;

export async function POST(request) {
  try {
    const { attemptPKey } = await request.json();

    if (!attemptPKey) {
      return Response.json(
        { success: false, message: "attemptPKey is required" },
        { status: 400 }
      );
    }

    // 1. Query the attempt to get full item (need sKey for update)
    const queryRes = await dynamoDB.send(
      new QueryCommand({
        TableName: USER_TABLE,
        KeyConditionExpression: "pKey = :pk",
        ExpressionAttributeValues: { ":pk": attemptPKey },
      })
    );

    const attempt = queryRes.Items?.[0];
    if (!attempt) {
      return Response.json(
        { success: false, message: "Attempt not found" },
        { status: 404 }
      );
    }

    if (attempt.status === "COMPLETED") {
      return Response.json(
        { success: false, message: "Attempt is already completed" },
        { status: 400 }
      );
    }

    if (attempt.status !== "IN_PROGRESS") {
      return Response.json(
        { success: false, message: "Only IN_PROGRESS attempts can be force-submitted" },
        { status: 400 }
      );
    }

    // 2. Calculate marks from userAnswers
    let obtainedMarks = 0;
    let totalCorrectAnswers = 0;
    let totalWrongAnswers = 0;
    let totalSkippedAnswers = 0;
    let totalAttemptedAnswers = 0;

    const userAnswers = attempt.userAnswers || [];
    userAnswers.forEach((answer) => {
      if (answer.isCorrect) {
        totalCorrectAnswers++;
        obtainedMarks += answer.marks || 0;
      } else if (answer.selectedOptions?.length > 0 || answer.blankAnswers?.some((a) => a?.trim())) {
        totalWrongAnswers++;
        obtainedMarks += answer.negativeMarks ? -Math.abs(answer.negativeMarks) : 0;
      } else {
        totalSkippedAnswers++;
      }
      totalAttemptedAnswers++;
    });

    // 3. Update the attempt status to COMPLETED
    await dynamoDB.send(
      new UpdateCommand({
        TableName: USER_TABLE,
        Key: { pKey: attemptPKey, sKey: attempt.sKey },
        UpdateExpression: `SET #status = :status, obtainedMarks = :obtainedMarks,
          totalCorrectAnswers = :totalCorrect, totalWrongAnswers = :totalWrong,
          totalSkippedAnswers = :totalSkipped, totalAttemptedAnswers = :totalAttempted,
          adminForceSubmitted = :adminForceSubmitted, adminForceSubmittedAt = :now`,
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": "COMPLETED",
          ":obtainedMarks": obtainedMarks,
          ":totalCorrect": totalCorrectAnswers,
          ":totalWrong": totalWrongAnswers,
          ":totalSkipped": totalSkippedAnswers,
          ":totalAttempted": totalAttemptedAnswers,
          ":adminForceSubmitted": true,
          ":now": Date.now(),
        },
      })
    );

    return Response.json({
      success: true,
      message: "Attempt force-submitted successfully",
      data: {
        obtainedMarks,
        totalCorrectAnswers,
        totalWrongAnswers,
        totalSkippedAnswers,
      },
    });
  } catch (error) {
    console.error("Force submit error:", error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
