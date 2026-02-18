import { dynamoDB } from "@/src/util/awsAgent";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { comparePassword } from "@/src/lib/jwtToken";
import { createSession } from "@/src/lib/session";
import Joi from "joi";
import { rateLimit } from "@/src/lib/rateLimit";

const limiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
});

export async function POST(request) {
  try {
    // 1. Rate Limiting
    // In a real app, use request.ip or a header. Here we'll use a placeholder or extract if possible.
    // Next.js App Router doesn't give easy access to IP in all environments without headers()
    // For now, we'll try to use a header or fallback to a global limit if IP is missing (not ideal but better than nothing)
    // const ip = request.headers.get("x-forwarded-for") || "global";
    // actually, let's use the email as the key for rate limiting to prevent brute force on a specific account

    const body = await request.json();
    const { email, password } = body;

    // Validate Input
    const { error } = loginSchema.validate({ email, password });
    if (error) {
      return Response.json({
        success: false,
        status: 400,
        message: error.details[0].message,
      });
    }

    // Check Rate Limit (5 attempts per 15 mins per email)
    const isAllowed = limiter.check(5, email);
    if (!isAllowed) {
      return Response.json(
        {
          success: false,
          message: "Too many login attempts. Please try again in 15 minutes.",
        },
        { status: 429 },
      );
    }

    // NOTE: ScanCommand is O(n) — it reads the entire TMA-DEV-admin table to find the user.
    // At small admin table sizes this is acceptable, but the correct fix is to add a GSI
    // on the `email` attribute so this becomes an O(1) Query instead of a full Scan.
    const params = {
      TableName: `TMA-DEV-admin`,
      FilterExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
    };

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
    console.error("Login error:", error.name);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
