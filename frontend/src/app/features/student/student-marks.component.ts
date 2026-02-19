import { Component, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { StudentApiService } from '../../core/services/student-api.service';
import type { Mark } from '../../core/models';

@Component({
  standalone: true,
  selector: 'app-student-marks',
  imports: [CommonModule, DecimalPipe, MatCardModule, MatButtonModule, MatTableModule],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <div class="page-header-icon">
          <span class="material-symbols-outlined">bar_chart</span>
        </div>
        <div>
          <h1>My Academic Results</h1>
          <p>View your marks and performance summary</p>
        </div>
      </div>

      <div class="grid">
        <!-- Performance Summary -->
        @if (performance()) {
          <div class="stats-row">
            <!-- Average Score Card -->
            <div class="stat-card primary">
              <div class="stat-icon">
                <span class="material-symbols-outlined">trending_up</span>
              </div>
              <div class="stat-body">
                <div class="stat-value">{{ performance()!.average | number:'1.1-1' }}%</div>
                <div class="stat-label">Average Score</div>
              </div>
              <div class="stat-ring">
                <svg viewBox="0 0 36 36" class="ring-svg">
                  <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  <path class="ring-fill" [attr.stroke-dasharray]="performance()!.average + ', 100'"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                </svg>
              </div>
            </div>

            <!-- Total Subjects Card -->
            <div class="stat-card green">
              <div class="stat-icon">
                <span class="material-symbols-outlined">menu_book</span>
              </div>
              <div class="stat-body">
                <div class="stat-value">{{ performance()!.total }}</div>
                <div class="stat-label">Total Subjects</div>
              </div>
            </div>

            <!-- Grade Breakdown Card -->
            @if (breakdownKeys.length) {
              <div class="stat-card gold breakdown-card">
                <div class="breakdown-header">
                  <div class="stat-icon">
                    <span class="material-symbols-outlined">grade</span>
                  </div>
                  <span class="breakdown-title">Grade Breakdown</span>
                </div>
                <div class="breakdown-chips">
                  @for (entry of breakdownEntries; track entry.grade) {
                    <span class="grade-chip" [class]="getGradeChipClass(entry.grade)">
                      {{ entry.grade }}: {{ entry.count }}
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- Marks Table -->
        <mat-card>
          <mat-card-title>
            <span class="material-symbols-outlined card-icon">list_alt</span>
            My Marks
            <div class="title-actions">
              <button class="reload-btn" (click)="reload()">
                <span class="material-symbols-outlined">refresh</span>
                Refresh
              </button>
            </div>
          </mat-card-title>
          <mat-card-content>
            <div class="table-wrap">
              <table mat-table [dataSource]="marks()" class="table">
                <ng-container matColumnDef="subject">
                  <th mat-header-cell *matHeaderCellDef>Subject</th>
                  <td mat-cell *matCellDef="let m">
                    <div class="subject-cell">
                      <div class="subject-icon">
                        <span class="material-symbols-outlined">auto_stories</span>
                      </div>
                      <span class="subject-name">{{ subjectName(m) }}</span>
                    </div>
                  </td>
                </ng-container>
                <ng-container matColumnDef="marks">
                  <th mat-header-cell *matHeaderCellDef>Marks</th>
                  <td mat-cell *matCellDef="let m">
                    <div class="marks-bar-wrap">
                      <span class="marks-value">{{ m.marks }}<span class="marks-max">/100</span></span>
                      <div class="marks-bar">
                        <div class="marks-fill" [style.width.%]="m.marks" [class]="getMarkClass(m.marks)"></div>
                      </div>
                    </div>
                  </td>
                </ng-container>
                <ng-container matColumnDef="letterGrade">
                  <th mat-header-cell *matHeaderCellDef>Grade</th>
                  <td mat-cell *matCellDef="let m">
                    @if (m.letterGrade) {
                      <span class="badge" [class]="getGradeBadgeClass(m.letterGrade)">{{ m.letterGrade }}</span>
                    } @else {
                      <span class="text-muted">—</span>
                    }
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="cols"></tr>
                <tr mat-row *matRowDef="let row; columns: cols"></tr>
              </table>
              @if (marks().length === 0) {
                <div class="empty-state">
                  <span class="material-symbols-outlined">bar_chart</span>
                  <p>No marks recorded yet. Check back after your teacher assigns grades.</p>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .grid { display: grid; gap: 20px; }

    /* Stats row */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }

    .stat-card {
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(30,58,138,0.08);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(30,58,138,0.14); }

    .stat-card.primary {
      background: linear-gradient(135deg, #1E3A8A, #2563EB);
      color: #fff;
    }
    .stat-card.green {
      background: linear-gradient(135deg, #059669, #10B981);
      color: #fff;
    }
    .stat-card.gold {
      background: linear-gradient(135deg, #D97706, #F59E0B);
      color: #fff;
    }
    .stat-card.breakdown-card {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .stat-icon {
      width: 48px; height: 48px;
      border-radius: 12px;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .stat-icon .material-symbols-outlined { font-size: 26px; color: #fff; }

    .stat-body { flex: 1; }
    .stat-value { font-size: 2rem; font-weight: 700; line-height: 1; letter-spacing: -0.02em; }
    .stat-label { font-size: 0.8rem; opacity: 0.85; margin-top: 4px; font-weight: 500; }

    /* Ring chart */
    .stat-ring {
      position: absolute;
      right: 16px;
      width: 56px; height: 56px;
      opacity: 0.25;
    }
    .ring-svg { transform: rotate(-90deg); }
    .ring-bg { fill: none; stroke: rgba(255,255,255,0.4); stroke-width: 3; }
    .ring-fill { fill: none; stroke: #fff; stroke-width: 3; stroke-linecap: round; transition: stroke-dasharray 0.8s ease; }

    /* Breakdown */
    .breakdown-header { display: flex; align-items: center; gap: 10px; }
    .breakdown-title { font-size: 0.875rem; font-weight: 600; color: #fff; }
    .breakdown-chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .grade-chip {
      padding: 4px 12px; border-radius: 9999px;
      font-size: 0.8rem; font-weight: 700;
      background: rgba(255,255,255,0.25);
      color: #fff;
    }
    .grade-chip.grade-a { background: rgba(255,255,255,0.3); }
    .grade-chip.grade-b { background: rgba(255,255,255,0.25); }
    .grade-chip.grade-c { background: rgba(255,255,255,0.2); }
    .grade-chip.grade-d, .grade-chip.grade-f { background: rgba(255,255,255,0.15); }

    /* Card title */
    mat-card-title {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    }
    .card-icon { font-size: 20px; color: #1E3A8A; }
    .title-actions { margin-left: auto; }
    .reload-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 16px; border: 1px solid #E2E8F0;
      border-radius: 8px; background: #fff; color: #64748B;
      font-size: 0.8rem; font-weight: 500; font-family: 'Poppins', sans-serif;
      cursor: pointer; transition: all 0.2s;
    }
    .reload-btn:hover { border-color: #1E3A8A; color: #1E3A8A; background: #F0F4FF; }
    .reload-btn .material-symbols-outlined { font-size: 18px; }

    /* Table */
    .table-wrap { overflow-x: auto; border-radius: 10px; overflow: hidden; }
    .table { width: 100%; }

    .subject-cell { display: flex; align-items: center; gap: 10px; }
    .subject-icon {
      width: 32px; height: 32px; border-radius: 8px;
      background: rgba(30,58,138,0.08);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .subject-icon .material-symbols-outlined { font-size: 16px; color: #1E3A8A; }
    .subject-name { font-weight: 500; color: #1A1A2E; }

    .marks-bar-wrap { display: flex; align-items: center; gap: 10px; }
    .marks-value { font-weight: 700; color: #1A1A2E; min-width: 48px; font-size: 0.9rem; }
    .marks-max { font-weight: 400; color: #94A3B8; font-size: 0.75rem; }
    .marks-bar { flex: 1; height: 6px; background: #E2E8F0; border-radius: 9999px; min-width: 80px; overflow: hidden; }
    .marks-fill { height: 100%; border-radius: 9999px; transition: width 0.6s ease; }
    .marks-fill.high   { background: linear-gradient(90deg, #10B981, #059669); }
    .marks-fill.medium { background: linear-gradient(90deg, #F59E0B, #D97706); }
    .marks-fill.low    { background: linear-gradient(90deg, #EF4444, #DC2626); }

    .text-muted { color: #94A3B8; }

    .empty-state {
      text-align: center; padding: 48px; color: #94A3B8;
    }
    .empty-state .material-symbols-outlined { font-size: 56px; display: block; margin-bottom: 12px; }
    .empty-state p { margin: 0; font-size: 0.875rem; max-width: 280px; margin: 0 auto; }

    @media (max-width: 768px) {
      .stats-row { grid-template-columns: 1fr; }
    }
  `],
})
export class StudentMarksComponent {
  private readonly api = inject(StudentApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly marks = signal<Mark[]>([]);
  readonly performance = signal<{ average: number; total: number; breakdown: Record<string, number> } | null>(null);
  readonly cols = ['subject', 'marks', 'letterGrade'];

  get breakdownKeys(): string[] {
    const p = this.performance();
    return p?.breakdown ? Object.keys(p.breakdown) : [];
  }

  get breakdownEntries(): { grade: string; count: number }[] {
    const p = this.performance();
    if (!p?.breakdown) return [];
    return Object.entries(p.breakdown)
      .map(([grade, count]) => ({ grade, count }))
      .sort((a, b) => (a.grade < b.grade ? -1 : 1));
  }

  constructor() {
    this.reload();
  }

  reload() {
    this.api.listMyMarks().subscribe({
      next: (res) => this.marks.set(res.marks ?? []),
      error: (e: any) => this.snackBar.open(e?.error?.message ?? 'Failed to load marks', 'Close', { duration: 3000 }),
    });
    this.api.getPerformance().subscribe({
      next: (res) => this.performance.set(res),
      error: () => this.performance.set(null),
    });
  }

  subjectName(m: Mark): string {
    const sub = m.subjectId;
    return (sub && typeof sub === 'object' && 'name' in sub ? sub.name : null) ?? '—';
  }

  getMarkClass(marks: number): string {
    if (marks >= 70) return 'high';
    if (marks >= 50) return 'medium';
    return 'low';
  }

  getGradeBadgeClass(grade: string): string {
    const map: Record<string, string> = {
      'A+': 'badge badge-green',
      'A': 'badge badge-green',
      'B+': 'badge badge-blue',
      'B': 'badge badge-blue',
      'C+': 'badge badge-gold',
      'C': 'badge badge-gold',
      'D': 'badge badge-red',
      'D-': 'badge badge-red',
      'F': 'badge badge-red',
    };
    return map[grade] ?? 'badge badge-gray';
  }

  getGradeChipClass(grade: string): string {
    const map: Record<string, string> = {
      'A+': 'grade-chip grade-a',
      'A': 'grade-chip grade-a',
      'B+': 'grade-chip grade-b',
      'B': 'grade-chip grade-b',
      'C+': 'grade-chip grade-c',
      'C': 'grade-chip grade-c',
      'D': 'grade-chip grade-d',
      'D-': 'grade-chip grade-d',
      'F': 'grade-chip grade-f',
    };
    return map[grade] ?? 'grade-chip';
  }
}
