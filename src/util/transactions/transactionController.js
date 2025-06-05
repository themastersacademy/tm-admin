import { dynamoDB } from "../awsAgent";
import Razorpay from "razorpay";

const USER_TABLE = `${process.env.AWS_DB_NAME}users`;
const USER_TABLE_INDEX = "GSI1-index";

export async function getAllTransactions() {
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

  try {
    const result = await dynamoDB.scan(params).promise();
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

export async function refundTransaction(paymentId, amount) {
  try {
    // Initialize Razorpay client
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Find transaction by paymentDetails.razorpayPaymentId using Scan
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

    const scanResult = await dynamoDB.scan(scanParams).promise();
    if (!scanResult.Items || scanResult.Items.length === 0) {
      throw new Error("Transaction not found");
    }

    const transaction = scanResult.Items[0];

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

    const updatedTransaction = await dynamoDB
      .update(updateTransactionParams)
      .promise();

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

      await dynamoDB.update(updateCourseEnrollParams).promise();
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
