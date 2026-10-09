import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/errors';

export function noEncontrado(_req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, 'la ruta solicitada no existe'));
}

export function manejadorErrores(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message, detalles: err.detalles });
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'el cuerpo de la petición no es un json válido' });
  if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'la petición es demasiado grande' });
  if (err?.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'ya existe un registro con esos datos' });
  if (err?.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ error: 'no se puede eliminar porque tiene registros relacionados' });
  console.error(err);
  res.status(500).json({ error: 'ocurrió un error interno en el servidor' });
}
