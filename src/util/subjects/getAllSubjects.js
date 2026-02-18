import { dynamoDB } from "../awsAgent";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export default async function getAllSubjects() {
  const TABLE = `${process.env.AWS_DB_NAME}content`;
  const allItems = [];
  let lastKey;

  // DynamoDB Scan returns at most 1MB per call.
  // We must paginate until LastEvaluatedKey is undefined to get ALL subjects.
  do {
    const params = {
      TableName: TABLE,
      FilterExpression: "sKey = :sKey AND begins_with(pKey, :pKeyPrefix)",
      ExpressionAttributeValues: {
        ":sKey": "METADATA",
        ":pKeyPrefix": "SUBJECT#",
      },
      ...(lastKey && { ExclusiveStartKey: lastKey }),
    };

    const response = await dynamoDB.send(new ScanCommand(params));
    allItems.push(...(response.Items || []));
    lastKey = response.LastEvaluatedKey;
  } while (lastKey);

  return {
    success: true,
    message: "Subjects fetched successfully",
    data: {
      subjects: allItems.map((subject) => ({
        subjectID: subject.pKey.split("#")[1],
        title: subject.title,
        createdAt: subject.createdAt,
        updatedAt: subject.updatedAt,
        totalQuestions: subject.totalQuestions,
      })),
    },
  };
}
