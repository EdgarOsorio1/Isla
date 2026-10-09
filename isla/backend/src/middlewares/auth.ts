import type { NextFunction, Request, Response } from 'express';
import { consultar } from '../config/db';
import { HttpError } from '../utils/errors';
import { verificar } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      usuario?: { id: number; rol: string };
    }
  }
}

export async function autenticar(req: Request, _res: Response, next: NextFunction) {
  try {
    const cabecera = req.headers.authorization;
    if (!cabecera || !cabecera.startsWith('Bearer ')) throw new HttpError(401, 'debes iniciar sesión');
    let carga;
    try {
      carga = verificar(cabecera.slice(7));
    } catch {
      throw new HttpError(401, 'la sesión no es válida o expiró');
    }
    const filas = await consultar<{ activo: number; rol: string }>(
      'select u.activo, r.nombre as rol from usuarios u join roles r on r.id = u.rol_id where u.id = ?',
      [carga.id]
    );
    if (!filas.length || !filas[0].activo) throw new HttpError(401, 'la cuenta no existe o está inactiva');
    req.usuario = { id: carga.id, rol: filas[0].rol };
    next();
  } catch (error) {
    next(error);
  }
}

export const permitir = (...roles: string[]) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.usuario || !roles.includes(req.usuario.rol)) {
    return next(new HttpError(403, 'no tienes permiso para realizar esta acción'));
  }
  next();
};
