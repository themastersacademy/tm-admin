import { createBatch } from "@/src/util/institute/batchControllers";

export async function POST(req, { params }) {
  const { instituteID } = await params;
  const { title, tags } = await req.json();

  if (!instituteID || !title) {
    return Response.json(
      { success: false, message: "Institute ID and title are required" },
      { status: 400 }
    );
  }

  try {
    const result = await createBatch({ instituteID, title, tags });
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
