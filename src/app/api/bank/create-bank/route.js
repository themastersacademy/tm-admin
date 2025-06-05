import createBank from "@/src/util/bank/createBank";

export async function POST(request) {
  const { title } = await request.json();
  if (!title) {
    return Response.json(
      { success: false, message: "Title is required" },
      { status: 400 }
    );
  }
  try {
    const result = await createBank({ title });
    return Response.json(result, { status: 201 });
  } catch (err) {
    console.log(err);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
