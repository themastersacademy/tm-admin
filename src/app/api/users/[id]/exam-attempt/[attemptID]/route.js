import { dynamoDB, s3 } from "@/src/util/awsAgent";
import { QueryCommand, BatchGetCommand } from "@aws-sdk/lib-dynamodb";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function GET(req, { params }) {
  const { id, attemptID } = await params;

  try {
    // 1. Fetch Exam Attempt
    const attemptPKey = decodeURIComponent(attemptID);

    const attemptQuery = {
      TableName: `${process.env.AWS_DB_NAME}users`,
      KeyConditionExpression: "pKey = :pk",
      ExpressionAttributeValues: {
        ":pk": attemptPKey,
      },
    };

    const attemptRes = await dynamoDB.send(new QueryCommand(attemptQuery));
    const attempt = attemptRes.Items[0];

    if (!attempt) {
      return Response.json({ error: "Attempt not found" }, { status: 404 });
    }

    // 2. Fetch Exam Details (Questions)
    const { examID, blobBucketKey, blobVersion, type } = attempt;

    let questions = [];

    if (blobBucketKey) {
      // Fetch from S3
      const s3Params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: blobBucketKey,
      };
      const s3Data = await s3.send(new GetObjectCommand(s3Params));
      const bodyContents = await streamToString(s3Data.Body);
      const examData = JSON.parse(bodyContents);
      if (examData.sections) {
        questions = examData.sections.flatMap((section) => section.questions);
      } else {
        questions = examData.questions || [];
      }
    } else {
      // Fetch from DynamoDB (Master Table)
      const examParams = {
        TableName: `${process.env.AWS_DB_NAME}master`,
        KeyConditionExpression: "pKey = :pk AND sKey = :sk",
        ExpressionAttributeValues: {
          ":pk": `EXAM#${examID}`,
          ":sk": `EXAMS@${type}`,
        },
      };

      const examRes = await dynamoDB.send(new QueryCommand(examParams));
      const examItem = examRes.Items[0];

      if (examItem && examItem.questionSection) {
        // Collect all question IDs
        const allQuestionKeys = [];
        examItem.questionSection.forEach((section) => {
          section.questions.forEach((q) => {
            allQuestionKeys.push({
              pKey: `SUBJECT#${q.subjectID}`,
              sKey: `QUESTION#${q.questionID}`,
            });
          });
        });

        if (allQuestionKeys.length > 0) {
          const chunks = [];
          for (let i = 0; i < allQuestionKeys.length; i += 100) {
            chunks.push(allQuestionKeys.slice(i, i + 100));
          }

          for (const chunk of chunks) {
            const batchParams = {
              RequestItems: {
                [`${process.env.AWS_DB_NAME}content`]: {
                  Keys: chunk,
                },
              },
            };
            const batchRes = await dynamoDB.send(
              new BatchGetCommand(batchParams)
            );
            const batchQuestions =
              batchRes.Responses[`${process.env.AWS_DB_NAME}content`] || [];
            questions.push(...batchQuestions);
          }
        }
      }
    }

    // 3. Merge User Answers with Questions
    const detailedAttempt = {
      ...attempt,
      questions: questions.map((q) => {
        // Find user's answer for this question
        const questionID = q.sKey ? q.sKey.split("#")[1] : q.id || q.questionID;
        const userAnswer = attempt.userAnswers?.find(
          (a) => a.questionID === questionID
        );
        return {
          ...q,
          userAnswer: userAnswer || null,
        };
      }),
    };

    return Response.json({ success: true, data: detailedAttempt });
  } catch (error) {
    console.error("Error fetching attempt details:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// Helper to read S3 stream
const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
