import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserModel } from "../models/User";
import { RoleModel, type PermissionKey, type RoleName } from "../models/Role";
import { HttpError } from "../utils/httpErrors";

export type AuthUser = {
  id: string;
  role: RoleName;
  permissions: PermissionKey[];
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthUser;
    }
  }
}

type JwtPayload = { sub: string };

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) return next(new HttpError(401, "Missing Authorization header"));

  const token = header.slice("Bearer ".length);
  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    return next(new HttpError(401, "Invalid token"));
  }

  const user = await UserModel.findById(payload.sub).lean();
  if (!user) return next(new HttpError(401, "User not found"));

  const role = await RoleModel.findById(user.roleId).lean();
  if (!role) return next(new HttpError(401, "Role not found"));

  req.auth = {
    id: String(user._id),
    role: role.name as RoleName,
    permissions: (role.permissions ?? []) as PermissionKey[],
  };

  next();
}

