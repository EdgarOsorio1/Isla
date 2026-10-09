import { Router } from 'express';
import { autenticar } from '../../middlewares/auth';
import { validar } from '../../middlewares/validar';
import { ah } from '../../utils/asincrono';
import * as perfil from '../usuarios/usuarios.service';
import { loginSchema, registroSchema } from './auth.schemas';
import * as servicio from './auth.service';

const router = Router();

router.post('/registro', validar(registroSchema), ah(async (_req, res) => {
  res.status(201).json(await servicio.registrar(res.locals.body));
}));

router.post('/login', validar(loginSchema), ah(async (_req, res) => {
  res.json(await servicio.iniciarSesion(res.locals.body.email, res.locals.body.clave));
}));

router.get('/me', autenticar, ah(async (req, res) => {
  res.json(await perfil.obtenerPerfil(req.usuario!.id));
}));

export default router;
