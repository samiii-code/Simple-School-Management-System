import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminApiService } from '../../core/services/admin-api.service';
import type { Subject } from '../../core/models';

@Component({
  standalone: true,
  selector: 'app-admin-subjects',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatTooltipModule,
  ],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <div class="page-header-icon">
          <span class="material-symbols-outlined">menu_book</span>
        </div>
        <div>
          <h1>Subjects</h1>
          <p>Manage academic subjects and courses</p>
        </div>
      </div>

      <div class="grid">
        <!-- Create Subject -->
        <mat-card class="form-card">
          <mat-card-title>
            <span class="material-symbols-outlined card-icon">add_circle</span>
            Create New Subject
          </mat-card-title>
          <mat-card-content>
            <form class="form" [formGroup]="form" (ngSubmit)="create()">
              <mat-form-field appearance="outline">
                <mat-label>Subject Name</mat-label>
                <input matInput formControlName="name" placeholder="e.g. Mathematics" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Description</mat-label>
                <input matInput formControlName="description" placeholder="Brief description (optional)" />
              </mat-form-field>
              <button type="submit" class="create-btn" [disabled]="form.invalid">
                <span class="material-symbols-outlined">add</span>
                Add Subject
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Subjects Table -->
        <mat-card>
          <mat-card-title>
            <span class="material-symbols-outlined card-icon">list</span>
            All Subjects
            <span class="count-badge">{{ subjects().length }}</span>
          </mat-card-title>
          <mat-card-content>
            <div class="table-actions">
              <button class="reload-btn" (click)="reload()" matTooltip="Refresh">
                <span class="material-symbols-outlined">refresh</span>
                Refresh
              </button>
            </div>
            <div class="table-wrap">
              <table mat-table [dataSource]="subjects()" class="table">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Subject Name</th>
                  <td mat-cell *matCellDef="let s">
                    <div class="subject-cell">
                      <div class="subject-icon">
                        <span class="material-symbols-outlined">auto_stories</span>
                      </div>
                      <span class="subject-name">{{ s.name }}</span>
                    </div>
                  </td>
                </ng-container>
                <ng-container matColumnDef="desc">
                  <th mat-header-cell *matHeaderCellDef>Description</th>
                  <td mat-cell *matCellDef="let s">
                    <span class="desc-text">{{ s.description || '—' }}</span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let s">
                    <button class="action-btn delete" (click)="remove(s)" matTooltip="Delete subject">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="cols"></tr>
                <tr mat-row *matRowDef="let row; columns: cols"></tr>
              </table>
              @if (subjects().length === 0) {
                <div class="empty-state">
                  <span class="material-symbols-outlined">menu_book</span>
                  <p>No subjects yet. Create your first subject above.</p>
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
      background: rgba(30,58,138,0.1);
      color: #1E3A8A;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 10px;
      border-radius: 9999px;
    }

    .form-card mat-card-content { padding-top: 16px; }
    .form {
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
    .create-btn:hover:not([disabled]) {
      box-shadow: 0 6px 20px rgba(30,58,138,0.35);
      transform: translateY(-1px);
    }
    .create-btn[disabled] { opacity: 0.5; cursor: not-allowed; }
    .create-btn .material-symbols-outlined { font-size: 18px; }

    .table-actions { display: flex; justify-content: flex-end; margin-bottom: 12px; }
    .reload-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 16px; border: 1px solid #E2E8F0;
      border-radius: 8px; background: #fff; color: #64748B;
      font-size: 0.8rem; font-weight: 500; font-family: 'Poppins', sans-serif;
      cursor: pointer; transition: all 0.2s;
    }
    .reload-btn:hover { border-color: #1E3A8A; color: #1E3A8A; background: #F0F4FF; }
    .reload-btn .material-symbols-outlined { font-size: 18px; }

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
    .desc-text { color: #64748B; font-size: 0.875rem; }

    .action-btn {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border: none; border-radius: 6px;
      cursor: pointer; transition: all 0.2s;
    }
    .action-btn .material-symbols-outlined { font-size: 16px; }
    .action-btn.delete { background: rgba(239,68,68,0.08); color: #EF4444; }
    .action-btn.delete:hover { background: rgba(239,68,68,0.15); }

    .empty-state {
      text-align: center; padding: 40px;
      color: #94A3B8;
    }
    .empty-state .material-symbols-outlined { font-size: 48px; display: block; margin-bottom: 8px; }
    .empty-state p { margin: 0; font-size: 0.875rem; }

    @media (max-width: 900px) {
      .form { grid-template-columns: 1fr; }
    }
  `],
})
export class AdminSubjectsComponent {
  private readonly api = inject(AdminApiService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly subjects = signal<Subject[]>([]);
  readonly cols = ['name', 'desc', 'actions'];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
  });

  constructor() {
    this.reload();
  }

  reload() {
    this.api.listSubjects().subscribe({
      next: (res) => this.subjects.set(res.subjects ?? []),
      error: (e: any) => this.snackBar.open(e?.error?.message ?? 'Failed to load subjects', 'Close', { duration: 3000 }),
    });
  }

  create() {
    const v = this.form.getRawValue();
    this.api.createSubject(v).subscribe({
      next: () => {
        this.snackBar.open('Subject created', 'Close', { duration: 2500 });
        this.form.setValue({ name: '', description: '' });
        this.reload();
      },
      error: (e: any) => this.snackBar.open(e?.error?.message ?? 'Create failed', 'Close', { duration: 3000 }),
    });
  }

  remove(s: Subject) {
    if (!confirm(`Delete subject "${s.name}"?`)) return;
    this.api.deleteSubject(s._id).subscribe({
      next: () => {
        this.snackBar.open('Subject deleted', 'Close', { duration: 2000 });
        this.reload();
      },
      error: (e: any) => this.snackBar.open(e?.error?.message ?? 'Delete failed', 'Close', { duration: 3000 }),
    });
  }
}
