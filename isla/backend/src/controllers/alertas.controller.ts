import { ah } from '../utils/asincrono';
import * as modelo from '../models/alertas.model';

export const listar = ah(async (req, res) => {
  res.json(await modelo.listar(res.locals.query, req.usuario!));
});

export const obtener = ah(async (req, res) => {
  res.json(await modelo.obtener(res.locals.params.id, req.usuario!));
});

export const crear = ah(async (req, res) => {
  res.status(201).json(await modelo.crear(res.locals.body, req.usuario!));
});

export const actualizar = ah(async (req, res) => {
  res.json(await modelo.actualizar(res.locals.params.id, res.locals.body, req.usuario!));
});

export const eliminar = ah(async (req, res) => {
  await modelo.eliminar(res.locals.params.id, req.usuario!);
  res.status(204).send();
});
