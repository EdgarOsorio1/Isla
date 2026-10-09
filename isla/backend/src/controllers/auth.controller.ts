import { ah } from '../utils/asincrono';
import * as modelo from '../models/auth.model';
import * as usuarios from '../models/usuarios.model';

export const registro = ah(async (_req, res) => {
  res.status(201).json(await modelo.registrar(res.locals.body));
});

export const login = ah(async (_req, res) => {
  res.json(await modelo.iniciarSesion(res.locals.body.email, res.locals.body.clave));
});

export const me = ah(async (req, res) => {
  res.json(await usuarios.obtenerPerfil(req.usuario!.id));
});
