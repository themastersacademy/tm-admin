import { createToken, verifyToken } from "./jwtToken";
import { cookies } from "next/headers";

export const createSession = async (payload) => {
  const session = await createToken({ ...payload });
  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    sameSite: "lax",
    secure: true,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 10, // 10 days — matches JWT expiry set in jwtToken.js
  });
};

export const deleteSession = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("session");
};
