import { dynamoDB } from "../awsAgent";
import { TransactWriteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

export default async function updateQuestion(questionData) {
  const {
    questionID,
    subjectID,
    oldSubjectID,
    title,
    type,
    difficultyLevel,
    options,
    answerKey,
    blanks,
    solution,
    createdAt,
  } = questionData;

  const now = Date.now();

  if (oldSubjectID && oldSubjectID !== subjectID) {
    // Move question to new subject
    // 1. Delete from old subject
    // 2. Add to new subject
    // 3. Decrement old subject count
    // 4. Increment new subject count

    const newItem = {
      pKey: `SUBJECT#${subjectID}`,
      sKey: `QUESTION#${questionID}`,
      "GSI1-pKey": "ALL_QUESTIONS",
      "GSI1-sKey": `TIMESTAMP#${now}`,
      title,
      titleLower: title.toLowerCase(),
      type,
      difficultyLevel,
      options,
      answerKey,
      blanks,
      solution,
      createdAt: createdAt || now,
      updatedAt: now,
    };

    const params = {
      TransactItems: [
        {
          Delete: {
            TableName: `${process.env.AWS_DB_NAME}content`,
            Key: {
              pKey: `SUBJECT#${oldSubjectID}`,
              sKey: `QUESTION#${questionID}`,
            },
          },
        },
        {
          Put: {
            TableName: `${process.env.AWS_DB_NAME}content`,
            Item: newItem,
          },
        },
        {
          Update: {
            TableName: `${process.env.AWS_DB_NAME}content`,
            Key: {
              pKey: `SUBJECT#${oldSubjectID}`,
              sKey: "METADATA",
            },
            UpdateExpression: "ADD totalQuestions :dec",
            ExpressionAttributeValues: {
              ":dec": -1,
            },
          },
        },
        {
          Update: {
            TableName: `${process.env.AWS_DB_NAME}content`,
            Key: {
              pKey: `SUBJECT#${subjectID}`,
              sKey: "METADATA",
            },
            UpdateExpression: "ADD totalQuestions :inc",
            ExpressionAttributeValues: {
              ":inc": 1,
            },
          },
        },
      ],
    };

    await dynamoDB.send(new TransactWriteCommand(params));
  } else {
    // Just update the item
    const params = {
      TableName: `${process.env.AWS_DB_NAME}content`,
      Key: {
        pKey: `SUBJECT#${subjectID}`,
        sKey: `QUESTION#${questionID}`,
      },
      UpdateExpression: `SET
        title = :title,
        titleLower = :titleLower,
        #type = :type,
        difficultyLevel = :difficultyLevel,
        options = :options,
        answerKey = :answerKey,
        blanks = :blanks,
        solution = :solution,
        updatedAt = :updatedAt
      `,
      ExpressionAttributeNames: {
        "#type": "type",
      },
      ExpressionAttributeValues: {
        ":title": title,
        ":titleLower": title.toLowerCase(),
        ":type": type,
        ":difficultyLevel": difficultyLevel,
        ":options": options,
        ":answerKey": answerKey,
        ":blanks": blanks,
        ":solution": solution,
        ":updatedAt": now,
      },
    };

    await dynamoDB.send(new UpdateCommand(params));
  }

  return {
    success: true,
    message: "Question updated successfully",
    data: { questionID, subjectID },
  };
}
