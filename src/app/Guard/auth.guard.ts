import { CanActivateFn, Router } from '@angular/router';
import { SupaService } from '../service/supa.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(SupaService);
  const router = inject(Router);


  if (authService.getSession()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
