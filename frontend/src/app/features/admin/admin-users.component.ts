import { Component, effect, inject, signal, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminApiService } from '../../core/services/admin-api.service';
import { EditUserDialogComponent } from './edit-user-dialog.component';
import type { UserSummary } from '../../core/models';

@Component({
  standalone: true,
  selector: 'app-admin-users',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
  ],
  template: `
    <div class="page-enter">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-icon">
          <span class="material-symbols-outlined">group</span>
        </div>
        <div>
          <h1>User Management</h1>
          <p>Create and manage teachers and students</p>
        </div>
      </div>

      <div class="grid">
        <!-- Create User Card -->
        <mat-card class="form-card">
          <mat-card-title>
            <span class="material-symbols-outlined card-icon">person_add</span>
            Create New User
          </mat-card-title>
          <mat-card-content>
            <form class="form" [formGroup]="form" (ngSubmit)="create()">
              <mat-form-field appearance="outline">
                <mat-label>Role</mat-label>
                <mat-select formControlName="role">
                  <mat-option value="Teacher">Teacher</mat-option>
                  <mat-option value="Student">Student</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="name" placeholder="John Doe" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email Address</mat-label>
                <input matInput type="email" formControlName="email" placeholder="john@school.com" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Password</mat-label>
                <input matInput type="password" formControlName="password" placeholder="Min. 6 characters" />
              </mat-form-field>

              @if (form.get('role')?.value === 'Student') {
                <mat-form-field appearance="outline">
                  <mat-label>Section</mat-label>
                  <input matInput formControlName="section" placeholder="e.g. Section A" />
                </mat-form-field>
              }

              <button type="submit" class="create-btn" [disabled]="form.invalid">
                <span class="material-symbols-outlined">add_circle</span>
                Create User
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Users Table Card -->
        <mat-card>
          <mat-card-title>
            <span class="material-symbols-outlined card-icon">manage_accounts</span>
            All Users
          </mat-card-title>
          <mat-card-content>
            <!-- Filters -->
            <div class="filters">
              <mat-form-field appearance="outline" class="filter-role">
                <mat-label>Filter by Role</mat-label>
                <mat-select [value]="roleFilter()" (selectionChange)="roleFilter.set($event.value)">
                  <mat-option [value]="null">All Roles</mat-option>
                  <mat-option value="Teacher">Teacher</mat-option>
                  <mat-option value="Student">Student</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-search">
                <mat-label>Search</mat-label>
                <span matPrefix class="material-symbols-outlined search-icon">search</span>
                <input matInput (input)="applyFilter($event)" placeholder="Name or email" #searchInput />
              </mat-form-field>

              <button class="reload-btn" (click)="reload()" matTooltip="Refresh">
                <span class="material-symbols-outlined">refresh</span>
              </button>
            </div>

            <!-- Table -->
            <div class="table-wrap">
              <table mat-table [dataSource]="dataSource" class="table">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let u">
                    <div class="user-cell">
                      <div class="avatar">{{ u.name.charAt(0).toUpperCase() }}</div>
                      <span>{{ u.name }}</span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef>Email</th>
                  <td mat-cell *matCellDef="let u">{{ u.email }}</td>
                </ng-container>

                <ng-container matColumnDef="section" *ngIf="roleFilter() === 'Student'">
                  <th mat-header-cell *matHeaderCellDef>Section</th>
                  <td mat-cell *matCellDef="let u">
                    @if (u.section) {
                      <span class="badge badge-purple">{{ u.section }}</span>
                    } @else {
                      <span class="text-muted">—</span>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let u">
                    <div class="action-btns">
                      <button class="action-btn edit" (click)="edit(u)" matTooltip="Edit user">
                        <span class="material-symbols-outlined">edit</span>
                      </button>
                      <button class="action-btn delete" (click)="remove(u)" matTooltip="Delete user">
                        <span class="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>

                <tr class="mat-row" *matNoDataRow>
                  <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
                    <span class="material-symbols-outlined">search_off</span>
                    No users match the filter
                  </td>
                </tr>
              </table>
            </div>
            <mat-paginator [pageSizeOptions]="[5, 10, 25]" showFirstLastButtons></mat-paginator>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .grid { display: grid; gap: 20px; }

    /* Card title with icon */
    mat-card-title {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    }
    .card-icon { font-size: 20px; color: #1E3A8A; }

    /* Create form */
    .form-card mat-card-content { padding-top: 16px; }
    .form {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
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
      height: 56px;
    }
    .create-btn:hover:not([disabled]) {
      box-shadow: 0 6px 20px rgba(30,58,138,0.35);
      transform: translateY(-1px);
    }
    .create-btn[disabled] { opacity: 0.5; cursor: not-allowed; }
    .create-btn .material-symbols-outlined { font-size: 20px; }

    /* Filters */
    .filters {
      display: flex; gap: 12px; align-items: center;
      margin-bottom: 16px; flex-wrap: wrap;
    }
    .filter-role { min-width: 160px; }
    .filter-search { flex: 1; min-width: 200px; }
    .search-icon { font-size: 18px; color: #94A3B8; margin-right: 4px; }
    .reload-btn {
      display: flex; align-items: center; justify-content: center;
      width: 44px; height: 44px; border: 1px solid #E2E8F0;
      border-radius: 8px; background: #fff; color: #64748B;
      cursor: pointer; transition: all 0.2s; flex-shrink: 0;
    }
    .reload-btn:hover { border-color: #1E3A8A; color: #1E3A8A; background: #F0F4FF; }
    .reload-btn .material-symbols-outlined { font-size: 20px; }

    /* Table */
    .table-wrap { overflow-x: auto; border-radius: 10px; overflow: hidden; }
    .table { width: 100%; }

    .user-cell { display: flex; align-items: center; gap: 10px; }
    .avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg, #1E3A8A, #3B5FBF);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; font-weight: 600; flex-shrink: 0;
    }

    .action-btns { display: flex; gap: 6px; }
    .action-btn {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border: none; border-radius: 6px;
      cursor: pointer; transition: all 0.2s;
    }
    .action-btn .material-symbols-outlined { font-size: 16px; }
    .action-btn.edit { background: rgba(30,58,138,0.08); color: #1E3A8A; }
    .action-btn.edit:hover { background: rgba(30,58,138,0.15); }
    .action-btn.delete { background: rgba(239,68,68,0.08); color: #EF4444; }
    .action-btn.delete:hover { background: rgba(239,68,68,0.15); }

    .no-data {
      text-align: center; padding: 40px !important;
      color: #94A3B8; font-size: 0.875rem;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .no-data .material-symbols-outlined { font-size: 24px; }
    .text-muted { color: #94A3B8; }

    @media (max-width: 900px) {
      .form { grid-template-columns: 1fr; }
      .filters { flex-direction: column; align-items: stretch; }
      .reload-btn { width: 100%; height: 44px; }
    }
  `],
})
export class AdminUsersComponent implements AfterViewInit {
  private readonly api = inject(AdminApiService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly roleFilter = signal<'Teacher' | 'Student' | null>('Teacher');
  readonly users = signal<UserSummary[]>([]);
  readonly dataSource = new MatTableDataSource<UserSummary>([]);

  get displayedColumns(): string[] {
    return this.roleFilter() === 'Student' ? ['name', 'email', 'section', 'actions'] : ['name', 'email', 'actions'];
  }

  readonly form = this.fb.nonNullable.group({
    role: this.fb.nonNullable.control<'Teacher' | 'Student'>('Teacher', { validators: [Validators.required] }),
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    section: [''],
  });

  constructor() {
    this.dataSource.filterPredicate = (u: UserSummary, filter: string): boolean => {
      const f = filter.toLowerCase();
      return u.name.toLowerCase().includes(f) || !!(u.email && u.email.toLowerCase().includes(f));
    };
    effect(() => {
      void this.loadUsers(this.roleFilter());
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(e: Event) {
    const value = (e.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = value;
  }

  reload() {
    void this.loadUsers(this.roleFilter());
  }

  private loadUsers(role: 'Teacher' | 'Student' | null) {
    this.api.listUsers(role ?? undefined).subscribe({
      next: (res) => {
        const list = res.users ?? [];
        this.users.set(list);
        this.dataSource.data = list;
      },
      error: (e: any) => this.snackBar.open(e?.error?.message ?? 'Failed to load users', 'Close', { duration: 3000 }),
    });
  }

  create() {
    const v = this.form.getRawValue();
    const payload: Parameters<AdminApiService['createUser']>[0] = {
      name: v.name,
      email: v.email,
      password: v.password,
      role: v.role,
    };
    if (v.role === 'Student' && v.section) payload.section = v.section;
    this.api.createUser(payload).subscribe({
      next: () => {
        this.snackBar.open('User created successfully', 'Close', { duration: 2500 });
        this.form.controls.name.setValue('');
        this.form.controls.email.setValue('');
        this.form.controls.password.setValue('');
        this.form.controls.section.setValue('');
        this.loadUsers(this.roleFilter());
      },
      error: (e: any) => this.snackBar.open(e?.error?.message ?? 'Create failed', 'Close', { duration: 3000 }),
    });
  }

  edit(u: UserSummary) {
    const isStudent = this.roleFilter() === 'Student';
    const ref = this.dialog.open(EditUserDialogComponent, {
      data: { user: u, isStudent },
      width: '440px',
    });
    ref.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.api.updateUser(u._id, payload).subscribe({
        next: () => {
          this.snackBar.open('User updated', 'Close', { duration: 2500 });
          this.loadUsers(this.roleFilter());
        },
        error: (e: any) => this.snackBar.open(e?.error?.message ?? 'Update failed', 'Close', { duration: 3000 }),
      });
    });
  }

  remove(u: UserSummary) {
    if (!confirm(`Delete ${u.email}?`)) return;
    this.api.deleteUser(u._id).subscribe({
      next: () => {
        this.snackBar.open('User deleted', 'Close', { duration: 2000 });
        this.loadUsers(this.roleFilter());
      },
      error: (e: any) => this.snackBar.open(e?.error?.message ?? 'Delete failed', 'Close', { duration: 3000 }),
    });
  }
}
