import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from '../app-config';
import type { Mark } from '../models';

@Injectable({ providedIn: 'root' })
export class StudentApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  listMyMarks() {
    return this.http.get<{ marks: Mark[] }>(`${this.config.apiBaseUrl}/api/student/marks`);
  }

  getPerformance() {
    return this.http.get<{ average: number; total: number; breakdown: Record<string, number> }>(
      `${this.config.apiBaseUrl}/api/student/performance`
    );
  }
}

