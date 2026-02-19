import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireAuth } from "../middleware/auth";
import { requirePermission, requireRole } from "../middleware/rbac";
import { Permission, RoleModel } from "../models/Role";
import { UserModel } from "../models/User";
import { SubjectModel } from "../models/Subject";
import { GradeModel } from "../models/Grade";
import { HttpError } from "../utils/httpErrors";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(["Admin"]));

// Users (teachers/students)
adminRouter.get("/users", async (req, res) => {
  const role = String(req.query.role || "");
  const roleDoc = role ? await RoleModel.findOne({ name: role }).lean() : null;
  const filter = roleDoc ? { roleId: roleDoc._id } : {};
  const users = await UserModel.find(filter).select("-passwordHash").lean();
  res.json({ users });
});

adminRouter.post("/users", requirePermission(Permission.UsersManage), async (req, res, next) => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["Teacher", "Student"]),
    section: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return next(new HttpError(400, "Invalid payload", parsed.error.flatten()));

  const roleDoc = await RoleModel.findOne({ name: parsed.data.role });
  if (!roleDoc) return next(new HttpError(400, "Role not found"));

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await UserModel.create({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    passwordHash,
    roleId: roleDoc._id,
    ...(parsed.data.role === "Student" && parsed.data.section != null ? { section: parsed.data.section } : {}),
  });

  res.status(201).json({ user: { id: String(user._id) } });
});

adminRouter.patch("/users/:id", requirePermission(Permission.UsersManage), async (req, res, next) => {
  const schema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    section: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return next(new HttpError(400, "Invalid payload", parsed.error.flatten()));

  const update: Record<string, unknown> = {};
  if (parsed.data.name != null) update.name = parsed.data.name;
  if (parsed.data.email != null) update.email = parsed.data.email.toLowerCase();
  if (parsed.data.password != null) update.passwordHash = await bcrypt.hash(parsed.data.password, 10);
  if (parsed.data.section !== undefined) update.section = parsed.data.section;

  const user = await UserModel.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
  if (!user) return next(new HttpError(404, "User not found"));
  res.json({ user: { id: String(user._id) } });
});

adminRouter.delete("/users/:id", requirePermission(Permission.UsersManage), async (req, res, next) => {
  const user = await UserModel.findByIdAndDelete(req.params.id).lean();
  if (!user) return next(new HttpError(404, "User not found"));
  res.status(204).send();
});

// Subjects CRUD
adminRouter.get("/subjects", async (_req, res) => {
  const subjects = await SubjectModel.find().lean();
  res.json({ subjects });
});

adminRouter.post("/subjects", requirePermission(Permission.SubjectsManage), async (req, res, next) => {
  const schema = z.object({ name: z.string().min(2), description: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return next(new HttpError(400, "Invalid payload", parsed.error.flatten()));
  const subject = await SubjectModel.create({ name: parsed.data.name, description: parsed.data.description ?? "" });
  res.status(201).json({ subject });
});

adminRouter.patch("/subjects/:id", requirePermission(Permission.SubjectsManage), async (req, res, next) => {
  const schema = z.object({ name: z.string().min(2).optional(), description: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return next(new HttpError(400, "Invalid payload", parsed.error.flatten()));
  const subject = await SubjectModel.findByIdAndUpdate(req.params.id, parsed.data, { new: true }).lean();
  if (!subject) return next(new HttpError(404, "Subject not found"));
  res.json({ subject });
});

adminRouter.delete("/subjects/:id", requirePermission(Permission.SubjectsManage), async (req, res, next) => {
  const subject = await SubjectModel.findByIdAndDelete(req.params.id).lean();
  if (!subject) return next(new HttpError(404, "Subject not found"));
  res.status(204).send();
});

// Grades CRUD + assignments
adminRouter.get("/grades", async (_req, res) => {
  const grades = await GradeModel.find().lean();
  res.json({ grades });
});

adminRouter.post("/grades", requirePermission(Permission.GradesManage), async (req, res, next) => {
  const schema = z.object({ name: z.string().min(2), description: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return next(new HttpError(400, "Invalid payload", parsed.error.flatten()));
  const grade = await GradeModel.create({ name: parsed.data.name, description: parsed.data.description ?? "" });
  res.status(201).json({ grade });
});

adminRouter.patch("/grades/:id", requirePermission(Permission.GradesManage), async (req, res, next) => {
  const schema = z.object({ name: z.string().min(2).optional(), description: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return next(new HttpError(400, "Invalid payload", parsed.error.flatten()));
  const grade = await GradeModel.findByIdAndUpdate(req.params.id, parsed.data, { new: true }).lean();
  if (!grade) return next(new HttpError(404, "Grade not found"));
  res.json({ grade });
});

adminRouter.delete("/grades/:id", requirePermission(Permission.GradesManage), async (req, res, next) => {
  const grade = await GradeModel.findByIdAndDelete(req.params.id).lean();
  if (!grade) return next(new HttpError(404, "Grade not found"));
  res.status(204).send();
});

adminRouter.put("/grades/:id/assign", requirePermission(Permission.GradesManage), async (req, res, next) => {
  const schema = z.object({
    teacherIds: z.array(z.string()).optional(),
    studentIds: z.array(z.string()).optional(),
    subjectIds: z.array(z.string()).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return next(new HttpError(400, "Invalid payload", parsed.error.flatten()));

  const grade = await GradeModel.findById(req.params.id);
  if (!grade) return next(new HttpError(404, "Grade not found"));

  if (parsed.data.teacherIds) grade.teacherIds = parsed.data.teacherIds as never;
  if (parsed.data.studentIds) grade.studentIds = parsed.data.studentIds as never;
  if (parsed.data.subjectIds) grade.subjectIds = parsed.data.subjectIds as never;
  await grade.save();

  // Sync convenience fields on users
  if (parsed.data.teacherIds) {
    await UserModel.updateMany({ _id: { $in: parsed.data.teacherIds } }, { $addToSet: { assignedGradeIds: grade._id } });
    await UserModel.updateMany(
      { assignedGradeIds: grade._id, _id: { $nin: parsed.data.teacherIds } },
      { $pull: { assignedGradeIds: grade._id } },
    );
  }
  if (parsed.data.studentIds) {
    await UserModel.updateMany({ _id: { $in: parsed.data.studentIds } }, { $addToSet: { enrolledGradeIds: grade._id } });
    await UserModel.updateMany(
      { enrolledGradeIds: grade._id, _id: { $nin: parsed.data.studentIds } },
      { $pull: { enrolledGradeIds: grade._id } },
    );
  }

  res.json({ grade });
});

