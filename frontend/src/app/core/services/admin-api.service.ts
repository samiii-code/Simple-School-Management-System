import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from '../app-config';
import type { Grade, Subject, UserSummary } from '../models';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  listUsers(role?: 'Teacher' | 'Student') {
    const params = role ? new HttpParams().set('role', role) : undefined;
    return this.http.get<{ users: UserSummary[] }>(`${this.config.apiBaseUrl}/api/admin/users`, { params });
  }

  createUser(input: { name: string; email: string; password: string; role: 'Teacher' | 'Student'; section?: string }) {
    return this.http.post(`${this.config.apiBaseUrl}/api/admin/users`, input);
  }

  updateUser(id: string, input: { name?: string; email?: string; password?: string; section?: string }) {
    return this.http.patch(`${this.config.apiBaseUrl}/api/admin/users/${id}`, input);
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.config.apiBaseUrl}/api/admin/users/${id}`);
  }

  listSubjects() {
    return this.http.get<{ subjects: Subject[] }>(`${this.config.apiBaseUrl}/api/admin/subjects`);
  }

  createSubject(input: { name: string; description?: string }) {
    return this.http.post<{ subject: Subject }>(`${this.config.apiBaseUrl}/api/admin/subjects`, input);
  }

  deleteSubject(id: string) {
    return this.http.delete(`${this.config.apiBaseUrl}/api/admin/subjects/${id}`);
  }

  listGrades() {
    return this.http.get<{ grades: Grade[] }>(`${this.config.apiBaseUrl}/api/admin/grades`);
  }

  createGrade(input: { name: string; description?: string }) {
    return this.http.post<{ grade: Grade }>(`${this.config.apiBaseUrl}/api/admin/grades`, input);
  }

  assignGrade(gradeId: string, input: { teacherIds?: string[]; studentIds?: string[]; subjectIds?: string[] }) {
    return this.http.put<{ grade: Grade }>(`${this.config.apiBaseUrl}/api/admin/grades/${gradeId}/assign`, input);
  }

  deleteGrade(id: string) {
    return this.http.delete(`${this.config.apiBaseUrl}/api/admin/grades/${id}`);
  }
}

