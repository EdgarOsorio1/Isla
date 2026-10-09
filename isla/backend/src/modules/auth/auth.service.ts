import { consultar, ejecutar } from '../../config/db';
import { HttpError } from '../../utils/errors';
import { firmar } from '../../utils/jwt';
import { comparar, hashear } from '../../utils/password';

interface FilaUsuario {
  id: number;
  nombre: string;
  email: string;
  clave_hash: string;
  activo: number;
  rol: string;
}

function sesion(u: { id: number; nombre: string; email: string; rol: string }) {
  return {
    token: firmar({ id: u.id, rol: u.rol }),
    usuario: { id: u.id, nombre: u.nombre, email: u.email, rol: u.rol }
  };
}

export async function registrar(d: { nombre: string; email: string; clave: string; telefono?: string }) {
  const existe = await consultar('select id from usuarios where email = ?', [d.email]);
  if (existe.length) throw new HttpError(409, 'el correo ya está registrado');
  const hash = await hashear(d.clave);
  const r = await ejecutar(
    'insert into usuarios (rol_id, nombre, email, clave_hash, telefono) values ((select id from roles where nombre = ?), ?, ?, ?, ?)',
    ['ciudadano', d.nombre, d.email, hash, d.telefono || null]
  );
  return sesion({ id: r.insertId, nombre: d.nombre, email: d.email, rol: 'ciudadano' });
}

export async function iniciarSesion(email: string, clave: string) {
  const filas = await consultar<FilaUsuario>(
    'select u.id, u.nombre, u.email, u.clave_hash, u.activo, r.nombre as rol from usuarios u join roles r on r.id = u.rol_id where u.email = ?',
    [email]
  );
  const u = filas[0];
  const valida = u ? await comparar(clave, u.clave_hash) : false;
  if (!u || !valida) throw new HttpError(401, 'correo o contraseña incorrectos');
  if (!u.activo) throw new HttpError(403, 'tu cuenta está desactivada');
  return sesion(u);
}
