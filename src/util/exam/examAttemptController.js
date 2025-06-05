import { dynamoDB } from "../awsAgent";

const USER_TABLE = `${process.env.AWS_DB_NAME}users`;
const USER_GSI_INDEX = "GSI1-index";
  
export async function getAllExamAttemptsByExamID(examID) {
  const params = {
    TableName: USER_TABLE,
    IndexName: USER_GSI_INDEX,
    KeyConditionExpression: "#gsi1pKey = :pKey",
    ExpressionAttributeNames: {
      "#gsi1pKey": "GSI1-pKey",
    },
    ExpressionAttributeValues: {
      ":pKey": "EXAM_ATTEMPTS",
      ":examID": examID,
    },
    FilterExpression: "examID = :examID",
    // ProjectionExpression: `userMeta, batchMeta,
    //                     title, #status, obtainedMarks, 
    //                     totalMarks, totalAttemptedAnswers, totalCorrectAnswers, 
    //                     totalWrongAnswers, totalSkippedAnswers, totalSections, startTimeStamp, 
    //                     blobVersion, #duration, createdAt, settings, #type, totalQuestions`,
  };
  const response = await dynamoDB.query(params).promise();
  const Items = response.Items;

  return {
    success: true,
    data: Items,
  };
}
