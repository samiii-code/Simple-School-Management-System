import type { RoleName } from './app-config';

export interface LoginResponse {
  token: string;
  user: { id: string; name: string; email: string; role: RoleName };
}

export interface UserSummary {
  _id: string;
  name: string;
  email: string;
  section?: string;
}

export interface Subject {
  _id: string;
  name: string;
  description?: string;
}

export interface Grade {
  _id: string;
  name: string;
  description?: string;
  teacherIds: string[];
  studentIds: string[];
  subjectIds: string[];
}

export interface Mark {
  _id: string;
  marks: number;
  letterGrade?: string;
  subjectId: Subject | { _id: string; name: string };
  gradeId: Grade | { _id: string; name: string };
  studentId?: string;
}

