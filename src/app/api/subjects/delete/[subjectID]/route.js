import deleteSubject from "@/src/util/subjects/deleteSubject";

export async function GET(request, { params }) {
  const { subjectID } = await params;
  try {
    const response = await deleteSubject(subjectID);
    return Response.json(response);
  } catch (error) {
    return Response.json({
      success: false,
      message: error.message,
    });
  }
}
