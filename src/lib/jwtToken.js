import bcrypt from "bcrypt";
import { SignJWT, jwtVerify } from "jose";
import { TextEncoder } from "util";

// Lazy getter so the key is resolved at call time (not at build/module-load time).
// This prevents Vercel build failures when SESSION_SECRET is not available during
// static analysis ("Collecting page data" phase).
function getEncodedKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be at least 32 characters long. " +
        "Set a strong random value in your environment variables " +
        "(e.g. run: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\").",
    );
  }
  return new TextEncoder().encode(secret);
}

export const createToken = async (payload) => {
  const jwt = new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10d")
    .sign(getEncodedKey());

  return jwt;
};

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Verifies a JWT token and returns its payload.
 * Used by session.js and any server-side code that needs to validate a session.
 */
export const verifyToken = async (token) => {
  const { payload } = await jwtVerify(token, getEncodedKey(), {
    algorithms: ["HS256"],
  });
  return payload;
};
