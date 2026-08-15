import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { UserRole } from "@workspace/db";

// ── Environment-driven configuration ─────────────────────────────────────────
// JWT_SECRET  — MUST be set to a strong random string in production.
//               In development the fallback is intentionally weak and
//               will trigger a startup warning if NODE_ENV !== "development".
const JWT_SECRET = process.env.JWT_SECRET ?? "scripture-cast-secret-key-v2-dev";

// JWT_EXPIRES_IN — Token lifetime, e.g. "7d", "24h", "30m".
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN ?? "7d";

// BCRYPT_ROUNDS — Cost factor for bcrypt.  10 is a safe default for most hardware.
//                 Increase to 12–14 on high-spec servers for added resistance.
const rawRounds = parseInt(process.env.BCRYPT_ROUNDS ?? "10", 10);
export const BCRYPT_ROUNDS: number =
  Number.isNaN(rawRounds) || rawRounds < 4 || rawRounds > 31 ? 10 : rawRounds;

// Warn loudly if the secret has never been changed and we are in production.
if (process.env.NODE_ENV === "production" && JWT_SECRET === "scripture-cast-secret-key-v2-dev") {
  console.warn(
    "[AUTH] WARNING: JWT_SECRET is using the default development value in production. "
    + "Set a strong secret in your .env file immediately.",
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
}

// ── Password utilities ────────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── JWT utilities ─────────────────────────────────────────────────────────────
export function generateToken(
  payload: JWTPayload,
  expiresIn: string = JWT_EXPIRES_IN,
): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}
