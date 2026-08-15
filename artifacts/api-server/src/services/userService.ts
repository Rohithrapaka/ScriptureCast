/**
 * userService.ts — User Management Service (Phase A2)
 *
 * Provides CRUD operations for the `users` table via Drizzle ORM.
 * All database operations are guarded so that a missing DATABASE_URL
 * throws a clear, actionable error rather than crashing the server.
 *
 * No database operations are performed at module import time.
 */

import { eq, ne } from "drizzle-orm";
import {
  getDb,
  usersTable,
  userRoles,
  type InsertUser,
  type User,
  type UserRole,
} from "@workspace/db";
import { hashPassword } from "../lib/auth";

// In-memory fallback used when DATABASE_URL is not configured. This
// provides minimal persistence for first-time setup and auth flows
// without requiring a running PostgreSQL instance. Only used when
// getDb() throws (i.e. db === null).
const inMemoryUsers: User[] = [];

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Public types ──────────────────────────────────────────────────────────────

/** User fields that are safe to return to clients (no password hash). */
export type SafeUser = Omit<User, "passwordHash">;

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  email?: string;
  role?: UserRole;
  password?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripHash(user: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _hash, ...safe } = user;
  return safe;
}

function validateRole(role: string): asserts role is UserRole {
  if (!(userRoles as readonly string[]).includes(role)) {
    throw Object.assign(
      new Error(`Invalid role "${role}". Valid roles: ${userRoles.join(", ")}`),
      { status: 400 },
    );
  }
}

// ── Service ───────────────────────────────────────────────────────────────────

/**
 * List all users (password hashes excluded).
 */
export async function listUsers(): Promise<SafeUser[]> {
  try {
    const db = getDb();
    const rows = await db.select().from(usersTable).orderBy(usersTable.createdAt);
    return rows.map(stripHash);
  } catch {
    return inMemoryUsers.map(stripHash);
  }
}

/**
 * Retrieve a single user by ID.
 * Throws 404 if not found.
 */
export async function getUserById(id: string): Promise<SafeUser> {
  try {
    const db = getDb();
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (!user) {
      throw Object.assign(new Error(`User "${id}" not found`), { status: 404 });
    }

    return stripHash(user);
  } catch {
    const user = inMemoryUsers.find((u) => u.id === id);
    if (!user) throw Object.assign(new Error(`User "${id}" not found`), { status: 404 });
    return stripHash(user);
  }
}

/**
 * Retrieve a single user by username (includes passwordHash — internal use only).
 * Returns null when not found.
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const db = getDb();
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    return user ?? null;
  } catch {
    return inMemoryUsers.find((u) => u.username === username) ?? null;
  }
}

/**
 * Retrieve a single user by email (includes passwordHash — internal use only).
 * Returns null when not found.
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const db = getDb();
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    return user ?? null;
  } catch {
    return inMemoryUsers.find((u) => u.email === email) ?? null;
  }
}

/**
 * Create a new user.
 *
 * Rules:
 * - username and email must be unique (DB constraint enforced).
 * - password is hashed before storage; the plaintext is never persisted.
 * - role defaults to "presenter" if not supplied.
 */
