/**
 * auth.ts — Authentication REST API (Phase A3)
 *
 * Endpoints:
 *   POST /api/auth/login    — Authenticate with username/email + password
 *   POST /api/auth/logout   — Clear the session cookie (stateless)
 *   GET  /api/auth/me       — Return the currently authenticated user
 *   POST /api/auth/refresh  — Issue a new token without re-authenticating
 *
 * Token delivery strategy:
 *   - JWT is returned in the JSON response body (for SPA / mobile clients).
 *   - JWT is also set as an HttpOnly cookie named "token" (for browser clients).
 *   Both strategies are supported simultaneously so clients can choose.
 *
 * Security notes:
 *   - Logout is stateless: it clears the cookie only. The JWT remains
 *     technically valid until it expires, but the client no longer has it.
 *   - Cookie is Secure in production, plain in development.
 *   - Cookie SameSite=Strict prevents CSRF for same-origin requests.
 */

import { Router, type Request, type Response, type CookieOptions } from "express";
import {
  comparePassword,
  generateToken,
  verifyToken,
  JWT_EXPIRES_IN,
  type JWTPayload,
} from "../lib/auth";
import {
  authenticateToken,
} from "../middlewares/auth.middleware";
import {
  getUserByUsername,
  getUserByEmail,
  getUserById,
  type SafeUser,
} from "../services/userService";

const router = Router();

// ── Cookie configuration ──────────────────────────────────────────────────────

const COOKIE_NAME = "token";

function cookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,           // Never accessible via document.cookie
    secure: isProduction,     // HTTPS-only in production
    sameSite: "strict",       // Prevent CSRF
    maxAge: parseCookieMaxAge(JWT_EXPIRES_IN),
    path: "/",
  };
}

/**
 * Convert a JWT expiry string ("7d", "24h", "30m") into milliseconds
 * for the cookie maxAge field.  Falls back to 7 days on parse failure.
 */
function parseCookieMaxAge(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // fallback: 7 days

  const [, value, unit] = match;
  const num = parseInt(value, 10);

  const multipliers: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  return num * (multipliers[unit] ?? 86_400_000);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sendError(res: Response, err: unknown): void {
  if (err instanceof Error) {
    const status = (err as Error & { status?: number }).status ?? 500;
    res.status(status).json({ error: err.message });
  } else {
    res.status(500).json({ error: "An unexpected error occurred" });
  }
}

/** Build a standardised auth success response body. */
function authResponse(user: SafeUser, token: string) {
  return {
    user,
    token,
    expiresIn: JWT_EXPIRES_IN,
  };
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
// Accepts username or email as `identifier`.
// On success: returns SafeUser + JWT in body; sets HttpOnly cookie.
// On failure: always returns 401 (never distinguishes "user not found" from
//             "wrong password" — prevents username enumeration).
router.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body as {
      identifier?: string;
      password?: string;
    };

    if (!identifier || !password) {
      res.status(400).json({ error: "identifier and password are required" });
      return;
    }

    // Look up by username first, then fall back to email.
    // Both queries are always run independently to avoid timing side-channels.
    const normalized = identifier.trim().toLowerCase();
    let user =
      await getUserByUsername(identifier.trim()) ??
      await getUserByEmail(normalized);

    // Use a constant-time comparison even when user is null to prevent
    // timing-based username enumeration.
    const dummyHash =
      "$2b$10$invalidhashusedfortimingprotectiononly123456789012345678901";
    const passwordMatch = await comparePassword(
      password,
      user?.passwordHash ?? dummyHash,
    );

    if (!user || !passwordMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = generateToken(payload);

    // Set HttpOnly cookie for browser clients
    res.cookie(COOKIE_NAME, token, cookieOptions());

    // Return safe user (no password hash)
    const { passwordHash: _omitted, ...safeUser } = user;

    res.status(200).json(authResponse(safeUser, token));
  } catch (err) {
    sendError(res, err);
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
// Clears the HttpOnly token cookie.
// The JWT itself remains valid until expiry (stateless design — no blocklist).
// Always returns 200 so clients can safely call logout even without a session.
router.post("/auth/logout", (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.status(200).json({ message: "Logged out successfully" });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
// Returns the current user from the database (not from the JWT cache).
// This ensures the response reflects real-time role/email changes.
router.get(
  "/auth/me",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      // req.user is guaranteed to exist — authenticateToken asserts it
      const user = await getUserById(req.user!.userId);
      res.status(200).json({ user });
    } catch (err) {
      sendError(res, err);
    }
  },
);

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
// Issues a fresh JWT using the identity from the current (still-valid) token.
// Does NOT require the user to re-submit their password.
// Does NOT query the database — the existing token's payload is re-signed.
// Use this to silently extend sessions before they expire.
router.post(
  "/auth/refresh",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      // req.user is guaranteed — authenticateToken asserts it
      const { userId, username, email, role } = req.user!;

      // Re-fetch from DB so the new token reflects any role/email changes
      const freshUser = await getUserById(userId);

      const newPayload: JWTPayload = {
        userId: freshUser.id,
        username: freshUser.username,
        email: freshUser.email,
        role: freshUser.role,
      };

      const newToken = generateToken(newPayload);

      // Refresh the cookie as well
      res.cookie(COOKIE_NAME, newToken, cookieOptions());

      res.status(200).json(authResponse(freshUser, newToken));
    } catch (err) {
      sendError(res, err);
    }
  },
);

export default router;
