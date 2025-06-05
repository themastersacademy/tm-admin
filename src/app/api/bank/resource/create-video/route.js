import { createVideo } from "@/src/util/bank/uploadVideo";

export async function POST(request) {
  const { title, bankID } = await request.json();
  if (!title || !bankID) {
    return Response.json(
      { success: false, message: "Title and bankID are required" },
      { status: 400 }
    );
  }
  try {
    const result = await createVideo({ title, bankID });
    return Response.json(result, { status: 201 });
  } catch (err) {
    console.log(err);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
