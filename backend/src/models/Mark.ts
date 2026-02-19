import { Schema, model, type InferSchemaType } from "mongoose";

const MarkSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    gradeId: { type: Schema.Types.ObjectId, ref: "Grade", required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    marks: { type: Number, required: true, min: 0, max: 100 },
    letterGrade: { type: String, enum: ["A+", "A", "B+", "B", "C+", "C", "D", "D-", "F"] },
  },
  { timestamps: true },
);

MarkSchema.index({ studentId: 1, subjectId: 1, gradeId: 1 }, { unique: true });

export type Mark = InferSchemaType<typeof MarkSchema>;
export const MarkModel = model<Mark>("Mark", MarkSchema);

