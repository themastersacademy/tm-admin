import { refundTransaction } from "@/src/util/transactions/transactionController";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { paymentId, amount } = await request.json();

    if (!paymentId || !amount || typeof amount !== "number") {
      return NextResponse.json(
        { success: false, message: "Missing or invalid parameters" },
        { status: 400 }
      );
    }

    const result = await refundTransaction(paymentId, amount);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("🔴 Refund API error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
