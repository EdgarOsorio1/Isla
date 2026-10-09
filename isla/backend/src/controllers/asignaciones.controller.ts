import { ah } from '../utils/asincrono';
import * as modelo from '../models/asignaciones.model';

export const listar = ah(async (_req, res) => {
  res.json(await modelo.listar(res.locals.query));
});

export const obtener = ah(async (_req, res) => {
  res.json(await modelo.obtener(res.locals.params.id));
});

export const crear = ah(async (req, res) => {
  res.status(201).json(await modelo.crear(res.locals.body, req.usuario!.id));
});

export const resolver = ah(async (req, res) => {
  const { accion, respuesta } = res.locals.body;
  res.json(await modelo.resolver(res.locals.params.id, accion, respuesta, req.usuario!.id));
});

export const completar = ah(async (_req, res) => {
  res.json(await modelo.completar(res.locals.params.id));
});
