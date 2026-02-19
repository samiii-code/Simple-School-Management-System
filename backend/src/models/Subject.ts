import { Schema, model, type InferSchemaType } from "mongoose";

const SubjectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "" },
  },
  { timestamps: true },
);

export type Subject = InferSchemaType<typeof SubjectSchema>;
export const SubjectModel = model<Subject>("Subject", SubjectSchema);

