import { dynamoDB } from "../awsAgent.js";
import {
  PutCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

export async function createSubscriptionPlan({
  priceWithTax,
  type,
  duration,
  discountInPercent,
}) {
  validateSubscriptionPlan(priceWithTax, type, duration, discountInPercent);
  const response = await getAllSubscriptionPlan();
  if (response.data.length > 0) {
    const existingPlan = response.data.find(
      (plan) => plan.type === type && plan.duration === duration
    );
    if (existingPlan) {
      throw new Error("Subscription plan already exists");
    }
  }

  const newItem = {
    pKey: `SUBSCRIPTION_PLAN#${randomUUID()}`,
    sKey: "SUBSCRIPTION_PLAN",
    "GSI1-pKey": `SUBSCRIPTION_PLAN`,
    "GSI1-sKey": "SUBSCRIPTION_PLAN",
    priceWithTax: Number(priceWithTax),
    type,
    duration,
    discountInPercent: Number(discountInPercent),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    IndexName: "masterTableIndex",
    Item: newItem,
    ConditionExpression: "attribute_not_exists(pKey)",
  };

  try {
    await dynamoDB.send(new PutCommand(params));
    return {
      status: true,
      message: "Subscription plan created successfully",
      data: {
        id: newItem.pKey.split("#")[1],
        priceWithTax: newItem.priceWithTax,
        type: newItem.type,
        duration: newItem.duration,
        discountInPercent: newItem.discountInPercent,
        createdAt: newItem.createdAt,
        updatedAt: newItem.updatedAt,
        pKey: undefined,
        sKey: undefined,
      }, // Returning the inserted item
    };
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    throw new Error("Internal server error");
  }
}

export async function getAllSubscriptionPlan() {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    FilterExpression: "sKey = :sKey",
    ExpressionAttributeValues: {
      ":sKey": "SUBSCRIPTION_PLAN",
    },
  };

  try {
    const response = await dynamoDB.send(new ScanCommand(params));
    return {
      status: true,
      message: "Subscription plans fetched successfully",
      data: response.Items.map((item) => ({
        ...item,
        id: item.pKey.split("#")[1], // Extracting the ID from pKey
        pKey: undefined,
        sKey: undefined,
      })),
    };
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    throw new Error("Internal server error");
  }
}

export async function getSubscriptionPlanByID(id) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: `SUBSCRIPTION_PLAN#${id}`,
      sKey: "SUBSCRIPTION_PLAN",
    },
  };

  const response = await dynamoDB.send(new GetCommand(params));
  return {
    success: true,
    message: "Subscription plan fetched successfully",
    data: response.Item,
  };
}

export async function updateSubscriptionPlan(
  id,
  { priceWithTax, type, duration, discountInPercent }
) {
  validateSubscriptionPlan(priceWithTax, type, duration, discountInPercent);

  const allPlans = await getAllSubscriptionPlan();
  if (allPlans.data.length > 0) {
    const existingPlan = allPlans.data.find(
      (plan) =>
        plan.type === type && plan.duration === duration && plan.id !== id
    );
    if (existingPlan) {
      throw new Error("Subscription plan with this duration already exists");
    }
  }

  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: `SUBSCRIPTION_PLAN#${id}`,
      sKey: "SUBSCRIPTION_PLAN",
    },
    UpdateExpression:
      "SET priceWithTax = :priceWithTax, #type = :type, #duration = :duration, #discountInPercent = :discountInPercent, updatedAt = :updatedAt",
    ExpressionAttributeNames: {
      "#type": "type",
      "#duration": "duration",
      "#discountInPercent": "discountInPercent",
    },
    ExpressionAttributeValues: {
      ":priceWithTax": priceWithTax,
      ":type": type,
      ":duration": duration,
      ":discountInPercent": discountInPercent,
      ":updatedAt": Date.now(),
    },
    ConditionExpression: "attribute_exists(priceWithTax)", // Ensure item exists before updating
    ReturnValues: "ALL_NEW",
  };

  try {
    const response = await dynamoDB.send(new UpdateCommand(params));
    return {
      status: true,
      message: "Subscription plan updated successfully",
      data: {
        id: response.Attributes.pKey.split("#")[1],
        priceWithTax: response.Attributes.priceWithTax,
        type: response.Attributes.type,
        duration: response.Attributes.duration,
        discountInPercent: response.Attributes.discountInPercent,
        createdAt: response.Attributes.createdAt,
        updatedAt: response.Attributes.updatedAt,
        pKey: undefined,
        sKey: undefined,
      }, // `update` returns `Attributes`, not `Item`
    };
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    throw new Error(error.message);
  }
}

export async function deleteSubscriptionPlan(id) {
  const params = {
    TableName: `${process.env.AWS_DB_NAME}master`,
    Key: {
      pKey: `SUBSCRIPTION_PLAN#${id}`,
      sKey: "SUBSCRIPTION_PLAN",
    },
    ConditionExpression: "attribute_exists(priceWithTax)", // Ensures the item exists before deleting
  };

  try {
    await dynamoDB.send(new DeleteCommand(params));
    return {
      status: true,
      message: "Subscription plan deleted successfully",
    };
  } catch (error) {
    if (error.message.includes("The conditional request failed")) {
      throw new Error("Subscription plan not found");
    }
    console.error("Error deleting subscription plan:", error);
    throw new Error(error.message);
  }
}

function validateSubscriptionPlan(
  priceWithTax,
  type,
  duration,
  discountInPercent
) {
  if (isNaN(duration) || isNaN(priceWithTax) || isNaN(discountInPercent)) {
    throw new Error("Invalid subscription duration, price, or discount");
  }
  if (priceWithTax <= 0 || discountInPercent >= 100) {
    throw new Error("Invalid subscription price or discount");
  }
  if (!["MONTHLY", "YEARLY"].includes(type)) {
    throw new Error("Invalid subscription type");
  }
}
