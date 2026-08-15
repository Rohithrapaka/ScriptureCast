/**
 * users.ts — User Management REST API (Phase A2)
 *
 * All endpoints require a valid JWT (Bearer token).
 * Role guards ensure only elevated roles can manage users.
 *
 * Endpoint summary:
 *   GET    /api/users          — list all users (admin+)
 *   POST   /api/users          — create user (super_admin, admin)
 *   GET    /api/users/:id      — get user by ID (admin+, or self)
 *   PUT    /api/users/:id      — update user (super_admin for role changes; any user for own password)
 *   DELETE /api/users/:id      — delete user (super_admin only)
 */

import { Router, type Request, type Response } from "express";
import {
  authenticateToken,
  requireRole,
} from "../middlewares/auth.middleware";
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../services/userService";
import type { UserRole } from "@workspace/db";

const router = Router();

// ── Helper: uniform error response ───────────────────────────────────────────

function sendError(res: Response, err: unknown): void {
  if (err instanceof Error) {
    const status = (err as Error & { status?: number }).status ?? 500;
    res.status(status).json({ error: err.message });
  } else {
    res.status(500).json({ error: "An unexpected error occurred" });
  }
}

// ── GET /api/users ────────────────────────────────────────────────────────────
// Returns all users without password hashes.
// Accessible by: super_admin, admin
router.get(
  "/users",
  authenticateToken,
  requireRole("super_admin", "admin"),
  async (_req: Request, res: Response) => {
    try {
      const users = await listUsers();
      res.json({ users });
    } catch (err) {
      sendError(res, err);
    }
  },
);

// ── POST /api/users ───────────────────────────────────────────────────────────
// Create a new user.
// Accessible by: super_admin, admin
// Note: only super_admin can assign the super_admin role.
router.post(
  "/users",
  authenticateToken,
  requireRole("super_admin", "admin"),
  async (req: Request, res: Response) => {
    try {
      const { username, email, password, role } = req.body as {
        username?: string;
        email?: string;
        password?: string;
        role?: UserRole;
      };

      if (!username || !email || !password) {
        res.status(400).json({ error: "username, email, and password are required" });
        return;
      }

      // Admins (non-super_admin) cannot create super_admin accounts
      if (role === "super_admin" && req.user?.role !== "super_admin") {
        res.status(403).json({ error: "Only a super_admin can assign the super_admin role" });
        return;
      }

      const user = await createUser({ username, email, password, role });
      res.status(201).json({ user });
    } catch (err) {
      sendError(res, err);
    }
  },
);

// ── GET /api/users/:id ────────────────────────────────────────────────────────
// Fetch a single user.
// Accessible by: super_admin, admin — OR — the user themselves.
router.get(
  "/users/:id",
  authenticateToken,
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id = req.params.id;

      // Allow self-access; otherwise require admin or above
      const isSelf = req.user?.userId === id;
      const isAdmin =
        req.user?.role === "super_admin" || req.user?.role === "admin";

      if (!isSelf && !isAdmin) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      const user = await getUserById(id);
      res.json({ user });
    } catch (err) {
      sendError(res, err);
    }
  },
);

// ── PUT /api/users/:id ────────────────────────────────────────────────────────
// Update email, role, or password.
// Role changes require super_admin.
// Password and email changes can be done by the user themselves or by admins.
router.put(
  "/users/:id",
  authenticateToken,
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id = req.params.id;
      const { email, role, password } = req.body as {
        email?: string;
        role?: UserRole;
        password?: string;
      };

      const isSelf = req.user?.userId === id;
      const isSuperAdmin = req.user?.role === "super_admin";
      const isAdmin = req.user?.role === "admin";

      // Role changes are restricted to super_admin only
      if (role !== undefined && !isSuperAdmin) {
        res.status(403).json({ error: "Only a super_admin can change user roles" });
        return;
      }

      // Non-admins can only update their own record (and only email/password)
      if (!isSelf && !isSuperAdmin && !isAdmin) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      const user = await updateUser(id, { email, role, password });
      res.json({ user });
    } catch (err) {
      sendError(res, err);
    }
  },
);

// ── DELETE /api/users/:id ─────────────────────────────────────────────────────
// Delete a user.
// Accessible by: super_admin only.
// Cannot delete the last super_admin.
router.delete(
  "/users/:id",
  authenticateToken,
  requireRole("super_admin"),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id = req.params.id;

      // Prevent accidental self-deletion of the calling super_admin
      if (req.user?.userId === id) {
        res.status(409).json({
          error:
            "You cannot delete your own account. Transfer super_admin privileges to another user first.",
        });
        return;
      }

      await deleteUser(id);
      res.status(204).send();
    } catch (err) {
      sendError(res, err);
    }
  },
);

export default router;
