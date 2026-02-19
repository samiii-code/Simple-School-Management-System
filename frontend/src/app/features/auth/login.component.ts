import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <div class="page">
      <!-- Background decoration -->
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>

      <div class="card">
        <!-- Logo -->
        <div class="logo-wrap">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="14" fill="#F59E0B"/>
            <path d="M24 9L39 16.5V25.5C39 33.75 32.25 41.25 24 43.5C15.75 41.25 9 33.75 9 25.5V16.5L24 9Z" fill="white" opacity="0.9"/>
            <path d="M19.5 24L23.25 27.75L30 20.25" stroke="#1E3A8A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <h1 class="title">Ks Academy</h1>
        <p class="subtitle">Sign in to your portal</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">
          <div class="field-wrap">
            <label class="field-label">Email Address</label>
            <mat-form-field appearance="outline" class="full">
              <input matInput formControlName="email" type="email" autocomplete="email" placeholder="you@school.com" />
            </mat-form-field>
          </div>

          <div class="field-wrap">
            <label class="field-label">Password</label>
            <mat-form-field appearance="outline" class="full">
              <input matInput formControlName="password" [type]="showPassword() ? 'text' : 'password'" autocomplete="current-password" placeholder="••••••••" />
              <button matSuffix type="button" class="eye-btn" (click)="showPassword.set(!showPassword())">
                <span class="material-symbols-outlined">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </mat-form-field>
          </div>

          <button type="submit" class="submit-btn" [disabled]="form.invalid">
            <span class="material-symbols-outlined">login</span>
            Sign In
          </button>
        </form>

        <!-- Credentials hint -->
        <div class="hint-box">
          <div class="hint-title">
            <span class="material-symbols-outlined">info</span>
            Demo Credentials
          </div>
          <div class="hint-row">
            <span class="hint-role admin">Admin</span>
            <span class="hint-cred">admin@school.com / Admin123!</span>
          </div>
          <div class="hint-row">
            <span class="hint-role teacher">Teacher</span>
            <span class="hint-cred">teacher@school.com / Teacher123!</span>
          </div>
          <div class="hint-row">
            <span class="hint-role student">Student</span>
            <span class="hint-cred">student@school.com / Student123!</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: linear-gradient(135deg, #0F2461 0%, #1E3A8A 40%, #1D4ED8 70%, #2563EB 100%);
      position: relative;
      overflow: hidden;
    }

    /* Background decorations */
    .bg-circle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.08;
      background: #ffffff;
    }
    .bg-circle-1 { width: 500px; height: 500px; top: -200px; right: -150px; }
    .bg-circle-2 { width: 300px; height: 300px; bottom: -100px; left: -80px; }
    .bg-circle-3 { width: 200px; height: 200px; top: 50%; left: 20%; opacity: 0.05; }

    /* Card */
    .card {
      width: min(440px, 100%);
      background: rgba(255, 255, 255, 0.97);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.25);
      position: relative;
      z-index: 1;
      animation: fadeInUp 0.4s ease both;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Logo */
    .logo-wrap {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }

    .title {
      margin: 0 0 6px;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1E3A8A;
      text-align: center;
      letter-spacing: -0.02em;
      font-family: 'Poppins', sans-serif;
    }

    .subtitle {
      margin: 0 0 28px;
      font-size: 0.875rem;
      color: #64748B;
      text-align: center;
      font-family: 'Poppins', sans-serif;
    }

    /* Form */
    .form { display: flex; flex-direction: column; gap: 4px; }

    .field-wrap { display: flex; flex-direction: column; gap: 4px; }
    .field-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #374151;
      font-family: 'Poppins', sans-serif;
      padding-left: 2px;
    }
    .full { width: 100%; }

    .eye-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #94A3B8;
      padding: 0;
      display: flex;
      align-items: center;
      transition: color 0.2s;
    }
    .eye-btn:hover { color: #1E3A8A; }
    .eye-btn .material-symbols-outlined { font-size: 20px; }

    .submit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 8px;
      padding: 14px 24px;
      background: linear-gradient(135deg, #1E3A8A, #2563EB);
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      font-family: 'Poppins', sans-serif;
      cursor: pointer;
      transition: all 0.25s;
      box-shadow: 0 4px 16px rgba(30, 58, 138, 0.35);
    }
    .submit-btn:hover:not([disabled]) {
      background: linear-gradient(135deg, #152C6B, #1D4ED8);
      box-shadow: 0 6px 24px rgba(30, 58, 138, 0.45);
      transform: translateY(-1px);
    }
    .submit-btn:active:not([disabled]) { transform: translateY(0); }
    .submit-btn[disabled] { opacity: 0.5; cursor: not-allowed; }
    .submit-btn .material-symbols-outlined { font-size: 20px; }

    /* Hint box */
    .hint-box {
      margin-top: 24px;
      padding: 16px;
      background: #F8FAFF;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
    }
    .hint-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748B;
      font-family: 'Poppins', sans-serif;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .hint-title .material-symbols-outlined { font-size: 16px; color: #3B82F6; }
    .hint-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
      font-family: 'Poppins', sans-serif;
    }
    .hint-row:last-child { margin-bottom: 0; }
    .hint-role {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 9999px;
      min-width: 58px;
      text-align: center;
    }
    .hint-role.admin   { background: rgba(30,58,138,0.1);  color: #1E3A8A; }
    .hint-role.teacher { background: rgba(16,185,129,0.1); color: #059669; }
    .hint-role.student { background: rgba(245,158,11,0.1); color: #D97706; }
    .hint-cred { font-size: 0.75rem; color: #475569; font-family: monospace; }
  `],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit() {
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password);
  }
}
