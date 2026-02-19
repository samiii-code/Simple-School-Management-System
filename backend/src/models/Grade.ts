import { Schema, model, type InferSchemaType } from "mongoose";

const GradeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    teacherIds: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    studentIds: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    subjectIds: { type: [Schema.Types.ObjectId], ref: "Subject", default: [] },
  },
  { timestamps: true },
);

export type Grade = InferSchemaType<typeof GradeSchema>;
export const GradeModel = model<Grade>("Grade", GradeSchema);

