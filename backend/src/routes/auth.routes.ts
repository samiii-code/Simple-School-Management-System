import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserModel } from "../models/User";
import { RoleModel } from "../models/Role";
import { HttpError } from "../utils/httpErrors";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return next(new HttpError(400, "Invalid payload", parsed.error.flatten()));

  const { email, password } = parsed.data;

  const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();
  if (!user) return next(new HttpError(401, "Invalid credentials"));

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return next(new HttpError(401, "Invalid credentials"));

  const role = await RoleModel.findById(user.roleId).lean();
  if (!role) return next(new HttpError(401, "Role not found"));

  const token = jwt.sign({ sub: String(user._id) }, env.JWT_SECRET, { expiresIn: "7d" });
  res.json({
    token,
    user: { id: String(user._id), name: user.name, email: user.email, role: role.name },
  });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  res.json({ user: req.auth });
});

