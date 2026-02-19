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
import { AdminApiService } from '../../core/services/admin-api.service';
import type { Grade, Subject, UserSummary } from '../../core/models';

@Component({
  standalone: true,
  selector: 'app-admin-grades',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatTooltipModule,
  ],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <div class="page-header-icon">
          <span class="material-symbols-outlined">grade</span>
        </div>
        <div>
          <h1>Grades & Classes</h1>
          <p>Create grades and assign teachers, students, and subjects</p>
        </div>
      </div>

      <div class="grid">
        <!-- Create Grade -->
        <mat-card class="form-card">
          <mat-card-title>
            <span class="material-symbols-outlined card-icon">add_circle</span>
            Create New Grade
          </mat-card-title>
          <mat-card-content>
            <form class="form-inline" [formGroup]="createForm" (ngSubmit)="create()">
              <mat-form-field appearance="outline">
                <mat-label>Grade Name</mat-label>
                <input matInput formControlName="name" placeholder="e.g. Grade 10A" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Description</mat-label>
                <input matInput formControlName="description" placeholder="Optional description" />
              </mat-form-field>
              <button type="submit" class="create-btn" [disabled]="createForm.invalid">
                <span class="material-symbols-outlined">add</span>
                Create
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Assign Card -->
        <mat-card>
          <mat-card-title>
            <span class="material-symbols-outlined card-icon">assignment_ind</span>
            Assign Members & Subjects
          </mat-card-title>
          <mat-card-content>
            <form class="assign-form" [formGroup]="assignForm" (ngSubmit)="assign()">
              <mat-form-field appearance="outline">
                <mat-label>Select Grade</mat-label>
                <mat-select formControlName="gradeId">
                  @for (g of grades(); track g._id) {
                    <mat-option [value]="g._id">{{ g.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Teachers</mat-label>
                <mat-select formControlName="teacherIds" multiple>
                  @for (u of teachers(); track u._id) {
                    <mat-option [value]="u._id">{{ u.name }} ({{ u.email }})</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Students</mat-label>
                <mat-select formControlName="studentIds" multiple>
                  @for (u of students(); track u._id) {
                    <mat-option [value]="u._id">{{ u.name }} ({{ u.email }})</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Subjects</mat-label>
                <mat-select formControlName="subjectIds" multiple>
                  @for (s of subjects(); track s._id) {
                    <mat-option [value]="s._id">{{ s.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <div class="assign-actions">
                <button type="submit" class="save-btn" [disabled]="assignForm.invalid">
                  <span class="material-symbols-outlined">save</span>
                  Save Assignments
                </button>
                <button type="button" class="reload-btn" (click)="reload()">
                  <span class="material-symbols-outlined">refresh</span>
                  Reload
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Grades Table -->
        <mat-card>
          <mat-card-title>
            <span class="material-symbols-outlined card-icon">list</span>
            All Grades
            <span class="count-badge">{{ grades().length }}</span>
          </mat-card-title>
          <mat-card-content>
            <div class="table-wrap">
              <table mat-table [dataSource]="grades()" class="table">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Grade</th>
                  <td mat-cell *matCellDef="let g">
                    <div class="grade-cell">
                      <div class="grade-icon">
                        <span class="material-symbols-outlined">class</span>
                      </div>
                      <span class="grade-name">{{ g.name }}</span>
                    </div>
                  </td>
                </ng-container>
                <ng-container matColumnDef="desc">
                  <th mat-header-cell *matHeaderCellDef>Description</th>
                  <td mat-cell *matCellDef="let g">
                    <span class="desc-text">{{ g.description || '—' }}</span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="counts">
                  <th mat-header-cell *matHeaderCellDef>Members</th>
                  <td mat-cell *matCellDef="let g">
                    <div class="counts">
                      <span class="badge badge-blue">
                        <span class="material-symbols-outlined count-icon">school</span>
                        {{ g.teacherIds?.length || 0 }} Teachers
                      </span>
                      <span class="badge badge-green">
                        <span class="material-symbols-outlined count-icon">person</span>
                        {{ g.studentIds?.length || 0 }} Students
                      </span>
                      <span class="badge badge-gold">
                        <span class="material-symbols-outlined count-icon">menu_book</span>
                        {{ g.subjectIds?.length || 0 }} Subjects
                      </span>
                    </div>
                  </td>
                </ng-container>
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let g">
                    <button class="action-btn delete" (click)="delete(g)" matTooltip="Delete grade">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="cols"></tr>
                <tr mat-row *matRowDef="let row; columns: cols"></tr>
              </table>
              @if (grades().length === 0) {
                <div class="empty-state">
                  <span class="material-symbols-outlined">grade</span>
                  <p>No grades yet. Create your first grade above.</p>
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

    .form-card mat-card-content { padding-top: 16px; }
    .form-inline {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 12px;
      align-items: end;
    }
    .create-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 14px 20px;
      background: linear-gradient(135deg, #1E3A8A, #2563EB);
      color: #fff; border: none; border-radius: 8px;
      font-size: 0.875rem; font-weight: 600; font-family: 'Poppins', sans-serif;
      cursor: pointer; transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(30,58,138,0.25);
      height: 56px; white-space: nowrap;
    }
    .create-btn:hover:not([disabled]) { box-shadow: 0 6px 20px rgba(30,58,138,0.35); transform: translateY(-1px); }
    .create-btn[disabled] { opacity: 0.5; cursor: not-allowed; }
    .create-btn .material-symbols-outlined { font-size: 18px; }

    .assign-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .assign-actions {
      grid-column: 1 / -1;
      display: flex; gap: 12px;
    }
    .save-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 20px;
      background: linear-gradient(135deg, #1E3A8A, #2563EB);
      color: #fff; border: none; border-radius: 8px;
      font-size: 0.875rem; font-weight: 600; font-family: 'Poppins', sans-serif;
      cursor: pointer; transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(30,58,138,0.25);
    }
    .save-btn:hover:not([disabled]) { box-shadow: 0 6px 20px rgba(30,58,138,0.35); transform: translateY(-1px); }
    .save-btn[disabled] { opacity: 0.5; cursor: not-allowed; }
    .save-btn .material-symbols-outlined { font-size: 18px; }
    .reload-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 12px 16px; border: 1px solid #E2E8F0;
      border-radius: 8px; background: #fff; color: #64748B;
      font-size: 0.875rem; font-weight: 500; font-family: 'Poppins', sans-serif;
      cursor: pointer; transition: all 0.2s;
    }
    .reload-btn:hover { border-color: #1E3A8A; color: #1E3A8A; background: #F0F4FF; }
    .reload-btn .material-symbols-outlined { font-size: 18px; }

    .table-wrap { overflow-x: auto; border-radius: 10px; overflow: hidden; }
    .table { width: 100%; }

    .grade-cell { display: flex; align-items: center; gap: 10px; }
    .grade-icon {
      width: 32px; height: 32px; border-radius: 8px;
      background: rgba(30,58,138,0.08);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .grade-icon .material-symbols-outlined { font-size: 16px; color: #1E3A8A; }
    .grade-name { font-weight: 600; color: #1A1A2E; }
    .desc-text { color: #64748B; font-size: 0.875rem; }

    .counts { display: flex; gap: 6px; flex-wrap: wrap; }
    .count-icon { font-size: 12px; }

    .action-btn {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border: none; border-radius: 6px;
      cursor: pointer; transition: all 0.2s;
    }
    .action-btn .material-symbols-outlined { font-size: 16px; }
    .action-btn.delete { background: rgba(239,68,68,0.08); color: #EF4444; }
    .action-btn.delete:hover { background: rgba(239,68,68,0.15); }

    .empty-state {
      text-align: center; padding: 40px; color: #94A3B8;
    }
    .empty-state .material-symbols-outlined { font-size: 48px; display: block; margin-bottom: 8px; }
    .empty-state p { margin: 0; font-size: 0.875rem; }

    @media (max-width: 900px) {
      .form-inline { grid-template-columns: 1fr; }
      .assign-form { grid-template-columns: 1fr; }
    }
  `],
})
export class AdminGradesComponent {
  private readonly api = inject(AdminApiService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly grades = signal<Grade[]>([]);
  readonly teachers = signal<UserSummary[]>([]);
  readonly students = signal<UserSummary[]>([]);
  readonly subjects = signal<Subject[]>([]);
  readonly cols = ['name', 'desc', 'counts', 'actions'];

  readonly createForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
  });

  readonly assignForm = this.fb.nonNullable.group({
    gradeId: ['', [Validators.required]],
    teacherIds: this.fb.nonNullable.control<string[]>([]),
    studentIds: this.fb.nonNullable.control<string[]>([]),
    subjectIds: this.fb.nonNullable.control<string[]>([]),
  });

  constructor() {
    this.reload();
  }

  reload() {
    this.api.listGrades().subscribe({
      next: (res) => this.grades.set(res.grades ?? []),
      error: (e: any) => this.snackBar.open(e?.error?.message ?? 'Failed to load grades', 'Close', { duration: 3000 }),
    });
    this.api.listUsers('Teacher').subscribe({ next: (res) => this.teachers.set(res.users ?? []) });
    this.api.listUsers('Student').subscribe({ next: (res) => this.students.set(res.users ?? []) });
    this.api.listSubjects().subscribe({ next: (res) => this.subjects.set(res.subjects ?? []) });
  }

  create() {
    const v = this.createForm.getRawValue();
    this.api.createGrade(v).subscribe({
      next: () => {
        this.snackBar.open('Grade created', 'Close', { duration: 2500 });
        this.createForm.setValue({ name: '', description: '' });
        this.reload();
      },
      error: (e: any) => this.snackBar.open(e?.error?.message ?? 'Create failed', 'Close', { duration: 3000 }),
    });
  }

  assign() {
    const v = this.assignForm.getRawValue();
    this.api.assignGrade(v.gradeId, {
      teacherIds: v.teacherIds,
      studentIds: v.studentIds,
      subjectIds: v.subjectIds,
    }).subscribe({
      next: () => {
        this.snackBar.open('Assignments saved', 'Close', { duration: 2500 });
        this.reload();
      },
      error: (e: any) => this.snackBar.open(e?.error?.message ?? 'Assign failed', 'Close', { duration: 3000 }),
    });
  }

  delete(g: Grade) {
    if (!confirm(`Are you sure you want to delete ${g.name}?`)) return;
    this.api.deleteGrade(g._id).subscribe({
      next: () => {
        this.snackBar.open('Grade deleted', 'Close', { duration: 2500 });
        this.reload();
      },
      error: (e: any) => this.snackBar.open(e?.error?.message ?? 'Delete failed', 'Close', { duration: 3000 }),
    });
  }
}
