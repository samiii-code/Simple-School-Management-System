import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import type { RoleName } from '../app-config';
import { AuthService } from '../services/auth.service';

export function roleGuard(allowed: RoleName[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);
    const role = auth.role();
    if (role && allowed.includes(role)) return true;
    return router.createUrlTree(['/unauthorized']);
  };
}

