import { dynamoDB } from "../awsAgent.js";
import {
  PutCommand,
  ScanCommand,
  GetCommand,
  QueryCommand,
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
    FilterExpression: "sKey = :sKey",
    ExpressionAttributeValues: {
      ":sKey": "INSTITUTES",
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
      dynamoDB.send(new ScanCommand(params)),
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
