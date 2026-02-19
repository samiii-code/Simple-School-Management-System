import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TeacherApiService } from '../../core/services/teacher-api.service';
import type { Grade, Subject, UserSummary } from '../../core/models';

type GradeDetails = {
  _id: string;
  name: string;
  studentIds: Array<Pick<UserSummary, '_id' | 'name' | 'email' | 'section'>>;
  subjectIds: Subject[];
};

type MarkRow = {
  _id: string;
  studentId: string;
  subjectId: string;
  marks: number;
  letterGrade?: string;
};

@Component({
  standalone: true,
  selector: 'app-teacher-grades',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatTooltipModule,
  ],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <div class="page-header-icon">
          <span class="material-symbols-outlined">assignment</span>
        </div>
        <div>
          <h1>My Grades</h1>
          <p>Manage marks for your assigned grades</p>
        </div>
      </div>

      <div class="grid">
        <!-- Grade Selector -->
        <mat-card>
          <mat-card-title>
            <span class="material-symbols-outlined card-icon">class</span>
            Select Grade
          </mat-card-title>
          <mat-card-content>
            <div class="selector-row">
              <mat-form-field appearance="outline" class="grade-select">
                <mat-label>Choose a Grade</mat-label>
                <mat-select [value]="selectedGradeId()" (selectionChange)="selectGrade($event.value)">
                  @for (g of grades(); track g._id) {
                    <mat-option [value]="g._id">{{ g.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <button class="reload-btn" (click)="reload()" matTooltip="Refresh grades">
                <span class="material-symbols-outlined">refresh</span>
                Reload
              </button>
            </div>
            @if (grades().length === 0) {
              <div class="empty-hint">
                <span class="material-symbols-outlined">info</span>
                No grades assigned to you yet. Contact your administrator.
              </div>
            }
          </mat-card-content>
        </mat-card>

        @if (gradeDetails()) {
          <!-- Assign Marks -->
          <mat-card>
            <mat-card-title>
              <span class="material-symbols-outlined card-icon">edit_note</span>
              Assign / Update Marks
            </mat-card-title>
            <mat-card-content>
              <form class="mark-form" [formGroup]="markForm" (ngSubmit)="saveMark()">
                <mat-form-field appearance="outline">
                  <mat-label>Student</mat-label>
                  <mat-select formControlName="studentId">
                    @for (s of gradeDetails()!.studentIds; track s._id) {
                      <mat-option [value]="s._id">{{ s.name }} ({{ s.email }})</mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Subject</mat-label>
                  <mat-select formControlName="subjectId">
                    @for (sub of gradeDetails()!.subjectIds; track sub._id) {
                      <mat-option [value]="sub._id">{{ sub.name }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Marks (0–100)</mat-label>
                  <input matInput type="number" formControlName="marks" placeholder="0" />
                </mat-form-field>

                <button type="submit" class="save-btn" [disabled]="markForm.invalid">
                  <span class="material-symbols-outlined">save</span>
                  Save Mark
                </button>
              </form>
            </mat-card-content>
          </mat-card>

          <!-- Marks Table -->
          <mat-card>
            <mat-card-title>
              <span class="material-symbols-outlined card-icon">bar_chart</span>
              Current Marks
              <span class="count-badge">{{ markRows().length }} records</span>
            </mat-card-title>
            <mat-card-content>
              <div class="table-wrap">
                <table mat-table [dataSource]="markRows()" class="table">
                  <ng-container matColumnDef="student">
                    <th mat-header-cell *matHeaderCellDef>Student</th>
                    <td mat-cell *matCellDef="let r">
                      <div class="student-cell">
                        <div class="avatar">{{ studentName(r.studentId).charAt(0).toUpperCase() }}</div>
                        <span>{{ studentName(r.studentId) }}</span>
                      </div>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="section">
                    <th mat-header-cell *matHeaderCellDef>Section</th>
                    <td mat-cell *matCellDef="let r">
                      @if (studentSection(r.studentId) !== '—') {
                        <span class="badge badge-purple">{{ studentSection(r.studentId) }}</span>
                      } @else {
                        <span class="text-muted">—</span>
                      }
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="subject">
                    <th mat-header-cell *matHeaderCellDef>Subject</th>
                    <td mat-cell *matCellDef="let r">{{ subjectName(r.subjectId) }}</td>
                  </ng-container>
                  <ng-container matColumnDef="marks">
                    <th mat-header-cell *matHeaderCellDef>Marks</th>
                    <td mat-cell *matCellDef="let r">
                      <div class="marks-bar-wrap">
                        <span class="marks-value">{{ r.marks }}</span>
                        <div class="marks-bar">
                          <div class="marks-fill" [style.width.%]="r.marks" [class]="getMarkClass(r.marks)"></div>
                        </div>
                      </div>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="grade">
                    <th mat-header-cell *matHeaderCellDef>Grade</th>
                    <td mat-cell *matCellDef="let r">
                      @if (r.letterGrade) {
                        <span class="badge" [class]="getGradeBadgeClass(r.letterGrade)">{{ r.letterGrade }}</span>
                      } @else {
                        <span class="text-muted">—</span>
                      }
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="cols"></tr>
                  <tr mat-row *matRowDef="let row; columns: cols"></tr>
                </table>
                @if (markRows().length === 0) {
                  <div class="empty-state">
                    <span class="material-symbols-outlined">bar_chart</span>
                    <p>No marks recorded yet for this grade.</p>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .grid { display: grid; gap: 20px; }

    mat-card-title {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    }
    .card-icon { font-size: 20px; color: #1E3A8A; }
    .count-badge {
      margin-left: auto;
      background: rgba(30,58,138,0.1); color: #1E3A8A;
      font-size: 0.75rem; font-weight: 700;
      padding: 2px 10px; border-radius: 9999px;
    }

    .selector-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .grade-select { flex: 1; min-width: 200px; }
    .reload-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 12px 16px; border: 1px solid #E2E8F0;
      border-radius: 8px; background: #fff; color: #64748B;
      font-size: 0.875rem; font-weight: 500; font-family: 'Poppins', sans-serif;
      cursor: pointer; transition: all 0.2s; height: 56px;
    }
    .reload-btn:hover { border-color: #1E3A8A; color: #1E3A8A; background: #F0F4FF; }
    .reload-btn .material-symbols-outlined { font-size: 18px; }

    .empty-hint {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px; margin-top: 12px;
      background: rgba(59,130,246,0.08); border-radius: 8px;
      color: #2563EB; font-size: 0.875rem;
    }
    .empty-hint .material-symbols-outlined { font-size: 18px; }

    .mark-form {
      display: grid;
      grid-template-columns: 1fr 1fr 180px auto;
      gap: 12px;
      align-items: end;
    }
    .save-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 14px 20px;
      background: linear-gradient(135deg, #1E3A8A, #2563EB);
      color: #fff; border: none; border-radius: 8px;
      font-size: 0.875rem; font-weight: 600; font-family: 'Poppins', sans-serif;
      cursor: pointer; transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(30,58,138,0.25);
      height: 56px; white-space: nowrap;
    }
    .save-btn:hover:not([disabled]) { box-shadow: 0 6px 20px rgba(30,58,138,0.35); transform: translateY(-1px); }
    .save-btn[disabled] { opacity: 0.5; cursor: not-allowed; }
    .save-btn .material-symbols-outlined { font-size: 18px; }

    .table-wrap { overflow-x: auto; border-radius: 10px; overflow: hidden; }
    .table { width: 100%; }

    .student-cell { display: flex; align-items: center; gap: 10px; }
    .avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg, #10B981, #059669);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; font-weight: 600; flex-shrink: 0;
    }
    .text-muted { color: #94A3B8; }

    .marks-bar-wrap { display: flex; align-items: center; gap: 10px; }
    .marks-value { font-weight: 600; color: #1A1A2E; min-width: 28px; }
    .marks-bar { flex: 1; height: 6px; background: #E2E8F0; border-radius: 9999px; min-width: 60px; overflow: hidden; }
    .marks-fill { height: 100%; border-radius: 9999px; transition: width 0.5s ease; }
    .marks-fill.high   { background: linear-gradient(90deg, #10B981, #059669); }
    .marks-fill.medium { background: linear-gradient(90deg, #F59E0B, #D97706); }
    .marks-fill.low    { background: linear-gradient(90deg, #EF4444, #DC2626); }

    .empty-state {
      text-align: center; padding: 40px; color: #94A3B8;
    }
    .empty-state .material-symbols-outlined { font-size: 48px; display: block; margin-bottom: 8px; }
    .empty-state p { margin: 0; font-size: 0.875rem; }

    @media (max-width: 900px) {
      .mark-form { grid-template-columns: 1fr; }
      .selector-row { flex-direction: column; align-items: stretch; }
    }
  `],
})
export class TeacherGradesComponent {
  private readonly api = inject(TeacherApiService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly grades = signal<Grade[]>([]);
  readonly selectedGradeId = signal<string | null>(null);
  readonly gradeDetails = signal<GradeDetails | null>(null);
  readonly markRows = signal<MarkRow[]>([]);
  readonly cols = ['student', 'section', 'subject', 'marks', 'grade'];

  readonly markForm = this.fb.nonNullable.group({
    studentId: ['', [Validators.required]],
    subjectId: ['', [Validators.required]],
    marks: this.fb.nonNullable.control<number>(0, { validators: [Validators.required, Validators.min(0), Validators.max(100)] }),
  });

  constructor() {
    this.reload();
  }

  reload() {
    this.api.listMyGrades().subscribe({
      next: (res) => this.grades.set(res.grades ?? []),
      error: (e: any) => this.snackBar.open(e?.error?.message ?? 'Failed to load grades', 'Close', { duration: 3000 }),
    });
  }

  selectGrade(gradeId: string) {
    this.selectedGradeId.set(gradeId);
    this.api.getGradeStudents(gradeId).subscribe({
      next: (res: any) => {
        this.gradeDetails.set(res.grade as GradeDetails);
        this.markRows.set((res.marks ?? []) as MarkRow[]);
        this.markForm.reset({ studentId: '', subjectId: '', marks: 0 });
      },
      error: (e: any) => this.snackBar.open(e?.error?.message ?? 'Failed to load grade', 'Close', { duration: 3000 }),
    });
  }

  saveMark() {
    const gradeId = this.selectedGradeId();
    if (!gradeId) return;
    const v = this.markForm.getRawValue();
    this.api.upsertMark({ gradeId, studentId: v.studentId, subjectId: v.subjectId, marks: Number(v.marks) }).subscribe({
      next: () => {
        this.snackBar.open('Mark saved', 'Close', { duration: 2000 });
        this.selectGrade(gradeId);
      },
      error: (e: any) => this.snackBar.open(e?.error?.message ?? 'Save failed', 'Close', { duration: 3000 }),
    });
  }

  studentName(studentId: string) {
    return this.gradeDetails()?.studentIds?.find((s) => s._id === studentId)?.name ?? studentId;
  }

  studentSection(studentId: string) {
    return this.gradeDetails()?.studentIds?.find((s) => s._id === studentId)?.section ?? '—';
  }

  subjectName(subjectId: string) {
    return this.gradeDetails()?.subjectIds?.find((s) => s._id === subjectId)?.name ?? subjectId;
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
}
