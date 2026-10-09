import { Router } from 'express';
import alertas from './alertas.routes';
import asignaciones from './asignaciones.routes';
import auth from './auth.routes';
import dashboard from './dashboard.routes';
import hogares from './hogares.routes';
import ninos from './ninos.routes';
import usuarios from './usuarios.routes';

export const rutas = Router();

rutas.use('/auth', auth);
rutas.use('/usuarios', usuarios);
rutas.use('/hogares', hogares);
rutas.use('/ninos', ninos);
rutas.use('/alertas', alertas);
rutas.use('/asignaciones', asignaciones);
rutas.use('/dashboard', dashboard);
