// import { createHash } from "crypto";
import getAllBank from "@/src/util/bank/getAllBank";

export async function GET() {
  try {
    const result = await getAllBank();
    if (!result.success) {
      return Response.json(result, { status: 500 });
    }
    return Response.json(result, { status: 200 });
  } catch (err) {
    console.log(err);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// export  async function GET() {
//   const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;
//   // Concatenate the values
//   const stringToHash =
//     "376973" +
//     "d315b371-b77c-4c13-b56bbff99367-f23f-4a04" +
//     expirationTime +
//     "d174b55a-71af-4edb-8385-751f606145a8";

//   // Hash the concatenated string using SHA-256
//   const hash = createHash("sha256").update(stringToHash).digest("hex");
//   return Response.json({ hash, expirationTime });
// }
