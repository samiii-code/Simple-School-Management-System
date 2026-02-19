import { Schema, model, type InferSchemaType, type Types } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },

    // Student: section e.g. "Section A", "Section B"
    section: { type: String, default: "", trim: true },

    // Convenience linkage for dashboards (optional)
    assignedGradeIds: { type: [Schema.Types.ObjectId], ref: "Grade", default: [] }, // Teacher
    enrolledGradeIds: { type: [Schema.Types.ObjectId], ref: "Grade", default: [] }, // Student
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 }, { unique: true });

export type User = InferSchemaType<typeof UserSchema> & {
  _id: Types.ObjectId;
};

export const UserModel = model<User>("User", UserSchema);

