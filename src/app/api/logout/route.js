import { deleteSession } from "@/src/lib/session";

export async function GET(request) {
  await deleteSession();
  return Response.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login`);
}
