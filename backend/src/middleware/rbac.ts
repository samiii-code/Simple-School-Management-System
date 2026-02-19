import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/httpErrors";

export function requireRole(roles: Array<"Admin" | "Teacher" | "Student">) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(new HttpError(401, "Not authenticated"));
    if (!roles.includes(req.auth.role)) return next(new HttpError(403, "Forbidden"));
    next();
  };
}

export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(new HttpError(401, "Not authenticated"));
    if (req.auth.role === "Admin") return next(); // Admin shortcut
    if (!req.auth.permissions.includes(permission as never)) return next(new HttpError(403, "Forbidden"));
    next();
  };
}

