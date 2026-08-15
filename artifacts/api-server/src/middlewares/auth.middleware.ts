import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth";
import type { UserRole } from "@workspace/db";

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  const cookieToken = req.cookies?.token;
  const token = bearerToken || cookieToken || (req.query.token as string | undefined);

  if (!token) {
    res.status(401).json({ error: "Authentication token required" });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (_err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function optionalAuthenticateToken(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  const cookieToken = req.cookies?.token;
  const token = bearerToken || cookieToken || (req.query.token as string | undefined);

  if (token) {
    try {
      req.user = verifyToken(token);
    } catch (_err) {
      // Ignore token errors for optional authentication
    }
  }
  next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: `Access denied. Requires one of roles: ${allowedRoles.join(", ")}` });
      return;
    }

    next();
  };
}
