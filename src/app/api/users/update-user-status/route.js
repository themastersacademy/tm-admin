import { updateUserStatus } from "@/src/util/user/userController";

export async function POST(request) {
  const { id, status } = await request.json();
  if (!id || !status) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  try {
    const user = await updateUserStatus(id, status);
    return Response.json(user);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
