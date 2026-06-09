import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const perfilGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const perfilUsuario = authService.getPerfil();
  const perfisPermitidos = route.data['perfisPermitidos'] as string[] | undefined;

  if (!perfilUsuario) {
    router.navigate(['/']);
    return false;
  }

  if (!perfisPermitidos || perfisPermitidos.includes(perfilUsuario)) {
    return true;
  }

  if (authService.isAdmin()) {
    router.navigate(['/admin']);
    return false;
  }

  if (authService.isTecnico()) {
    router.navigate(['/tecnico']);
    return false;
  }

  router.navigate(['/usuario']);
  return false;
};
