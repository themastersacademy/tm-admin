import deleteSubject from "@/src/util/subjects/deleteSubject";

export async function GET(request, { params }) {
  const { subjectID } = await params;
  if (!subjectID) {
    return Response.json(
      { success: false, message: "Subject ID is required" },
      { status: 400 }
    );
  }
  try {
    const response = await deleteSubject(subjectID);
    return Response.json(response);
  } catch (error) {
    console.error("Error deleting subject:", error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
