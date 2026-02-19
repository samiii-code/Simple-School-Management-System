import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-unauthorized',
  imports: [RouterLink],
  template: `
    <div class="page">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>

      <div class="card">
        <div class="icon-wrap">
          <span class="material-symbols-outlined icon">lock</span>
        </div>
        <h1 class="title">Access Denied</h1>
        <p class="desc">You don't have permission to view this page. Please contact your administrator if you believe this is an error.</p>
        <a class="home-btn" routerLink="/">
          <span class="material-symbols-outlined">arrow_back</span>
          Back to Home
        </a>
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
      background: linear-gradient(135deg, #0F2461 0%, #1E3A8A 50%, #2563EB 100%);
      position: relative;
      overflow: hidden;
    }
    .bg-circle { position: absolute; border-radius: 50%; opacity: 0.08; background: #ffffff; }
    .bg-circle-1 { width: 400px; height: 400px; top: -150px; right: -100px; }
    .bg-circle-2 { width: 250px; height: 250px; bottom: -80px; left: -60px; }

    .card {
      width: min(420px, 100%);
      background: rgba(255,255,255,0.97);
      border-radius: 20px;
      padding: 48px 40px;
      box-shadow: 0 24px 64px rgba(0,0,0,0.25);
      text-align: center;
      position: relative;
      z-index: 1;
      animation: fadeInUp 0.4s ease both;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .icon-wrap {
      width: 72px; height: 72px;
      border-radius: 50%;
      background: rgba(239,68,68,0.1);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 20px;
    }
    .icon { font-size: 36px; color: #EF4444; }

    .title {
      margin: 0 0 12px;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1A1A2E;
      font-family: 'Poppins', sans-serif;
      letter-spacing: -0.02em;
    }

    .desc {
      margin: 0 0 28px;
      font-size: 0.875rem;
      color: #64748B;
      line-height: 1.6;
      font-family: 'Poppins', sans-serif;
    }

    .home-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #1E3A8A, #2563EB);
      color: #ffffff;
      border-radius: 10px;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 600;
      font-family: 'Poppins', sans-serif;
      transition: all 0.25s;
      box-shadow: 0 4px 16px rgba(30,58,138,0.3);
    }
    .home-btn:hover {
      box-shadow: 0 6px 24px rgba(30,58,138,0.4);
      transform: translateY(-1px);
    }
    .home-btn .material-symbols-outlined { font-size: 18px; }
  `],
})
export class UnauthorizedComponent { }
