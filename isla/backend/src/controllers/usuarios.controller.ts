import { ah } from '../utils/asincrono';
import * as modelo from '../models/usuarios.model';

export const obtenerPerfil = ah(async (req, res) => {
  res.json(await modelo.obtenerPerfil(req.usuario!.id));
});

export const actualizarPerfil = ah(async (req, res) => {
  res.json(await modelo.actualizarPerfil(req.usuario!.id, res.locals.body));
});

export const listar = ah(async (_req, res) => {
  res.json(await modelo.listar(res.locals.query));
});

export const cambiar = ah(async (req, res) => {
  res.json(await modelo.cambiar(res.locals.params.id, res.locals.body, req.usuario!.id));
});
