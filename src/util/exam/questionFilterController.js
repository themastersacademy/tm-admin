import { dynamoDB } from "@/src/util/awsAgent";
import {
  QueryCommand,
  BatchGetCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

export async function getQuestions({
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

  // --- HELPER: Build Filters ---
  const buildFilters = () => {
    const clauses = [];
    const names = {};
    const values = {};

    if (searchTerm) {
      clauses.push("contains(titleLower, :q)");
      values[":q"] = searchTerm.toLowerCase();
    }
    if (type) {
      clauses.push("#t = :t");
      names["#t"] = "type";
      values[":t"] = type;
    }
    if (difficultyLevel) {
      clauses.push("difficultyLevel = :d");
      values[":d"] = difficultyLevel;
    }

    return {
      FilterExpression: clauses.length ? clauses.join(" AND ") : undefined,
      ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
      ExpressionAttributeValues: Object.keys(values).length
        ? values
        : undefined,
    };
  };

  // ==========================================
  // NON-RANDOM MODE
  // ==========================================
  if (!isRandom) {
    let items = [];
    let lek = lastEvaluatedKey;
    let params;

    const {
      FilterExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    } = buildFilters();

    // PATH 1: Subject Filtering (Optimized Folder Query)
    // PK = SUBJECT#<id>, SK begins_with QUESTION#
    if (subjectID) {
      params = {
        TableName: TABLE,
        KeyConditionExpression: "pKey = :pk AND begins_with(sKey, :sk)",
        ExpressionAttributeValues: {
          ...ExpressionAttributeValues,
          ":pk": `SUBJECT#${subjectID}`,
          ":sk": "QUESTION#",
        },
        ExpressionAttributeNames,
        FilterExpression,
        ReturnConsumedCapacity: "TOTAL",
      };
    }
    // PATH 2: Global Filtering (Optimized Global Index Query)
    // GSI1-PK = ALL_QUESTIONS, GSI1-SK begins_with TIMESTAMP#
    else {
      params = {
        TableName: TABLE,
        IndexName: "contentTableIndex",
        KeyConditionExpression:
          "#gsi1pk = :gsi1pk AND begins_with(#gsi1sk, :gsi1sk)",
        ExpressionAttributeNames: {
          ...ExpressionAttributeNames,
          "#gsi1pk": "GSI1-pKey",
          "#gsi1sk": "GSI1-sKey",
        },
        ExpressionAttributeValues: {
          ...ExpressionAttributeValues,
          ":gsi1pk": "ALL_QUESTIONS",
          ":gsi1sk": "TIMESTAMP#",
        },
        FilterExpression,
        ReturnConsumedCapacity: "TOTAL",
      };
    }

    do {
      const cmdParams = {
        ...params,
        ...(lek && { ExclusiveStartKey: lek }),
      };

      const page = await dynamoDB.send(new QueryCommand(cmdParams));
      const pageItems = page.Items || [];

      items.push(...pageItems);
      lek = page.LastEvaluatedKey;
    } while (items.length < limit && lek);

    const resultItems = items.slice(0, limit);

    // Construct LastEvaluatedKey from the last item in the result set
    // This is crucial because we might have fetched more items than the limit
    let nextKey = null;
    if (items.length > limit) {
      const lastItem = resultItems[resultItems.length - 1];
      if (subjectID) {
        nextKey = {
          pKey: lastItem.pKey,
          sKey: lastItem.sKey,
        };
      } else {
        nextKey = {
          pKey: lastItem.pKey,
          sKey: lastItem.sKey,
          "GSI1-pKey": lastItem["GSI1-pKey"],
          "GSI1-sKey": lastItem["GSI1-sKey"],
        };
      }
    } else if (lek) {
      // If we didn't exceed the limit but have a key from DynamoDB (e.g. hit scan limit but found exactly 'limit' items)
      nextKey = lek;
    }

    const questions = resultItems.map((it) => ({
      id: it.sKey.split("#")[1], // sKey is QUESTION#<id>
      subjectID: it.pKey.split("#")[1], // pKey is SUBJECT#<id>
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
      lastEvaluatedKey: nextKey,
    };
  }

  // ==========================================
  // RANDOM MODE
  // ==========================================
  let allIDs = [];
  let lek = null;

  do {
    let cmd;
    const {
      FilterExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    } = buildFilters();

    if (subjectID) {
      // Query Subject Partition
      cmd = new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "pKey = :pk AND begins_with(sKey, :sk)",
        ExpressionAttributeValues: {
          ...ExpressionAttributeValues,
          ":pk": `SUBJECT#${subjectID}`,
          ":sk": "QUESTION#",
        },
        ExpressionAttributeNames,
        FilterExpression,
        ProjectionExpression: "pKey, sKey",
        ...(lek && { ExclusiveStartKey: lek }),
      });
    } else {
      // Query Global Index
      cmd = new QueryCommand({
        TableName: TABLE,
        IndexName: "contentTableIndex",
        KeyConditionExpression:
          "#gsi1pk = :gsi1pk AND begins_with(#gsi1sk, :gsi1sk)",
        ExpressionAttributeNames: {
          ...ExpressionAttributeNames,
          "#gsi1pk": "GSI1-pKey",
          "#gsi1sk": "GSI1-sKey",
        },
        ExpressionAttributeValues: {
          ...ExpressionAttributeValues,
          ":gsi1pk": "ALL_QUESTIONS",
          ":gsi1sk": "TIMESTAMP#",
        },
        FilterExpression,
        ProjectionExpression: "pKey, sKey",
        ...(lek && { ExclusiveStartKey: lek }),
      });
    }

    const page = await dynamoDB.send(cmd);
    allIDs.push(
      ...(page.Items || []).map((i) => ({ pKey: i.pKey, sKey: i.sKey })),
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
      }),
    );
    detailed.push(...(resp.Responses?.[TABLE] || []));
  }

  const questions = detailed.map((it) => ({
    id: it.sKey.split("#")[1],
    subjectID: it.pKey.split("#")[1],
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

export async function getQuestionStats({
  subjectID,
  type,
  difficultyLevel,
  searchTerm,
} = {}) {
  const TABLE = `${process.env.AWS_DB_NAME}content`;

  // --- HELPER: Build Filters (Duplicated from getQuestions for independence) ---
  const buildFilters = () => {
    const clauses = [];
    const names = {};
    const values = {};

    if (searchTerm) {
      clauses.push("contains(titleLower, :q)");
      values[":q"] = searchTerm.toLowerCase();
    }
    if (type) {
      clauses.push("#t = :t");
      names["#t"] = "type";
      values[":t"] = type;
    }
    if (difficultyLevel) {
      clauses.push("difficultyLevel = :d");
      values[":d"] = difficultyLevel;
    }

    return {
      FilterExpression: clauses.length ? clauses.join(" AND ") : undefined,
      ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
      ExpressionAttributeValues: Object.keys(values).length
        ? values
        : undefined,
    };
  };

  const {
    FilterExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
  } = buildFilters();

  let params;
  if (subjectID) {
    // Query Subject Partition
    params = {
      TableName: TABLE,
      KeyConditionExpression: "pKey = :pk AND begins_with(sKey, :sk)",
      ExpressionAttributeValues: {
        ...ExpressionAttributeValues,
        ":pk": `SUBJECT#${subjectID}`,
        ":sk": "QUESTION#",
      },
      ExpressionAttributeNames,
      FilterExpression,
      ProjectionExpression: "difficultyLevel, #typeAttr, createdAt",
      ExpressionAttributeNames: {
        ...ExpressionAttributeNames,
        "#typeAttr": "type",
      },
    };
  } else {
    // Query Global Index
    params = {
      TableName: TABLE,
      IndexName: "contentTableIndex",
      KeyConditionExpression:
        "#gsi1pk = :gsi1pk AND begins_with(#gsi1sk, :gsi1sk)",
      ExpressionAttributeNames: {
        ...ExpressionAttributeNames,
        "#gsi1pk": "GSI1-pKey",
        "#gsi1sk": "GSI1-sKey",
        "#typeAttr": "type",
      },
      ExpressionAttributeValues: {
        ...ExpressionAttributeValues,
        ":gsi1pk": "ALL_QUESTIONS",
        ":gsi1sk": "TIMESTAMP#",
      },
      FilterExpression,
      ProjectionExpression: "difficultyLevel, #typeAttr, createdAt",
    };
  }

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
      }),
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

  // Use Query on ALL_QUESTIONS GSI instead of Scan
  const params = {
    TableName: TABLE,
    IndexName: "contentTableIndex",
    KeyConditionExpression:
      "#gsi1pk = :gsi1pk AND begins_with(#gsi1sk, :gsi1sk)",
    FilterExpression: "contains(titleLower, :q)",
    ExpressionAttributeNames: {
      "#gsi1pk": "GSI1-pKey",
      "#gsi1sk": "GSI1-sKey",
      "#typeAttr": "type",
    },
    ExpressionAttributeValues: {
      ":gsi1pk": "ALL_QUESTIONS",
      ":gsi1sk": "TIMESTAMP#",
      ":q": searchTerm.toLowerCase(),
    },
    ProjectionExpression:
      "pKey, sKey, title, #typeAttr, difficultyLevel, options, answerKey, blanks, solution, createdAt",
    ReturnConsumedCapacity: "TOTAL",
  };

  let allItems = [];
  let lek = null;
  let totalConsumedCapacity = 0;

  do {
    const command = new QueryCommand({
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
    `[Global Search] Term: "${searchTerm}" | Items Scanned: ${allItems.length} | Total Consumed Capacity: ${totalConsumedCapacity} RCUs`,
  );

  return allItems.map((it) => ({
    id: it.sKey.split("#")[1],
    subjectID: it.pKey.split("#")[1],
    title: it.title,
    type: it.type,
    difficultyLevel: it.difficultyLevel,
    options: it.options,
    answerKey: it.answerKey,
    blanks: it.blanks,
    solution: it.solution,
    createdAt: it.createdAt,
  }));
}
