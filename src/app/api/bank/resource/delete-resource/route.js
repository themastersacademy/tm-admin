import { deleteResource } from "@/src/util/bank/deleteResource";

export async function POST(request) {
  const { resourceID, bankID } = await request.json();
  if (!resourceID || !bankID) {
    return Response.json(
      {
        success: false,
        message: "resourceID and bankID are required",
      },
      { status: 400 }
    );
  }
  try {
    const result = await deleteResource({ resourceID, bankID });
    return Response.json(result, { status: 201 });
  } catch (err) {
    console.log(err);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
