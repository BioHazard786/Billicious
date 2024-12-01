"only server";

import jwt from "jsonwebtoken";

// Supabase JWT secret
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;

export const generateJWT = (userId: string) => {
  const payload = {
    sub: userId, // user ID goes here
    aud: "authenticated",
    role: "authenticated", // Set the role to 'authenticated' or any other role
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // Expiration time (30 days)
  };

  // Generate a JWT token
  const token = jwt.sign(payload, SUPABASE_JWT_SECRET);

  return token;
};

export async function getUserID(token: string) {
  const payload = jwt.decode(token ?? "");

  const userId = payload?.sub as string;
  return userId;
}
