import {
  getUserByID,
  updateUser,
  deleteUser,
} from "@/src/util/user/userController";

export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const user = await getUserByID(id);
    return Response.json(user);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { id } = await params;
  const { name, phone, gender, address, school, grade, targetExam } =
    await request.json();

  if (!id || !name || !phone || !gender || !address) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const studentMeta = {
    school,
    grade,
    targetExam,
  };

  try {
    const user = await updateUser({
      id,
      name,
      phone,
      gender,
      address,
      studentMeta,
    });
    return Response.json(user);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  try {
    const result = await deleteUser(id);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
