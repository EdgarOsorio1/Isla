import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { HttpError } from '../utils/errors';

export function validar(esquema: ZodType<any>, origen: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const resultado = esquema.safeParse(req[origen]);
    if (!resultado.success) {
      const detalles = resultado.error.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message }));
      return next(new HttpError(400, 'los datos enviados no son válidos', detalles));
    }
    res.locals[origen] = resultado.data;
    next();
  };
}
