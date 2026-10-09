import { consultar, ejecutar } from '../config/db';
import { HttpError } from '../utils/errors';
import { hashear } from '../utils/password';
import { ConsultaListado, respuestaPaginada } from '../utils/paginacion';

export async function obtenerPerfil(id: number) {
  const filas = await consultar(
    'select u.id, u.nombre, u.email, u.telefono, u.activo, u.creado_en, r.nombre as rol from usuarios u join roles r on r.id = u.rol_id where u.id = ?',
    [id]
  );
  if (!filas.length) throw new HttpError(404, 'el usuario no existe');
  return filas[0];
}

export async function actualizarPerfil(id: number, d: { nombre: string; telefono?: string | null; clave?: string }) {
  await ejecutar('update usuarios set nombre = ?, telefono = ? where id = ?', [d.nombre, d.telefono || null, id]);
  if (d.clave) await ejecutar('update usuarios set clave_hash = ? where id = ?', [await hashear(d.clave), id]);
  return obtenerPerfil(id);
}

export async function listar(c: ConsultaListado) {
  const donde: string[] = [];
  const p: any[] = [];
  if (c.q) {
    donde.push('(u.nombre like ? or u.email like ?)');
    p.push(`%${c.q}%`, `%${c.q}%`);
  }
  if (c.estado === 'activo') donde.push('u.activo = 1');
  if (c.estado === 'inactivo') donde.push('u.activo = 0');
  const w = donde.length ? `where ${donde.join(' and ')}` : '';
  const [{ total }] = await consultar<{ total: number }>(`select count(*) as total from usuarios u ${w}`, p);
  const datos = await consultar(
    `select u.id, u.nombre, u.email, u.telefono, u.activo, u.creado_en, r.nombre as rol from usuarios u join roles r on r.id = u.rol_id ${w} order by u.id desc limit ? offset ?`,
    [...p, c.limite, (c.pagina - 1) * c.limite]
  );
  return respuestaPaginada(datos, total, c);
}

export async function cambiar(id: number, d: { rol?: string; activo?: boolean }, solicitanteId: number) {
  if (id === solicitanteId) throw new HttpError(409, 'no puedes cambiar tu propio rol ni desactivar tu cuenta');
  await obtenerPerfil(id);
  await ejecutar(
    'update usuarios set rol_id = coalesce((select id from roles where nombre = ?), rol_id), activo = coalesce(?, activo) where id = ?',
    [d.rol ?? null, d.activo === undefined ? null : Number(d.activo), id]
  );
  return obtenerPerfil(id);
}
