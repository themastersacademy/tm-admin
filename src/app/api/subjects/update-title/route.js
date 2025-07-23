import { updateSubject } from "@/src/util/subjects/createSubject";

export async function POST(req) {
  const { subjectID, title } = await req.json();
  if (!subjectID || !title) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  console.log(subjectID, title);
  try {
    const result = await updateSubject({ subjectID, title });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}