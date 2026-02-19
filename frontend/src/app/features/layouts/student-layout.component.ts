import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-student-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `
    <div class="shell">
      <aside class="sidebar" [class.collapsed]="collapsed()">
        <div class="brand">
          <div class="brand-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="#F59E0B"/>
              <path d="M16 6L26 11V17C26 22.5 21.5 27.5 16 29C10.5 27.5 6 22.5 6 17V11L16 6Z" fill="white" opacity="0.9"/>
              <path d="M13 16L15.5 18.5L20 13" stroke="#1E3A8A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          @if (!collapsed()) {
            <div class="brand-text">
              <span class="brand-name">Ks</span>
              <span class="brand-sub">Academy</span>
            </div>
          }
        </div>

        <nav class="nav">
          <div class="nav-section-label" [class.hidden]="collapsed()">STUDENT</div>

          <a class="nav-item" routerLink="/student/marks" routerLinkActive="active"
             [matTooltip]="collapsed() ? 'My Marks' : ''" matTooltipPosition="right">
            <span class="material-symbols-outlined nav-icon">bar_chart</span>
            @if (!collapsed()) { <span class="nav-label">My Marks</span> }
          </a>
        </nav>

        <button class="collapse-btn" (click)="collapsed.set(!collapsed())"
                [matTooltip]="collapsed() ? 'Expand' : 'Collapse'" matTooltipPosition="right">
          <span class="material-symbols-outlined">{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</span>
        </button>
      </aside>

      <div class="main">
        <header class="topbar">
          <div class="topbar-left">
            <span class="topbar-title">Student Portal</span>
          </div>
          <div class="topbar-right">
            <div class="user-chip">
              <span class="material-symbols-outlined user-icon">person</span>
              <span class="user-email">{{ who() }}</span>
            </div>
            <button class="logout-btn" (click)="logout()">
              <span class="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main class="content page-enter">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; overflow: hidden; }
    .shell { display: flex; height: 100vh; overflow: hidden; }

    .sidebar {
      width: 240px; min-width: 240px;
      background: #0F2461;
      display: flex; flex-direction: column;
      transition: width 0.3s ease, min-width 0.3s ease;
      overflow: hidden; position: relative; z-index: 10;
    }
    .sidebar.collapsed { width: 68px; min-width: 68px; }

    .brand {
      display: flex; align-items: center; gap: 12px;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      min-height: 72px;
    }
    .brand-logo { flex-shrink: 0; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; }
    .brand-text { display: flex; flex-direction: column; overflow: hidden; }
    .brand-name { font-size: 0.9rem; font-weight: 700; color: #ffffff; white-space: nowrap; letter-spacing: -0.01em; }
    .brand-sub { font-size: 0.7rem; color: rgba(245,158,11,0.9); font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; }

    .nav { flex: 1; padding: 16px 8px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; overflow-x: hidden; }
    .nav-section-label {
      font-size: 0.65rem; font-weight: 700; color: rgba(255,255,255,0.35);
      letter-spacing: 0.1em; text-transform: uppercase;
      padding: 0 8px; margin-bottom: 8px; white-space: nowrap; transition: opacity 0.2s;
    }
    .nav-section-label.hidden { opacity: 0; }

    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px; border-radius: 8px;
      color: rgba(255,255,255,0.65); text-decoration: none;
      font-size: 0.875rem; font-weight: 500;
      transition: background 0.2s, color 0.2s;
      white-space: nowrap; overflow: hidden;
    }
    .nav-item:hover { background: rgba(255,255,255,0.08); color: #ffffff; }
    .nav-item.active { background: rgba(245,158,11,0.18); color: #F59E0B; font-weight: 600; }
    .nav-item.active .nav-icon { color: #F59E0B; }
    .nav-icon { font-size: 20px; flex-shrink: 0; color: rgba(255,255,255,0.5); transition: color 0.2s; }
    .nav-label { white-space: nowrap; }

    .collapse-btn {
      display: flex; align-items: center; justify-content: center;
      margin: 12px 8px; padding: 10px;
      border: none; background: rgba(255,255,255,0.06);
      border-radius: 8px; color: rgba(255,255,255,0.5);
      cursor: pointer; transition: background 0.2s, color 0.2s;
    }
    .collapse-btn:hover { background: rgba(255,255,255,0.12); color: #ffffff; }
    .collapse-btn .material-symbols-outlined { font-size: 20px; }

    .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

    .topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; height: 64px; min-height: 64px;
      background: #ffffff; border-bottom: 1px solid #E2E8F0;
      box-shadow: 0 1px 4px rgba(30,58,138,0.06); z-index: 5;
    }
    .topbar-title { font-size: 1rem; font-weight: 600; color: #1E3A8A; letter-spacing: -0.01em; }
    .topbar-right { display: flex; align-items: center; gap: 12px; }
    .user-chip {
      display: flex; align-items: center; gap: 8px;
      background: #F0F4FF; border: 1px solid #D6E3FF;
      border-radius: 9999px; padding: 6px 14px 6px 10px;
    }
    .user-icon { font-size: 18px; color: #1E3A8A; }
    .user-email { font-size: 0.8rem; font-weight: 500; color: #1E3A8A; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .logout-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 16px; border: 1px solid #E2E8F0;
      border-radius: 8px; background: #ffffff; color: #64748B;
      font-size: 0.875rem; font-weight: 500; font-family: 'Poppins', sans-serif;
      cursor: pointer; transition: all 0.2s;
    }
    .logout-btn:hover { border-color: #EF4444; color: #EF4444; background: #FEF2F2; }
    .logout-btn .material-symbols-outlined { font-size: 18px; }

    .content { flex: 1; overflow-y: auto; padding: 24px; background: #F0F4FF; }

    @media (max-width: 768px) {
      .sidebar { width: 68px; min-width: 68px; }
      .brand-text, .nav-label, .nav-section-label { display: none; }
      .content { padding: 16px; }
      .user-email { display: none; }
    }
  `],
})
export class StudentLayoutComponent {
  private readonly auth = inject(AuthService);
  readonly who = computed(() => this.auth.user()?.email ?? '');
  readonly collapsed = signal(false);

  logout() {
    this.auth.logout();
  }
}
