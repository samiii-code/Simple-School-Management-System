import { Schema, model, type InferSchemaType } from "mongoose";

export const Permission = {
  UsersManage: "users:manage",
  SubjectsManage: "subjects:manage",
  GradesManage: "grades:manage",
  MarksWrite: "marks:write",
  MarksReadAssigned: "marks:read_assigned",
  MarksReadSelf: "marks:read_self",
} as const;

export type PermissionKey = (typeof Permission)[keyof typeof Permission];
export type RoleName = "Admin" | "Teacher" | "Student";

const RoleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, enum: ["Admin", "Teacher", "Student"] },
    permissions: { type: [String], required: true, default: [] },
  },
  { timestamps: true },
);

export type Role = InferSchemaType<typeof RoleSchema>;
export const RoleModel = model<Role>("Role", RoleSchema);

