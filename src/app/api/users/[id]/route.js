import { getUserByID, updateUser } from "@/src/util/user/userController";

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
  const { name, phone, gender, address } = await request.json();
  if (!email || !id || !name || !phone || !gender || !address) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  try {
    const user = await updateUser({ id, name, phone, gender, address });
    return Response.json(user);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
