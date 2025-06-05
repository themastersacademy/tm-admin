import { dynamoDB } from "@/src/util/awsAgent";
import { randomUUID } from "crypto";

const TABLE = `${process.env.AWS_DB_NAME}master`;

/**
 * Create a new blog under a goal and append its reference to the goal's blogList.
 */
export async function createGoalContent({ goalID, content }) {
  if (!goalID || !content?.title || !content?.description) {
    return { success: false, message: "Missing required fields" };
  }

  const blogID = randomUUID();
  const now = Date.now();

  const blogItem = {
    pKey: `BLOG#${blogID}`,
    sKey: `BLOGS@${goalID}`,
    blogID,
    goalID,
    title: content.title,
    description: content.description,
    createdAt: now,
    updatedAt: now,
  };

  const putParams = {
    TableName: TABLE,
    Item: blogItem,
    ConditionExpression: "attribute_not_exists(pKey)",
  };

  const updateParams = {
    TableName: TABLE,
    Key: {
      pKey: `GOAL#${goalID}`,
      sKey: "GOALS",
    },
    UpdateExpression: `
      SET blogList = list_append(
        if_not_exists(blogList, :emptyList),
        :newRef
      ),
      updatedAt = :u
    `,
    ExpressionAttributeValues: {
      ":newRef": [{ blogID, title: content.title }],
      ":emptyList": [],
      ":u": now,
    },
    ConditionExpression: "attribute_exists(pKey)",
  };

  try {
    await dynamoDB
      .transactWrite({
        TransactItems: [{ Put: putParams }, { Update: updateParams }],
      })
      .promise();

    return {
      success: true,
      message: "Content added successfully",
      data: { blogID },
    };
  } catch (err) {
    console.log(err);

    console.error("Error creating goal content:", err);
    throw new Error("Internal server error");
  }
}

/**
 * Delete a blog reference from the goal and remove its item.
 */
export async function deleteGoalContent({ goalID, contentIndex }) {
  if (!goalID || contentIndex === undefined) {
    return { success: false, message: "Missing required fields" };
  }

  const { success, data: blogList } = await getGoalContent({ goalID });
  if (!success) {
    return { success: false, message: "Goal not found" };
  }

  if (contentIndex < 0 || contentIndex >= blogList.length) {
    return { success: false, message: "Content not found" };
  }

  const { blogID } = blogList[contentIndex];
  const now = Date.now();

  const transactItems = [
    {
      Update: {
        TableName: TABLE,
        Key: { pKey: `GOAL#${goalID}`, sKey: "GOALS" },
        UpdateExpression: `SET updatedAt = :u REMOVE blogList[${contentIndex}]`,
        ExpressionAttributeValues: { ":u": now },
        ConditionExpression: "attribute_exists(pKey)",
      },
    },
    {
      Delete: {
        TableName: TABLE,
        Key: { pKey: `BLOG#${blogID}`, sKey: `BLOGS@${goalID}` },
        ConditionExpression: "attribute_exists(pKey)",
      },
    },
  ];

  try {
    await dynamoDB.transactWrite({ TransactItems: transactItems }).promise();
    return { success: true, message: "Content deleted successfully" };
  } catch (err) {
    console.error("Error deleting goal content:", err);
    throw new Error("Internal server error");
  }
}

/**
 * Update a blog's title/description and reflect the title change in the goal's blogList.
 */
export async function updateGoalContent({ goalID, contentIndex, content }) {
  if (
    !goalID ||
    contentIndex === undefined ||
    !content?.title ||
    !content?.description
  ) {
    return { success: false, message: "Missing required fields" };
  }

  const { success, data: blogList } = await getGoalContent({ goalID });
  if (!success) {
    return { success: false, message: "Goal not found" };
  }
  console.log(blogList);

  if (contentIndex < 0 || contentIndex >= blogList.length) {
    return { success: false, message: "Content not found" };
  }

  const { blogID } = blogList[contentIndex];
  const now = Date.now();

  const updateBlogParams = {
    TableName: TABLE,
    Key: { pKey: `BLOG#${blogID}`, sKey: `BLOGS@${goalID}` },
    UpdateExpression: "SET #t = :t, #d = :d, updatedAt = :u",
    ExpressionAttributeNames: { "#t": "title", "#d": "description" },
    ExpressionAttributeValues: {
      ":t": content.title,
      ":d": content.description,
      ":u": now,
    },
    ConditionExpression: "attribute_exists(pKey)",
  };

  const updateGoalParams = {
    TableName: TABLE,
    Key: { pKey: `GOAL#${goalID}`, sKey: "GOALS" },
    UpdateExpression: `SET blogList[${contentIndex}].title = :t, updatedAt = :u`,
    ExpressionAttributeValues: {
      ":t": content.title,
      ":u": now,
    },
    ConditionExpression: "attribute_exists(pKey)",
  };

  try {
    await dynamoDB
      .transactWrite({
        TransactItems: [
          { Update: updateBlogParams },
          { Update: updateGoalParams },
        ],
      })
      .promise();

    return { success: true, message: "Content updated successfully" };
  } catch (err) {
    console.error("Error updating goal content:", err);
    throw new Error("Internal server error");
  }
}

/**
 * Retrieve all blog details for a given goal, preserving order.
 */
export async function getGoalContent({ goalID }) {
  if (!goalID) {
    return { success: false, message: "Missing required fields" };
  }

  const goalParams = {
    TableName: TABLE,
    Key: { pKey: `GOAL#${goalID}`, sKey: "GOALS" },
  };

  try {
    const goalResp = await dynamoDB.get(goalParams).promise();
    const refs = goalResp.Item?.blogList || [];
    if (!refs.length) {
      return { success: true, data: [] };
    }

    const keys = refs.map(({ blogID }) => ({
      pKey: `BLOG#${blogID}`,
      sKey: `BLOGS@${goalID}`,
    }));

    const batchResp = await dynamoDB
      .batchGet({ RequestItems: { [TABLE]: { Keys: keys } } })
      .promise();

    const items = batchResp.Responses?.[TABLE] || [];
    const byId = items.reduce((acc, it) => {
      acc[it.blogID] = it;
      return acc;
    }, {});

    const data = refs.map(({ blogID, title }) => {
      const it = byId[blogID];
      return it
        ? {
            blogID,
            title: it.title,
            description: it.description,
            createdAt: it.createdAt,
            updatedAt: it.updatedAt,
          }
        : { blogID, title, missing: true };
    });

    return { success: true, data };
  } catch (err) {
    console.error("Error fetching goal content:", err);
    throw new Error(err.message);
  }
}
