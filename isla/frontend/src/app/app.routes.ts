import { Routes } from '@angular/router';
import { invitadoGuard, rolGuard, sesionGuard } from './core/guards';
import { ShellComponent } from './shared/shell';

const personal = ['administrador', 'trabajador_social'];

export const routes: Routes = [
  { path: 'login', canActivate: [invitadoGuard], loadComponent: () => import('./pages/login.page').then((m) => m.LoginPage) },
  { path: 'registro', canActivate: [invitadoGuard], loadComponent: () => import('./pages/registro.page').then((m) => m.RegistroPage) },
  {
    path: '',
    component: ShellComponent,
    canActivate: [sesionGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'panel' },
      { path: 'panel', loadComponent: () => import('./pages/dashboard.page').then((m) => m.DashboardPage) },
      { path: 'alertas', loadComponent: () => import('./pages/alertas.page').then((m) => m.AlertasPage) },
      {
        path: 'hogares',
        canActivate: [rolGuard],
        data: { roles: personal },
        loadComponent: () => import('./pages/hogares.page').then((m) => m.HogaresPage)
      },
      {
        path: 'ninos',
        canActivate: [rolGuard],
        data: { roles: personal },
        loadComponent: () => import('./pages/ninos.page').then((m) => m.NinosPage)
      },
      {
        path: 'asignaciones',
        canActivate: [rolGuard],
        data: { roles: personal },
        loadComponent: () => import('./pages/asignaciones.page').then((m) => m.AsignacionesPage)
      },
      {
        path: 'usuarios',
        canActivate: [rolGuard],
        data: { roles: ['administrador'] },
        loadComponent: () => import('./pages/usuarios.page').then((m) => m.UsuariosPage)
      },
      { path: 'perfil', loadComponent: () => import('./pages/perfil.page').then((m) => m.PerfilPage) }
    ]
  },
  { path: '**', loadComponent: () => import('./pages/no-encontrado.page').then((m) => m.NoEncontradoPage) }
];
