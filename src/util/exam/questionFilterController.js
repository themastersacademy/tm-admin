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

  const filterClauses = [];
  const exprAttrNames = {};
  const exprAttrValues = {};

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

  if (!isRandom) {
    // Use ScanCommand to handle mixed GSI schemas (Old "QUESTIONS" PK vs New "SUBJECT#..." PK)
    // and to ensure accurate filtering by inspecting all items.

    const scanFilterClauses = [...filterClauses];
    const scanAttrValues = { ...exprAttrValues };
    const scanAttrNames = { ...exprAttrNames };

    const scanParams = {
      TableName: TABLE,
      IndexName: "contentTableIndex",
      ExpressionAttributeNames: Object.keys(scanAttrNames).length
        ? scanAttrNames
        : undefined,
      ExpressionAttributeValues: Object.keys(scanAttrValues).length
        ? scanAttrValues
        : undefined,
      FilterExpression: scanFilterClauses.length
        ? scanFilterClauses.join(" AND ")
        : undefined,
      ReturnConsumedCapacity: "TOTAL",
    };

    let items = [];
    let lek = lastEvaluatedKey;

    do {
      // No Limit in the Scan command itself to maximize throughput per request
      const params = {
        ...scanParams,
        ...(lek && { ExclusiveStartKey: lek }),
      };

      const page = await dynamoDB.send(new ScanCommand(params));
      const pageItems = page.Items || [];

      items.push(...pageItems);
      lek = page.LastEvaluatedKey;
    } while (items.length < limit && lek);

    // Sort by createdAt descending (Scan does not guarantee order)
    items.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    const resultItems = items.slice(0, limit);

    const questions = resultItems.map((it) => ({
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
      lastEvaluatedKey: lek || null,
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

export async function searchAllQuestions(searchTerm) {
  const TABLE = `${process.env.AWS_DB_NAME}content`;
  const params = {
    TableName: TABLE,
    FilterExpression: "contains(titleLower, :q)",
    ExpressionAttributeValues: {
      ":q": searchTerm.toLowerCase(),
    },
    ProjectionExpression:
      "pKey, sKey, title, #typeAttr, difficultyLevel, createdAt",
    ExpressionAttributeNames: {
      "#typeAttr": "type",
    },
    ReturnConsumedCapacity: "TOTAL",
  };

  let allItems = [];
  let lek = null;
  let totalConsumedCapacity = 0;

  do {
    const command = new ScanCommand({
      ...params,
      ...(lek && { ExclusiveStartKey: lek }),
    });
    const response = await dynamoDB.send(command);
    if (response.Items) {
      allItems.push(...response.Items);
    }
    if (response.ConsumedCapacity) {
      totalConsumedCapacity += response.ConsumedCapacity.CapacityUnits || 0;
    }
    lek = response.LastEvaluatedKey;
  } while (lek);

  console.log(
    `[Global Search] Term: "${searchTerm}" | Items Scanned: ${allItems.length} | Total Consumed Capacity: ${totalConsumedCapacity} RCUs`
  );

  return allItems.map((it) => ({
    id: it.pKey.split("#")[1],
    subjectID: it.sKey.split("@")[1],
    title: it.title,
    type: it.type,
    difficultyLevel: it.difficultyLevel,
    createdAt: it.createdAt,
  }));
}
