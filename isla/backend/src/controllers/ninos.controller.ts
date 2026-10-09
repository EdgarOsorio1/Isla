import { ah } from '../utils/asincrono';
import * as modelo from '../models/ninos.model';

export const disponibles = ah(async (_req, res) => {
  res.json(await modelo.disponibles());
});

export const listar = ah(async (_req, res) => {
  res.json(await modelo.listar(res.locals.query));
});

export const obtener = ah(async (_req, res) => {
  res.json(await modelo.obtener(res.locals.params.id));
});

export const crear = ah(async (req, res) => {
  res.status(201).json(await modelo.crear(res.locals.body, req.usuario!.id));
});

export const actualizar = ah(async (_req, res) => {
  res.json(await modelo.actualizar(res.locals.params.id, res.locals.body));
});

export const eliminar = ah(async (_req, res) => {
  await modelo.eliminar(res.locals.params.id);
  res.status(204).send();
});
