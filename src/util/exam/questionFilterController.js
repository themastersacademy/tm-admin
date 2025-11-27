import { dynamoDB } from "@/src/util/awsAgent";
import {
  QueryCommand,
  BatchGetCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

export default async function getQuestions({
  subjectID,
  type,
  difficultyLevel,
  searchTerm,
  isRandom = false,
  count = 10,
  limit = 50,
  lastEvaluatedKey = null,
}) {
  const TABLE = `${process.env.AWS_DB_NAME}content`;

  // We want to query the GSI "contentTableIndex"
  // Partition Key: GSI1-pKey = "QUESTIONS"
  // Sort Key: GSI1-sKey = "QUESTIONS" (old) or "QUESTIONS#<timestamp>" (new)

  const keyCondition = " #gsi1pk = :gsi1pk AND begins_with(#gsi1sk, :gsi1sk) ";
  const exprAttrNames = {
    "#gsi1pk": "GSI1-pKey",
    "#gsi1sk": "GSI1-sKey",
  };
  const exprAttrValues = {
    ":gsi1pk": "QUESTIONS",
    ":gsi1sk": "QUESTIONS",
  };

  const filterClauses = [];

  // Subject filtering must be done via FilterExpression because GSI1-sKey doesn't contain subjectID
  if (subjectID) {
    filterClauses.push("begins_with(sKey, :subjectPrefix)");
    exprAttrValues[":subjectPrefix"] = `QUESTIONS@${subjectID}`;
  }

  if (searchTerm) {
    filterClauses.push("contains(titleLower, :q)");
    exprAttrValues[":q"] = searchTerm.toLowerCase();
  }
  if (type) {
    filterClauses.push("#t = :t");
    exprAttrNames["#t"] = "type";
    exprAttrValues[":t"] = type;
  }
  if (difficultyLevel) {
    filterClauses.push("difficultyLevel = :d");
    exprAttrValues[":d"] = difficultyLevel;
  }

  const baseParams = {
    TableName: TABLE,
    IndexName: "contentTableIndex",
    KeyConditionExpression: keyCondition,
    ExpressionAttributeNames: exprAttrNames,
    ExpressionAttributeValues: exprAttrValues,
    ...(filterClauses.length && {
      FilterExpression: filterClauses.join(" AND "),
    }),
    ReturnConsumedCapacity: "TOTAL",
  };

  if (!isRandom) {
    const params = {
      ...baseParams,
      Limit: limit,
      ScanIndexForward: false, // Reverse order (Newest first if GSI1-sKey has timestamp)
      ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey }),
    };

    // Use QueryCommand
    const page = await dynamoDB.send(new QueryCommand(params));

    const questions = (page.Items || []).map((it) => ({
      id: it.pKey.split("#")[1],
      subjectID: it.sKey.split("@")[1],
      title: it.title,
      type: it.type,
      difficultyLevel: it.difficultyLevel,
      options: it.options,
      answerKey: it.answerKey,
      blanks: it.blanks,
      solution: it.solution,
      createdAt: it.createdAt,
    }));

    return {
      questions,
      lastEvaluatedKey: page.LastEvaluatedKey || null,
    };
  }

  // Random mode:
  let allIDs = [];
  let lek = null;
  do {
    // Use QueryCommand to get all IDs efficiently
    const page = await dynamoDB.send(
      new QueryCommand({
        ...baseParams,
        ProjectionExpression: "pKey, sKey",
        ...(lek && { ExclusiveStartKey: lek }),
      })
    );
    allIDs.push(
      ...(page.Items || []).map((i) => ({ pKey: i.pKey, sKey: i.sKey }))
    );
    lek = page.LastEvaluatedKey;
  } while (lek);

  if (!allIDs.length) {
    return { questions: [], lastEvaluatedKey: null };
  }

  // Fisher–Yates shuffle
  for (let i = allIDs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allIDs[i], allIDs[j]] = [allIDs[j], allIDs[i]];
  }

  const selected = allIDs.slice(0, Math.min(count, allIDs.length));

  // BatchGet
  const chunks = [];
  for (let i = 0; i < selected.length; i += 100) {
    chunks.push(selected.slice(i, i + 100));
  }

  const detailed = [];
  for (const chunk of chunks) {
    const resp = await dynamoDB.send(
      new BatchGetCommand({
        RequestItems: {
          [TABLE]: {
            Keys: chunk.map(({ pKey, sKey }) => ({ pKey, sKey })),
            ProjectionExpression:
              "pKey, sKey, title, options, #typeAttr, answerKey, blanks, solution, difficultyLevel",
            ExpressionAttributeNames: {
              "#typeAttr": "type",
            },
          },
        },
      })
    );
    detailed.push(...(resp.Responses?.[TABLE] || []));
  }

  const questions = detailed.map((it) => ({
    id: it.pKey.split("#")[1],
    subjectID: it.sKey.split("@")[1],
    title: it.title,
    type: it.type,
    difficultyLevel: it.difficultyLevel,
    options: it.options,
    answerKey: it.answerKey,
    blanks: it.blanks,
    solution: it.solution,
  }));

  return { questions, lastEvaluatedKey: null };
}

export async function getQuestionStats() {
  const TABLE = `${process.env.AWS_DB_NAME}content`;
  const keyCondition = " #gsi1pk = :gsi1pk AND begins_with(#gsi1sk, :gsi1sk) ";
  const exprAttrNames = {
    "#gsi1pk": "GSI1-pKey",
    "#gsi1sk": "GSI1-sKey",
  };
  const exprAttrValues = {
    ":gsi1pk": "QUESTIONS",
    ":gsi1sk": "QUESTIONS",
  };

  const params = {
    TableName: TABLE,
    IndexName: "contentTableIndex",
    KeyConditionExpression: keyCondition,
    ExpressionAttributeNames: exprAttrNames,
    ExpressionAttributeValues: exprAttrValues,
    ProjectionExpression: "difficultyLevel, #typeAttr, createdAt",
    ExpressionAttributeNames: {
      ...exprAttrNames,
      "#typeAttr": "type",
    },
  };

  let totalQuestions = 0;
  let difficultyCounts = { 1: 0, 2: 0, 3: 0 };
  let typeCounts = { MCQ: 0, MSQ: 0, FIB: 0 };
  let recentCount = 0; // Added in last 30 days

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

  let lek = null;
  do {
    const page = await dynamoDB.send(
      new QueryCommand({
        ...params,
        ...(lek && { ExclusiveStartKey: lek }),
      })
    );

    const items = page.Items || [];
    totalQuestions += items.length;

    items.forEach((it) => {
      // Difficulty
      if (it.difficultyLevel) {
        difficultyCounts[it.difficultyLevel] =
          (difficultyCounts[it.difficultyLevel] || 0) + 1;
      }
      // Type
      if (it.type) {
        typeCounts[it.type] = (typeCounts[it.type] || 0) + 1;
      }
      // Recent
      if (it.createdAt && it.createdAt >= thirtyDaysAgoIso) {
        recentCount++;
      }
    });

    lek = page.LastEvaluatedKey;
  } while (lek);

  return {
    totalQuestions,
    difficultyCounts,
    typeCounts,
    recentCount,
  };
}
