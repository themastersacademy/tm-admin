import createSubject from "@/src/util/subjects/createSubject";

export async function POST(request) {
  const { title } = await request.json();
  if (!title) {
    return Response.json(
      { message: "Title is required", success: false },
      { status: 400 }
    );
  }
  try {
    const response = await createSubject({ title });
    return Response.json(response, { status: 201 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
