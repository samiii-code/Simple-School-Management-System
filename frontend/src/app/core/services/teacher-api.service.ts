import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from '../app-config';
import type { Grade } from '../models';

@Injectable({ providedIn: 'root' })
export class TeacherApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  listMyGrades() {
    return this.http.get<{ grades: Grade[] }>(`${this.config.apiBaseUrl}/api/teacher/grades`);
  }

  getGradeStudents(gradeId: string) {
    return this.http.get(`${this.config.apiBaseUrl}/api/teacher/grades/${gradeId}/students`);
  }

  upsertMark(input: { gradeId: string; studentId: string; subjectId: string; marks: number }) {
    return this.http.post(`${this.config.apiBaseUrl}/api/teacher/marks`, input);
  }
}

