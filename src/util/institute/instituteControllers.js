import { dynamoDB } from "../awsAgent.js";
import {
  PutCommand,
  ScanCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const MASTER_TABLE = `${process.env.AWS_DB_NAME}master`;
const MASTER_TABLE_INDEX = "masterTableIndex";

export async function createInstitute({ title, email }) {
  const params = {
    TableName: MASTER_TABLE,
    Item: {
      pKey: `INSTITUTE#${randomUUID()}`,
      sKey: "INSTITUTES",
      "GSI1-pKey": "INSTITUTES",
      "GSI1-sKey": "INSTITUTES",
      title,
      email,
      batchList: [],
      status: "ACTIVE",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  };
  try {
    await dynamoDB.send(new PutCommand(params));
    return { success: true, message: "Institute created successfully" };
  } catch (error) {
    throw new Error(error);
  }
}

export async function getAllInstitutes() {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    IndexName: "masterTableIndex",
    KeyConditionExpression: "#gsi1pk = :pKey",
    ExpressionAttributeNames: {
      "#gsi1pk": "GSI1-pKey",
    },
    ExpressionAttributeValues: {
      ":pKey": "INSTITUTES",
    },
  };

  const batchParams = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    IndexName: "masterTableIndex",
    KeyConditionExpression: "#gsi1pk = :pKey",
    ExpressionAttributeNames: {
      "#gsi1pk": "GSI1-pKey",
    },
    ExpressionAttributeValues: {
      ":pKey": "BATCHES",
    },
    ProjectionExpression: "instituteID",
  };

  try {
    const [instituteResult, batchResult] = await Promise.all([
      dynamoDB.send(new QueryCommand(params)),
      dynamoDB.send(new QueryCommand(batchParams)),
    ]);

    const batches = batchResult.Items || [];
    const batchCounts = batches.reduce((acc, batch) => {
      const id = batch.instituteID;
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      message: "Institute fetched successfully",
      data: instituteResult.Items.map((institute) => {
        const { pKey, title, email, batchList, status, createdAt } = institute;
        const id = pKey.split("#")[1];
        return {
          id,
          title,
          email,
          batchList,
          batchCount: batchCounts[id] || 0,
          status,
          createdAt,
        };
      }),
    };
  } catch (error) {
    throw new Error(error);
  }
}

export async function getInstitute({ instituteID }) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: { pKey: `INSTITUTE#${instituteID}`, sKey: "INSTITUTES" },
  };
  try {
    const result = await dynamoDB.send(new GetCommand(params));
    if (!result.Item) {
      return {
        success: false,
        message: "Institute not found",
      };
    }
    return {
      success: true,
      message: "Institute fetched successfully",
      data: {
        ...result.Item,
        id: result.Item.pKey.split("#")[1],
        pKey: undefined,
        sKey: undefined,
      },
    };
  } catch (error) {
    throw new Error(error);
  }
}

export async function updateInstitute({ instituteID, title }) {
  const now = Date.now();
  try {
    // 1. Update Institute
    const updateParams = {
      TableName: MASTER_TABLE,
      Key: {
        pKey: `INSTITUTE#${instituteID}`,
        sKey: "INSTITUTES",
      },
      UpdateExpression: "SET title = :title, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":title": title,
        ":updatedAt": now,
      },
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDB.send(new UpdateCommand(updateParams));

    // 2. Fetch all batches for this institute
    const batchParams = {
      TableName: MASTER_TABLE,
      IndexName: MASTER_TABLE_INDEX,
      KeyConditionExpression: "#gsi1pk = :pKey AND #gsi1sk = :sKey",
      ExpressionAttributeNames: {
        "#gsi1pk": "GSI1-pKey",
        "#gsi1sk": "GSI1-sKey",
      },
      ExpressionAttributeValues: {
        ":pKey": "BATCHES",
        ":sKey": `BATCH@${instituteID}`,
      },
    };

    const batchResult = await dynamoDB.send(new QueryCommand(batchParams));
    const batches = batchResult.Items || [];

    // 3. Update instituteMeta in all batches
    if (batches.length > 0) {
      const updatePromises = batches.map((batch) => {
        return dynamoDB.send(
          new UpdateCommand({
            TableName: MASTER_TABLE,
            Key: {
              pKey: batch.pKey,
              sKey: batch.sKey,
            },
            UpdateExpression:
              "SET instituteMeta.title = :title, updatedAt = :updatedAt",
            ExpressionAttributeValues: {
              ":title": title,
              ":updatedAt": now,
            },
          })
        );
      });
      await Promise.all(updatePromises);
    }

    return {
      success: true,
      message: "Institute updated successfully",
      data: {
        ...result.Attributes,
        id: result.Attributes.pKey.split("#")[1],
        pKey: undefined,
        sKey: undefined,
      },
    };
  } catch (error) {
    console.error("Error updating institute:", error);
    throw new Error("Failed to update institute");
  }
}