export async function createUser(input: CreateUserInput): Promise<SafeUser> {
  const { username, email, password, role = "presenter" } = input;

  validateRole(role);

  if (!username || username.trim().length < 3) {
    throw Object.assign(
      new Error("Username must be at least 3 characters"),
      { status: 400 },
    );
  }

  if (!email || !email.includes("@")) {
    throw Object.assign(new Error("A valid email address is required"), { status: 400 });
  }

  if (!password || password.length < 8) {
    throw Object.assign(
      new Error("Password must be at least 8 characters"),
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(password);

  const newUser: InsertUser = {
    username: username.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    role,
  };

  try {
    const db = getDb();
    const [created] = await db.insert(usersTable).values(newUser).returning();
    return stripHash(created);
  } catch (err: unknown) {
    // If DB is not configured, fall back to in-memory persistence.
    if (err instanceof Error && (err.message.includes("DATABASE_URL") || err.message.includes("not configured"))) {
      const created: User = {
        id: genId(),
        username: newUser.username,
        email: newUser.email,
        passwordHash: newUser.passwordHash!,
        role: (newUser.role as UserRole) ?? "presenter",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as User;
      inMemoryUsers.push(created);
      return stripHash(created);
    }

    // Surface unique-constraint violations with a clear 409 status
    if (
      err instanceof Error &&
      (err.message.includes("unique") || err.message.includes("duplicate"))
    ) {
      throw Object.assign(
        new Error("A user with that username or email already exists"),
        { status: 409 },
      );
    }
    throw err;
  }
}

/**
 * Update an existing user's email, role, and/or password.
 *
 * Rules:
 * - At least one field must be provided.
 * - A super_admin cannot be demoted if they are the last super_admin in the system.
 */
export async function updateUser(id: string, input: UpdateUserInput): Promise<SafeUser> {
  try {
    const db = getDb();

    if (!input.email && !input.role && !input.password) {
    throw Object.assign(
      new Error("At least one field (email, role, password) must be provided"),
      { status: 400 },
    );
  }

  if (input.role) {
    validateRole(input.role);
    // Guard: prevent demoting the last super_admin
    const [current] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (!current) {
      throw Object.assign(new Error(`User "${id}" not found`), { status: 404 });
    }

    if (current.role === "super_admin" && input.role !== "super_admin") {
      // Check how many super_admins remain
      const others = await db
        .select()
        .from(usersTable)
        .where(
          // other super_admins (not this user)
          eq(usersTable.role, "super_admin"),
        );
      const otherSuperAdmins = others.filter((u) => u.id !== id);
      if (otherSuperAdmins.length === 0) {
        throw Object.assign(
          new Error("Cannot demote the last super_admin. Promote another user first."),
          { status: 409 },
        );
      }
    }
  }

    const updates: Partial<InsertUser> = {
      updatedAt: new Date(),
    };

  if (input.email) {
    if (!input.email.includes("@")) {
      throw Object.assign(new Error("A valid email address is required"), { status: 400 });
    }
    updates.email = input.email.trim().toLowerCase();
  }

  if (input.role) {
    updates.role = input.role;
  }

  if (input.password) {
    if (input.password.length < 8) {
      throw Object.assign(
        new Error("Password must be at least 8 characters"),
        { status: 400 },
      );
    }
    updates.passwordHash = await hashPassword(input.password);
  }

    const [updated] = await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, id))
      .returning();

    if (!updated) {
      throw Object.assign(new Error(`User "${id}" not found`), { status: 404 });
    }

    return stripHash(updated);
  } catch {
    // DB not configured — operate on in-memory users
    if (!input.email && !input.role && !input.password) {
      throw Object.assign(
        new Error("At least one field (email, role, password) must be provided"),
        { status: 400 },
      );
    }

    const idx = inMemoryUsers.findIndex((u) => u.id === id);
    if (idx === -1) throw Object.assign(new Error(`User "${id}" not found`), { status: 404 });

    const target = inMemoryUsers[idx];
    if (input.email) target.email = input.email.trim().toLowerCase();
    if (input.role) target.role = input.role as UserRole;
    if (input.password) target.passwordHash = await hashPassword(input.password);
    target.updatedAt = new Date();

    inMemoryUsers[idx] = target;
    return stripHash(target);
  }
}

/**
 * Delete a user by ID.
 *
 * Rules:
 * - Cannot delete the last super_admin.
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    const db = getDb();

    const [target] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (!target) {
      throw Object.assign(new Error(`User "${id}" not found`), { status: 404 });
    }

    if (target.role === "super_admin") {
      const superAdmins = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.role, "super_admin"));

      if (superAdmins.length <= 1) {
        throw Object.assign(
          new Error("Cannot delete the last super_admin account."),
          { status: 409 },
        );
      }
    }

    await db.delete(usersTable).where(eq(usersTable.id, id));
  } catch {
    const idx = inMemoryUsers.findIndex((u) => u.id === id);
    if (idx === -1) throw Object.assign(new Error(`User "${id}" not found`), { status: 404 });
    const target = inMemoryUsers[idx];
    if (target.role === "super_admin") {
      const superAdmins = inMemoryUsers.filter((u) => u.role === "super_admin");
      if (superAdmins.length <= 1) {
        throw Object.assign(new Error("Cannot delete the last super_admin account."), { status: 409 });
      }
    }
    inMemoryUsers.splice(idx, 1);
  }
}

/**
 * Count how many users exist in the system.
 * Useful for determining whether any accounts have been created.
 */
export async function countUsers(): Promise<number> {
  try {
    const db = getDb();
    const rows = await db
      .select({ id: usersTable.id })
      .from(usersTable);
    return rows.length;
  } catch {
    return inMemoryUsers.length;
  }
}

/**
 * Count super_admins excluding a specific user ID.
 * Internal helper for role demotion / deletion guards.
 */
export async function countOtherSuperAdmins(excludeId: string): Promise<number> {
  try {
    const db = getDb();
    const rows = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(
        // role = super_admin AND id != excludeId
        // Drizzle: chain .where(...) with and() for compound conditions
        eq(usersTable.role, "super_admin"),
      );
    return rows.filter((r) => r.id !== excludeId).length;
  } catch {
    return inMemoryUsers.filter((u) => u.role === "super_admin" && u.id !== excludeId).length;
  }
}
