import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface CargaToken {
  id: number;
  rol: string;
}

export function firmar(carga: CargaToken): string {
  return jwt.sign(carga, env.jwtSecret, { expiresIn: env.jwtExpires as any });
}

export function verificar(token: string): CargaToken {
  return jwt.verify(token, env.jwtSecret) as CargaToken;
}
