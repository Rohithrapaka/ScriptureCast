/**
 * setup.ts — First-Time Setup API (Phase A5)
 *
 * Endpoints:
 *   GET  /api/setup/status — Check if setup is required
 *   POST /api/setup        — Create initial super_admin user
 */

import { Router, type Request, type Response } from "express";
import { countUsers, createUser, getUserByUsername, getUserByEmail, type SafeUser } from "../services/userService";
import { generateToken, JWT_EXPIRES_IN, type JWTPayload } from "../lib/auth";

const router = Router();

const COOKIE_NAME = "token";

function parseCookieMaxAge(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

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

function cookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict" as const,
    maxAge: parseCookieMaxAge(JWT_EXPIRES_IN),
    path: "/",
  };
}

/**
 * GET /api/setup/status
 * Returns { isSetupRequired: true } when no users exist.
 */
router.get("/setup/status", async (_req: Request, res: Response) => {
  try {
    const totalUsers = await countUsers();
    res.status(200).json({ isSetupRequired: totalUsers === 0 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status((err as Error & { status?: number }).status ?? 500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Failed to check setup status" });
    }
  }
});

/**
 * POST /api/setup
 * Create initial super_admin account.
 */
router.post("/setup", async (req: Request, res: Response) => {
  try {
    const totalUsers = await countUsers();
    if (totalUsers > 0) {
      res.status(403).json({ error: "Setup has already been completed" });
      return;
    }

    const { churchName, adminName, username, email, password, confirmPassword } = req.body as {
      churchName?: string;
      adminName?: string;
      username?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    };

    if (!churchName || !username || !email || !password || !confirmPassword) {
      res.status(400).json({ error: "All required fields must be provided" });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ error: "Passwords do not match" });
      return;
    }

    // Check existing
    const existingUser = await getUserByUsername(username.trim());
    if (existingUser) {
      res.status(409).json({ error: "Username is already taken" });
      return;
    }

    const existingEmail = await getUserByEmail(email.trim().toLowerCase());
    if (existingEmail) {
      res.status(409).json({ error: "Email is already registered" });
      return;
    }

    // Create super_admin
    const user: SafeUser = await createUser({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: "super_admin",
    });

    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = generateToken(payload);

    res.cookie(COOKIE_NAME, token, cookieOptions());

    res.status(200).json({
      user,
      token,
      expiresIn: JWT_EXPIRES_IN,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status((err as Error & { status?: number }).status ?? 500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred during setup" });
    }
  }
});

export default router;
