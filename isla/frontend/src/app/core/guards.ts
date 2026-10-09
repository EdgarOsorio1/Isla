import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Rol } from './modelos';

export const sesionGuard: CanActivateFn = () => {
  return inject(AuthService).autenticado() ? true : inject(Router).createUrlTree(['/login']);
};

export const invitadoGuard: CanActivateFn = () => {
  return inject(AuthService).autenticado() ? inject(Router).createUrlTree(['/panel']) : true;
};

export const rolGuard: CanActivateFn = (ruta) => {
  const roles = (ruta.data['roles'] ?? []) as Rol[];
  return inject(AuthService).tieneRol(...roles) ? true : inject(Router).createUrlTree(['/panel']);
};
