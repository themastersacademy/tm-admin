import { dynamoDB } from "@/src/util/awsAgent";

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

  const filterClauses = ["begins_with(sKey, :s)"];
  const exprVals = {
    ":s": subjectID ? `QUESTIONS@${subjectID}` : "QUESTIONS@",
  };
  const exprNames = {};

  if (searchTerm) {
    filterClauses.push("contains(titleLower, :q)");
    exprVals[":q"] = searchTerm.toLowerCase();
  }
  if (type) {
    filterClauses.push("#t = :t");
    exprNames["#t"] = "type"; // 'type' is reserved word
    exprVals[":t"] = type;
  }
  if (difficultyLevel) {
    filterClauses.push("difficultyLevel = :d");
    exprVals[":d"] = difficultyLevel;
  }

  const baseParams = {
    TableName: TABLE,
    IndexName: "contentTableIndex",
    KeyConditionExpression: "GSI1-pKey = :p AND GSI1-sKey = :s",
    ExpressionAttributeValues: {
      ":p": "QUESTIONS",
      ":s": "QUESTIONS",
    },
    FilterExpression: filterClauses.join(" AND "),
    ExpressionAttributeValues: exprVals,
    ...(Object.keys(exprNames).length && {
      ExpressionAttributeNames: exprNames,
    }),
    ReturnConsumedCapacity: "TOTAL",
  };

  if (!isRandom) {
    const params = {
      ...baseParams,
      Limit: limit,
      ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey }),
    };
    const page = await dynamoDB.scan(params).promise();

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
    const page = await dynamoDB
      .scan({
        ...baseParams,
        ProjectionExpression: "pKey, sKey",
        ...(lek && { ExclusiveStartKey: lek }),
      })
      .promise();
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
    const resp = await dynamoDB
      .batchGet({
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
      .promise();
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
