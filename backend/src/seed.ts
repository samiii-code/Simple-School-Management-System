import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDb } from "./config/db";
import { RoleModel, Permission } from "./models/Role";
import { UserModel } from "./models/User";
import { SubjectModel } from "./models/Subject";
import { GradeModel } from "./models/Grade";
import { MarkModel } from "./models/Mark";
import { marksToLetterGrade } from "./utils/grading";

const ETHIOPIAN_STUDENTS: { name: string; email: string; section: string; marks: number }[] = [
  { name: "Abel Tesfaye", email: "abel.tesfaye@school.com", section: "Grade 9", marks: 88 },
  { name: "Hana Mekonnen", email: "hana.mekonnen@school.com", section: "Grade 10", marks: 94 },
  { name: "Dawit Alemu", email: "dawit.alemu@school.com", section: "Grade 11", marks: 72 },
  { name: "Bethlehem Girma", email: "bethlehem.girma@school.com", section: "Grade 12", marks: 67 },
  { name: "Samuel Bekele", email: "samuel.bekele@school.com", section: "Grade 9", marks: 53 },
  { name: "Eden Tadesse", email: "eden.tadesse@school.com", section: "Grade 10", marks: 98 },
  { name: "Natnael Fikru", email: "natnael.fikru@school.com", section: "Grade 11", marks: 45 },
  { name: "Ruth Haile", email: "ruth.haile@school.com", section: "Grade 12", marks: 81 },
];

async function seed() {
  await connectDb();

  const adminRole = await RoleModel.findOneAndUpdate(
    { name: "Admin" },
    {
      $set: {
        name: "Admin",
        permissions: [
          Permission.UsersManage,
          Permission.SubjectsManage,
          Permission.GradesManage,
          Permission.MarksWrite,
          Permission.MarksReadAssigned,
          Permission.MarksReadSelf,
        ],
      },
    },
    { upsert: true, new: true },
  );

  const teacherRole = await RoleModel.findOneAndUpdate(
    { name: "Teacher" },
    { $set: { name: "Teacher", permissions: [Permission.MarksWrite, Permission.MarksReadAssigned] } },
    { upsert: true, new: true },
  );

  const studentRole = await RoleModel.findOneAndUpdate(
    { name: "Student" },
    { $set: { name: "Student", permissions: [Permission.MarksReadSelf] } },
    { upsert: true, new: true },
  );

  const adminEmail = "admin@school.com";
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  await UserModel.findOneAndUpdate(
    { email: adminEmail },
    {
      $set: {
        name: "System Admin",
        email: adminEmail,
        passwordHash: adminPasswordHash,
        roleId: adminRole._id,
      },
    },
    { upsert: true, new: true },
  );

  const sampleTeacherEmail = "teacher@school.com";
  const sampleStudentEmail = "student@school.com";

  const sampleTeacher = await UserModel.findOneAndUpdate(
    { email: sampleTeacherEmail },
    {
      $set: {
        name: "Sample Teacher",
        email: sampleTeacherEmail,
        passwordHash: await bcrypt.hash("Teacher123!", 10),
        roleId: teacherRole._id,
      },
    },
    { upsert: true, new: true },
  ).then((u) => u!);

  const sampleStudent = await UserModel.findOneAndUpdate(
    { email: sampleStudentEmail },
    {
      $set: {
        name: "Sample Student",
        email: sampleStudentEmail,
        passwordHash: await bcrypt.hash("Student123!", 10),
        roleId: studentRole._id,
        section: "Section A",
      },
    },
    { upsert: true, new: true },
  ).then((u) => u!);

  // Subject and grade (class) for Ethiopian sample data
  let subject = await SubjectModel.findOne({ name: "Mathematics" });
  if (!subject) {
    subject = await SubjectModel.create({ name: "Mathematics", description: "Core subject" });
  }

  let gradeClass = await GradeModel.findOne({ name: "Grade 10" });
  if (!gradeClass) {
    gradeClass = await GradeModel.create({ name: "Grade 10", description: "Sample class" });
  }

  const studentIds: mongoose.Types.ObjectId[] = [sampleStudent._id];
  for (const s of ETHIOPIAN_STUDENTS) {
    const existing = await UserModel.findOne({ email: s.email.toLowerCase() });
    if (!existing) {
      const user = await UserModel.create({
        name: s.name,
        email: s.email.toLowerCase(),
        passwordHash: await bcrypt.hash("Student123!", 10),
        roleId: studentRole._id,
        section: s.section,
      });
      studentIds.push(user._id);
    } else {
      studentIds.push(existing._id);
    }
  }

  await GradeModel.findByIdAndUpdate(gradeClass._id, {
    $set: {
      teacherIds: [sampleTeacher._id],
      studentIds,
      subjectIds: [subject._id],
    },
  });

  await UserModel.updateMany(
    { _id: { $in: studentIds } },
    { $addToSet: { enrolledGradeIds: gradeClass._id } },
  );
  await UserModel.updateOne(
    { _id: sampleTeacher._id },
    { $addToSet: { assignedGradeIds: gradeClass._id } },
  );

  for (const s of ETHIOPIAN_STUDENTS) {
    const user = await UserModel.findOne({ email: s.email.toLowerCase() });
    if (!user) continue;
    const letterGrade = marksToLetterGrade(s.marks);
    await MarkModel.findOneAndUpdate(
      { studentId: user._id, subjectId: subject._id, gradeId: gradeClass._id },
      {
        $set: {
          marks: s.marks,
          letterGrade,
          teacherId: sampleTeacher._id,
        },
      },
      { upsert: true },
    );
  }

  // eslint-disable-next-line no-console
  console.log("Seed complete. Test accounts: admin@school.com, teacher@school.com, student@school.com (Password: Admin123! / Teacher123! / Student123!)");
}

seed()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

