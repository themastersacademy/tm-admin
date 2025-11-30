import { getAllTransactions } from "@/src/util/transactions/transactionController";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    const transactions = await getAllTransactions(startDate, endDate);
    return Response.json(transactions);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
