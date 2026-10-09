import { Router } from 'express';
import alertas from './alertas/alertas.routes';
import asignaciones from './asignaciones/asignaciones.routes';
import auth from './auth/auth.routes';
import dashboard from './dashboard/dashboard.routes';
import hogares from './hogares/hogares.routes';
import ninos from './ninos/ninos.routes';
import usuarios from './usuarios/usuarios.routes';

export const rutas = Router();

rutas.use('/auth', auth);
rutas.use('/usuarios', usuarios);
rutas.use('/hogares', hogares);
rutas.use('/ninos', ninos);
rutas.use('/alertas', alertas);
rutas.use('/asignaciones', asignaciones);
rutas.use('/dashboard', dashboard);
