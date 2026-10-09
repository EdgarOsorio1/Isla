import bcrypt from 'bcrypt';

export function hashear(clave: string): Promise<string> {
  return bcrypt.hash(clave, 10);
}

export function comparar(clave: string, hash: string): Promise<boolean> {
  return bcrypt.compare(clave, hash);
}
