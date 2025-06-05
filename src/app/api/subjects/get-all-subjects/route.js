import getAllSubjects from "@/src/util/subjects/getAllSubjects";

export async function GET() {
  try {
    const response = await getAllSubjects();
    return Response.json(response, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
