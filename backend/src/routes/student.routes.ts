import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole, requirePermission } from "../middleware/rbac";
import { Permission } from "../models/Role";
import { GradeModel } from "../models/Grade";
import { MarkModel } from "../models/Mark";
import { marksToLetterGrade } from "../utils/grading";

export const studentRouter = Router();

studentRouter.use(requireAuth, requireRole(["Student"]), requirePermission(Permission.MarksReadSelf));

studentRouter.get("/marks", async (req, res) => {
  const gradeIds = (await GradeModel.find({ studentIds: req.auth!.id }).select("_id").lean()).map((g) => g._id);
  const marks = await MarkModel.find({ studentId: req.auth!.id, gradeId: { $in: gradeIds } })
    .populate("subjectId")
    .populate("gradeId")
    .lean();
  const withGrade = marks.map((m) => ({
    ...m,
    letterGrade: m.letterGrade ?? marksToLetterGrade(m.marks),
  }));
  res.json({ marks: withGrade });
});

studentRouter.get("/performance", async (req, res) => {
  const gradeIds = (await GradeModel.find({ studentIds: req.auth!.id }).select("_id").lean()).map((g) => g._id);
  const marks = await MarkModel.find({ studentId: req.auth!.id, gradeId: { $in: gradeIds } }).lean();
  const withGrade = marks.map((m) => ({ ...m, letterGrade: m.letterGrade ?? marksToLetterGrade(m.marks) }));
  const total = withGrade.length;
  const average = total > 0 ? withGrade.reduce((s, m) => s + m.marks, 0) / total : 0;
  const breakdown: Record<string, number> = {};
  for (const g of ["A+", "A", "B+", "B", "C+", "C", "D", "D-", "F"]) {
    breakdown[g] = withGrade.filter((m) => m.letterGrade === g).length;
  }
  res.json({ average: Math.round(average * 100) / 100, total, breakdown });
});

