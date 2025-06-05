import { getAllTransactions } from "@/src/util/transactions/transactionController";

export async function GET(request) {
  try {
    const transactions = await getAllTransactions();
    return Response.json(transactions);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
