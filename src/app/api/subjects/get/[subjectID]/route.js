import getSubject from "@/src/util/subjects/getSubject";

export async function GET(req, { params }) {
  const { subjectID } = await params;

  if (!subjectID) {
    return Response.json(
      { success: false, message: "Subject ID is required" },
      { status: 400 }
    );
  }

  try {
    const result = await getSubject({ subjectID });
    if (result.success) {
      return Response.json(result);
    } else {
      return Response.json(result, { status: 404 });
    }
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
