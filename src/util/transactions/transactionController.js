import { dynamoDB } from "../awsAgent";
import {
  ScanCommand,
  UpdateCommand,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import Razorpay from "razorpay";

const USER_TABLE = `${process.env.AWS_DB_NAME}users`;
const USER_TABLE_INDEX = "GSI1-index";

export async function getAllTransactions(startDate, endDate) {
  const params = {
    TableName: USER_TABLE,
    IndexName: USER_TABLE_INDEX,
    FilterExpression: "#gsi1sk = :gsi1sk",
    ExpressionAttributeNames: {
      "#gsi1sk": "GSI1-sKey",
    },
    ExpressionAttributeValues: {
      ":gsi1sk": "TRANSACTIONS",
    },
  };

  if (startDate && endDate) {
    params.FilterExpression +=
      " AND #createdAt BETWEEN :startDate AND :endDate";
    params.ExpressionAttributeNames["#createdAt"] = "createdAt";
    params.ExpressionAttributeValues[":startDate"] = Number(startDate);
    params.ExpressionAttributeValues[":endDate"] = Number(endDate);
  }

  try {
    const result = await dynamoDB.send(new ScanCommand(params));
    return {
      success: true,
      message: "Transactions fetched successfully",
      data: result.Items.map((item) => ({
        ...item,
        id: item.pKey.split("#")[1],
        pKey: undefined,
        sKey: undefined,
        "GSI1-sKey": undefined,
        "GSI1-pKey": undefined,
      })),
    };
  } catch (err) {
    console.error("🔴 Error fetching transactions:", err);
    throw new Error("Failed to fetch transactions");
  }
}

export async function refundTransaction(paymentId, amount, transactionId) {
  try {
    // Initialize Razorpay client
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    let transaction;

    if (transactionId) {
      // Fetch transaction by ID
      const params = {
        TableName: USER_TABLE,
        KeyConditionExpression: "pKey = :pKey",
        ExpressionAttributeValues: {
          ":pKey": `TRANSACTION#${transactionId}`,
        },
      };
      const result = await dynamoDB.send(new QueryCommand(params));
      if (!result.Items || result.Items.length === 0) {
        throw new Error("Transaction not found");
      }
      transaction = result.Items[0];
    } else {
      // Fallback to Scan if no transactionId provided (legacy support)
      const scanParams = {
        TableName: USER_TABLE,
        FilterExpression:
          "#gsi1sk = :gsi1sk AND paymentDetails.razorpayPaymentId = :paymentId",
        ExpressionAttributeNames: {
          "#gsi1sk": "GSI1-sKey",
        },
        ExpressionAttributeValues: {
          ":gsi1sk": "TRANSACTIONS",
          ":paymentId": paymentId,
        },
      };

      const scanResult = await dynamoDB.send(new ScanCommand(scanParams));
      if (!scanResult.Items || scanResult.Items.length === 0) {
        throw new Error("Transaction not found");
      }
      transaction = scanResult.Items[0];
    }

    // Check if transaction is eligible for refund
    if (transaction.status !== "completed") {
      throw new Error("Only completed transactions can be refunded");
    }

    // Validate amount
    if (transaction.amount < amount) {
      throw new Error("Refund amount exceeds transaction amount");
    }

    // Process refund through Razorpay
    const refund = await razorpay.payments.refund(paymentId, {
      amount: Math.round(amount * 100), // Convert to paise, ensure integer
      speed: "normal",
    });

    // Update transaction status in DynamoDB
    const now = new Date().toISOString();
    const updateTransactionParams = {
      TableName: USER_TABLE,
      Key: {
        pKey: transaction.pKey,
        sKey: transaction.sKey,
      },
      UpdateExpression:
        "SET #status = :status, #updatedAt = :updatedAt, paymentDetails.refundedAmount = :refundedAmount, paymentDetails.refundedAt = :refundedAt, paymentDetails.refundId = :refundId",
      ExpressionAttributeNames: {
        "#status": "status",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":status": "refunded",
        ":updatedAt": now,
        ":refundedAmount": amount,
        ":refundedAt": now,
        ":refundId": refund.id,
        ":completedStatus": "completed",
      },
      ConditionExpression: "#status = :completedStatus",
      ReturnValues: "ALL_NEW",
    };

    const updatedTransaction = await dynamoDB.send(
      new UpdateCommand(updateTransactionParams)
    );

    // Update course enrollment status to inactive and set expiresAt to null
    if (
      transaction.document &&
      transaction.document.type === "COURSE_ENROLLMENT"
    ) {
      const updateCourseEnrollParams = {
        TableName: USER_TABLE,
        Key: {
          pKey: transaction.document.pKey,
          sKey: transaction.document.sKey,
        },
        UpdateExpression:
          "SET #status = :status, expiresAt = :expiresAt, #updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#status": "status",
          "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: {
          ":status": "inactive",
          ":expiresAt": null,
          ":updatedAt": now,
        },
        ReturnValues: "ALL_NEW",
      };

      await dynamoDB.send(new UpdateCommand(updateCourseEnrollParams));
    }

    return {
      success: true,
      message: "Refund processed successfully",
      data: {
        refundId: refund.id,
        transaction: {
          ...updatedTransaction.Attributes,
          id: updatedTransaction.Attributes.pKey.split("#")[1],
          pKey: undefined,
          sKey: undefined,
          "GSI1-sKey": undefined,
          "GSI1-pKey": undefined,
        },
      },
    };
  } catch (err) {
    console.error("🔴 Error processing refund:", err);
    throw new Error(`Failed to process refund: ${err.message}`);
  }
}

