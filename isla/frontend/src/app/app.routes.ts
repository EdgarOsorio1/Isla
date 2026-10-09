import { Routes } from '@angular/router';
import { invitadoGuard, rolGuard, sesionGuard } from './core/guards';
import { ShellComponent } from './shared/shell/shell.component';

const personal = ['administrador', 'trabajador_social'];

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'registro',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/registro/registro.component').then((m) => m.RegistroComponent)
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [sesionGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'panel' },
      { path: 'panel', loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'alertas', loadComponent: () => import('./pages/alertas/alertas.component').then((m) => m.AlertasComponent) },
      {
        path: 'hogares',
        canActivate: [rolGuard],
        data: { roles: personal },
        loadComponent: () => import('./pages/hogares/hogares.component').then((m) => m.HogaresComponent)
      },
      {
        path: 'ninos',
        canActivate: [rolGuard],
        data: { roles: personal },
        loadComponent: () => import('./pages/ninos/ninos.component').then((m) => m.NinosComponent)
      },
      {
        path: 'asignaciones',
        canActivate: [rolGuard],
        data: { roles: personal },
        loadComponent: () => import('./pages/asignaciones/asignaciones.component').then((m) => m.AsignacionesComponent)
      },
      {
        path: 'usuarios',
        canActivate: [rolGuard],
        data: { roles: ['administrador'] },
        loadComponent: () => import('./pages/usuarios/usuarios.component').then((m) => m.UsuariosComponent)
      },
      { path: 'perfil', loadComponent: () => import('./pages/perfil/perfil.component').then((m) => m.PerfilComponent) }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./pages/no-encontrado/no-encontrado.component').then((m) => m.NoEncontradoComponent)
  }
];