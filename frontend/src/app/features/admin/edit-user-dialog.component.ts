import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import type { UserSummary } from '../../core/models';

export interface EditUserDialogData {
  user: UserSummary;
  isStudent: boolean;
}

@Component({
  standalone: true,
  selector: 'app-edit-user-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <div class="dialog-header">
      <div class="dialog-icon">
        <span class="material-symbols-outlined">edit</span>
      </div>
      <div>
        <h2 class="dialog-title">Edit User</h2>
        <p class="dialog-subtitle">{{ data.user.email }}</p>
      </div>
    </div>

    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Full Name</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Email Address</mat-label>
          <input matInput type="email" formControlName="email" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>New Password</mat-label>
          <input matInput type="password" formControlName="password" placeholder="Leave blank to keep current" />
        </mat-form-field>
        @if (data.isStudent) {
          <mat-form-field appearance="outline" class="full">
            <mat-label>Section</mat-label>
            <input matInput formControlName="section" placeholder="e.g. Section A" />
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button class="cancel-btn" mat-dialog-close>Cancel</button>
      <button class="save-btn" [disabled]="form.invalid" (click)="submit()">
        <span class="material-symbols-outlined">save</span>
        Save Changes
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 24px 24px 0;
    }
    .dialog-icon {
      width: 44px; height: 44px;
      border-radius: 10px;
      background: linear-gradient(135deg, #1E3A8A, #2563EB);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .dialog-icon .material-symbols-outlined { font-size: 22px; color: #fff; }
    .dialog-title {
      margin: 0 0 2px;
      font-size: 1.1rem;
      font-weight: 700;
      color: #1E3A8A;
      font-family: 'Poppins', sans-serif;
    }
    .dialog-subtitle {
      margin: 0;
      font-size: 0.8rem;
      color: #64748B;
      font-family: 'Poppins', sans-serif;
    }

    .form {
      display: flex;
      flex-direction: column;
      min-width: 360px;
      padding-top: 16px;
      gap: 4px;
    }
    .full { width: 100%; }

    .dialog-actions { padding: 8px 24px 20px !important; gap: 10px; }
    .cancel-btn {
      padding: 10px 20px;
      border: 1px solid #E2E8F0; border-radius: 8px;
      background: #fff; color: #64748B;
      font-size: 0.875rem; font-weight: 500; font-family: 'Poppins', sans-serif;
      cursor: pointer; transition: all 0.2s;
    }
    .cancel-btn:hover { border-color: #94A3B8; color: #374151; }
    .save-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 10px 20px;
      background: linear-gradient(135deg, #1E3A8A, #2563EB);
      color: #fff; border: none; border-radius: 8px;
      font-size: 0.875rem; font-weight: 600; font-family: 'Poppins', sans-serif;
      cursor: pointer; transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(30,58,138,0.25);
    }
    .save-btn:hover:not([disabled]) { box-shadow: 0 6px 20px rgba(30,58,138,0.35); transform: translateY(-1px); }
    .save-btn[disabled] { opacity: 0.5; cursor: not-allowed; }
    .save-btn .material-symbols-outlined { font-size: 18px; }
  `],
})
export class EditUserDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<EditUserDialogComponent>);
  readonly data: EditUserDialogData = inject(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    name: [this.data.user.name, [Validators.required, Validators.minLength(2)]],
    email: [this.data.user.email, [Validators.required, Validators.email]],
    password: [''],
    section: [this.data.user.section ?? ''],
  });

  submit() {
    const v = this.form.getRawValue();
    const payload: { name: string; email: string; password?: string; section?: string } = {
      name: v.name,
      email: v.email,
    };
    if (v.password && v.password.length >= 6) payload.password = v.password;
    if (this.data.isStudent && v.section !== undefined) payload.section = v.section;
    this.dialogRef.close(payload);
  }
}