export async function verifyTransaction(transactionId) {
  try {
    // Initialize Razorpay client
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Fetch transaction from DynamoDB using Query (since sKey is unknown/dynamic)
    const params = {
      TableName: USER_TABLE,
      KeyConditionExpression: "pKey = :pKey",
      ExpressionAttributeValues: {
        ":pKey": `TRANSACTION#${transactionId}`,
      },
    };

    const result = await dynamoDB.send(new QueryCommand(params));
    if (!result.Items || result.Items.length === 0) {
      throw new Error("Transaction not found");
    }

    const transaction = result.Items[0];

    if (transaction.status === "completed") {
      return {
        success: true,
        message: "Transaction is already completed",
        data: {
          ...transaction,
          id: transaction.pKey.split("#")[1],
        },
      };
    }

    const orderId = transaction.order.id;
    if (!orderId) {
      throw new Error("Order ID not found in transaction");
    }

    // Fetch payments for the order from Razorpay
    const payments = await razorpay.orders.fetchPayments(orderId);
    const now = new Date().toISOString();

    if (!payments || payments.count === 0) {
      // If no payments found, mark as failed
      const updateParams = {
        TableName: USER_TABLE,
        Key: {
          pKey: transaction.pKey,
          sKey: transaction.sKey,
        },
        UpdateExpression: "SET #status = :status, #updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#status": "status",
          "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: {
          ":status": "failed",
          ":updatedAt": now,
        },
        ReturnValues: "ALL_NEW",
      };

      const updatedTransaction = await dynamoDB.send(
        new UpdateCommand(updateParams)
      );

      return {
        success: true,
        message: "No payments found for this order. Status updated to failed.",
        data: {
          ...updatedTransaction.Attributes,
          id: updatedTransaction.Attributes.pKey.split("#")[1],
          pKey: undefined,
          sKey: undefined,
          "GSI1-sKey": undefined,
          "GSI1-pKey": undefined,
        },
      };
    }

    // Check for any captured payment
    const successfulPayment = payments.items.find(
      (p) => p.status === "captured"
    );

    if (successfulPayment) {
      // Update transaction status to completed
      const updateParams = {
        TableName: USER_TABLE,
        Key: {
          pKey: transaction.pKey,
          sKey: transaction.sKey,
        },
        UpdateExpression:
          "SET #status = :status, #updatedAt = :updatedAt, paymentDetails = :paymentDetails",
        ExpressionAttributeNames: {
          "#status": "status",
          "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: {
          ":status": "completed",
          ":updatedAt": now,
          ":paymentDetails": {
            ...transaction.paymentDetails,
            razorpayPaymentId: successfulPayment.id,
            method: successfulPayment.method,
            bank: successfulPayment.bank,
            wallet: successfulPayment.wallet,
            vpa: successfulPayment.vpa,
          },
        },
        ReturnValues: "ALL_NEW",
      };

      const updatedTransaction = await dynamoDB.send(
        new UpdateCommand(updateParams)
      );

      // Also update the course enrollment if applicable
      if (
        transaction.document &&
        transaction.document.type === "COURSE_ENROLLMENT"
      ) {
        const updateCourseEnrollParams = {
          TableName: USER_TABLE,
          Key: {
            pKey: transaction.document.pKey,
            sKey: transaction.document.sKey,
          },
          UpdateExpression:
            "SET #status = :status, #updatedAt = :updatedAt, transactionID = :transactionID",
          ExpressionAttributeNames: {
            "#status": "status",
            "#updatedAt": "updatedAt",
          },
          ExpressionAttributeValues: {
            ":status": "active",
            ":updatedAt": now,
            ":transactionID": transactionId,
          },
        };
        await dynamoDB.send(new UpdateCommand(updateCourseEnrollParams));
      }

      return {
        success: true,
        message: "Transaction verified and updated to completed",
        data: {
          ...updatedTransaction.Attributes,
          id: updatedTransaction.Attributes.pKey.split("#")[1],
          pKey: undefined,
          sKey: undefined,
          "GSI1-sKey": undefined,
          "GSI1-pKey": undefined,
        },
      };
    } else {
      // If no successful payment found, mark as failed
      const updateParams = {
        TableName: USER_TABLE,
        Key: {
          pKey: transaction.pKey,
          sKey: transaction.sKey,
        },
        UpdateExpression: "SET #status = :status, #updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#status": "status",
          "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: {
          ":status": "failed",
          ":updatedAt": now,
        },
        ReturnValues: "ALL_NEW",
      };

      const updatedTransaction = await dynamoDB.send(
        new UpdateCommand(updateParams)
      );

      return {
        success: true,
        message: "Transaction verification failed. Status updated to failed.",
        data: {
          ...updatedTransaction.Attributes,
          id: updatedTransaction.Attributes.pKey.split("#")[1],
          pKey: undefined,
          sKey: undefined,
          "GSI1-sKey": undefined,
          "GSI1-pKey": undefined,
        },
      };
    }
  } catch (err) {
    console.error("🔴 Error verifying transaction:", err);
    throw new Error(`Failed to verify transaction: ${err.message}`);
  }
}
