import { setBatchLockState } from "@/src/util/institute/batchControllers";

export async function POST(req, { params }) {
  const { shouldLock } = await req.json();
  const { batchID } = await params;
  try {
    const resp = await setBatchLockState(batchID, shouldLock);
    return Response.json(resp, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
