import bcrypt from "bcrypt";
import { SignJWT, jwtVerify } from "jose";
import { TextEncoder } from "util";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export const createToken = async (payload) => {
  const jwt = new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10d")
    .sign(encodedKey);

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
  const { payload } = await jwtVerify(token, encodedKey, {
    algorithms: ["HS256"],
  });
  return payload;
};
