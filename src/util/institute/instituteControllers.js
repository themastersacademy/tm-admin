import { dynamoDB } from "../awsAgent";
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
    await dynamoDB.put(params).promise();
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
  try {
    const result = await dynamoDB.scan(params).promise();
    return {
      success: true,
      message: "Institute fetched successfully",
      data: result.Items.map((institute) => {
        const { pKey, title, email, batchList } = institute;
        return {
          id: pKey.split("#")[1],
          title,
          email,
          batchList,
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
    const result = await dynamoDB.get(params).promise();
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
