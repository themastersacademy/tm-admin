import bcrypt from "bcrypt";
import { SignJWT, jwtVerify } from "jose";

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
