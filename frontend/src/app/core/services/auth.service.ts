import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { APP_CONFIG, type RoleName } from '../app-config';
import type { LoginResponse } from '../models';

type AuthState =
  | { status: 'anonymous' }
  | { status: 'authenticated'; token: string; user: LoginResponse['user'] };

const STORAGE_KEY = 'mean_school_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly config = inject(APP_CONFIG);

  private readonly _state = signal<AuthState>(this.loadFromStorage());
  readonly state = computed(() => this._state());
  readonly isLoggedIn = computed(() => this._state().status === 'authenticated');
  readonly user = computed(() => {
    const st = this._state();
    return st.status === 'authenticated' ? st.user : null;
  });
  readonly role = computed<RoleName | null>(() => this.user()?.role ?? null);
  readonly token = computed(() => {
    const st = this._state();
    return st.status === 'authenticated' ? st.token : null;
  });

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>(`${this.config.apiBaseUrl}/api/auth/login`, { email, password })
      .subscribe({
        next: (res) => {
          this._state.set({ status: 'authenticated', token: res.token, user: res.user });
          this.saveToStorage();
          void this.router.navigateByUrl(this.defaultRouteForRole(res.user.role));
        },
        error: (err: unknown) => {
          const httpError = err as any;
          let message = 'Login failed';
          
          if (httpError?.status === 0) {
            message = 'Cannot connect to backend. Make sure the backend is running on http://localhost:4000';
          } else if (httpError?.error?.message) {
            message = httpError.error.message;
          } else if (httpError?.message) {
            message = httpError.message;
          }
          
          // eslint-disable-next-line no-console
          console.error('Login error:', err);
          this.snackBar.open(message, 'Close', { duration: 5000 });
        },
      });
  }

  logout() {
    this._state.set({ status: 'anonymous' });
    localStorage.removeItem(STORAGE_KEY);
    void this.router.navigateByUrl('/login');
  }

  defaultRouteForRole(role: RoleName) {
    if (role === 'Admin') return '/admin/users';
    if (role === 'Teacher') return '/teacher/grades';
    return '/student/marks';
  }

  private saveToStorage() {
    const st = this._state();
    if (st.status !== 'authenticated') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(st));
  }

  private loadFromStorage(): AuthState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { status: 'anonymous' };
      const parsed = JSON.parse(raw) as AuthState;
      if (parsed?.status === 'authenticated' && parsed.token && parsed.user) return parsed;
      return { status: 'anonymous' };
    } catch {
      return { status: 'anonymous' };
    }
  }
}

