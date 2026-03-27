import { deleteSession } from "@/src/lib/session";

export async function GET(request) {
  try {
    await deleteSession();
  } catch (error) {
    console.error("Error deleting session:", error);
  }
  return Response.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login`);
}
