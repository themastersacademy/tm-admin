import { createInstitute } from "@/src/util/institute/instituteControllers";

export async function POST(req) {
  const { title, email } = await req.json();

  if (!title || !email) {
    return Response.json(
      { success: false, message: "Title and email are required" },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return Response.json(
      { success: false, message: "Invalid email" },
      { status: 400 }
    );
  }

  try {
    const result = await createInstitute({ title, email });
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
