import { dynamoDB } from "@/src/util/awsAgent";

// Fisher–Yates shuffle
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Split array into chunks of given size
function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Fetches a random subset of questions matching the provided filters.
 *
 * @param {Object} opts
 * @param {string} opts.subjectID         - The subject partition key.
 * @param {number} [opts.difficultyLevel] - 1=Easy, 2=Medium, 3=Hard.
 * @param {string} [opts.type]            - "MCQ" | "MSQ" | "FIB".
 * @param {number} opts.count             - Number of random questions to return.
 * @returns {Promise<Array>} Array of question objects with { id, title, options, type, difficultyLevel, blanks }.
 */
export async function getRandomQuestions({
  subjectID,
  difficultyLevel,
  type,
  count,
}) {
  if (!subjectID || typeof count !== "number" || count < 1) {
    throw new Error("subjectID and a positive count are required");
  }

  const TABLE = `${process.env.AWS_DB_NAME}content`;
  const sKey = `QUESTIONS@${subjectID}`;

  // 1) Query all matching IDs
  const queryParams = {
    TableName: TABLE,
    KeyConditionExpression: "sKey = :s",
    ExpressionAttributeValues: { ":s": sKey },
    ProjectionExpression: "pKey",
  };
  // Apply optional filters
  const filters = [];
  if (difficultyLevel) {
    filters.push("difficultyLevel = :d");
    queryParams.ExpressionAttributeValues[":d"] = difficultyLevel;
  }
  if (type) {
    filters.push("type = :t");
    queryParams.ExpressionAttributeValues[":t"] = type;
  }
  if (filters.length) {
    queryParams.FilterExpression = filters.join(" AND ");
  }

  let allIDs = [];
  let lastKey = undefined;
  do {
    if (lastKey) queryParams.ExclusiveStartKey = lastKey;
    const resp = await dynamoDB.query(queryParams).promise();
    allIDs.push(...(resp.Items || []).map((i) => i.pKey));
    lastKey = resp.LastEvaluatedKey;
  } while (lastKey);

  if (!allIDs.length) {
    return [];
  }

  // 2) Shuffle and take top `count`
  shuffleArray(allIDs);
  const selectedIDs = allIDs.slice(0, Math.min(count, allIDs.length));

  // 3) BatchGet details (chunked by 100 keys max)
  const chunks = chunkArray(selectedIDs, 100);
  const questionItems = [];
  for (const chunk of chunks) {
    const batchParams = {
      RequestItems: {
        [TABLE]: {
          Keys: chunk.map((pKey) => ({ pKey, sKey })),
          ProjectionExpression:
            "pKey, title, options, type, difficultyLevel, blanks",
        },
      },
    };
    const batchResp = await dynamoDB.batchGet(batchParams).promise();
    const items = batchResp.Responses?.[TABLE] || [];
    questionItems.push(...items);
  }

  // 4) Normalize and return
  return questionItems.map((item) => ({
    id: item.pKey.split("#")[1],
    title: item.title,
    options: item.options,
    type: item.type,
    difficultyLevel: item.difficultyLevel,
    blanks: item.blanks || [],
  }));
}

export default getRandomQuestions;
