import { updateBatchCapacity } from "@/src/util/institute/batchControllers";

export async function POST(req, { params }) {
  const { batchID } = await params;
  const { capacity } = await req.json();
  try {
    const resp = await updateBatchCapacity(batchID, capacity);
    return Response.json(resp, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
