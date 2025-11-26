import { dynamoDB } from "@/src/util/awsAgent";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { comparePassword } from "@/src/lib/jwtToken";
import { createSession } from "@/src/lib/session";

export async function POST(request) {
  const { email, password } = await request.json();

  const params = {
    TableName: `TMA-DEV-admin`,
    FilterExpression: "email = :email",
    ExpressionAttributeValues: { ":email": email },
  };

  try {
    const user = await dynamoDB.send(new ScanCommand(params));
    if (user.Items.length == 0) {
      return Response.json({
        status: 401,
        success: false,
        message: "Email or password incorrect",
      });
    }
    const { id, password: hash } = user.Items[0];
    const isPasswordCorrect = await comparePassword(password, hash);

    if (!isPasswordCorrect) {
      return Response.json({
        status: 401,
        success: false,
        message: "Email or password incorrect",
      });
    }
    await createSession({
      userID: id,
      email,
    });
    return Response.json({
      success: true,
      status: 200,
      message: "Welcome",
    });
  } catch (error) {
    console.log(error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
