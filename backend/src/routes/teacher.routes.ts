import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { requireRole, requirePermission } from "../middleware/rbac";
import { Permission } from "../models/Role";
import { GradeModel } from "../models/Grade";
import { MarkModel } from "../models/Mark";
import { HttpError } from "../utils/httpErrors";
import { marksToLetterGrade } from "../utils/grading";

export const teacherRouter = Router();

teacherRouter.use(requireAuth, requireRole(["Teacher"]), requirePermission(Permission.MarksWrite));

teacherRouter.get("/grades", async (req, res) => {
  const grades = await GradeModel.find({ teacherIds: req.auth!.id }).lean();
  res.json({ grades });
});

teacherRouter.get("/grades/:gradeId/students", async (req, res, next) => {
  const grade = await GradeModel.findById(req.params.gradeId).populate("studentIds", "name email section").populate("subjectIds");
  if (!grade) return next(new HttpError(404, "Grade not found"));
  if (!grade.teacherIds.map(String).includes(req.auth!.id)) return next(new HttpError(403, "Forbidden"));

  const marks = await MarkModel.find({ gradeId: grade._id }).lean();
  const marksWithGrade = marks.map((m) => ({
    ...m,
    letterGrade: m.letterGrade ?? marksToLetterGrade(m.marks),
  }));
  res.json({ grade, marks: marksWithGrade });
});

teacherRouter.post("/marks", async (req, res, next) => {
  const schema = z.object({
    gradeId: z.string().min(1),
    studentId: z.string().min(1),
    subjectId: z.string().min(1),
    marks: z.number().min(0).max(100),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return next(new HttpError(400, "Invalid payload", parsed.error.flatten()));

  const grade = await GradeModel.findById(parsed.data.gradeId).lean();
  if (!grade) return next(new HttpError(404, "Grade not found"));
  if (!grade.teacherIds.map(String).includes(req.auth!.id)) return next(new HttpError(403, "Forbidden"));
  if (!grade.studentIds.map(String).includes(parsed.data.studentId)) return next(new HttpError(400, "Student not in grade"));
  if (!grade.subjectIds.map(String).includes(parsed.data.subjectId)) return next(new HttpError(400, "Subject not in grade"));

  const letterGrade = marksToLetterGrade(parsed.data.marks);
  const mark = await MarkModel.findOneAndUpdate(
    { gradeId: parsed.data.gradeId, studentId: parsed.data.studentId, subjectId: parsed.data.subjectId },
    { $set: { marks: parsed.data.marks, letterGrade, teacherId: req.auth!.id } },
    { upsert: true, new: true },
  ).lean();

  res.status(201).json({ mark });
});

