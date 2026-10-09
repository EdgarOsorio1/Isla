import { consultar, ejecutar } from '../config/db';
import { HttpError } from '../utils/errors';
import { ConsultaListado, respuestaPaginada } from '../utils/paginacion';
import { ROLES } from '../utils/roles';

export interface DatosAlerta {
  titulo: string;
  descripcion: string;
  ubicacion: string;
  edad_aprox?: number | null;
  prioridad?: string;
  estado?: string;
}

const columnas = `a.id, a.usuario_id, a.titulo, a.descripcion, a.ubicacion, a.edad_aprox, a.prioridad, a.estado,
  a.creado_en, a.actualizado_en, u.nombre as reportante`;

export async function listar(c: ConsultaListado, usuario: { id: number; rol: string }) {
  const donde: string[] = [];
  const p: any[] = [];
  if (usuario.rol === ROLES.ciudadano) {
    donde.push('a.usuario_id = ?');
    p.push(usuario.id);
  }
  if (c.q) {
    donde.push('(a.titulo like ? or a.ubicacion like ?)');
    p.push(`%${c.q}%`, `%${c.q}%`);
  }
  if (c.estado) {
    donde.push('a.estado = ?');
    p.push(c.estado);
  }
  const w = donde.length ? `where ${donde.join(' and ')}` : '';
  const [{ total }] = await consultar<{ total: number }>(`select count(*) as total from alertas a ${w}`, p);
  const datos = await consultar(
    `select ${columnas} from alertas a join usuarios u on u.id = a.usuario_id ${w} order by a.id desc limit ? offset ?`,
    [...p, c.limite, (c.pagina - 1) * c.limite]
  );
  return respuestaPaginada(datos, total, c);
}

export async function obtener(id: number, usuario: { id: number; rol: string }) {
  const filas = await consultar(`select ${columnas} from alertas a join usuarios u on u.id = a.usuario_id where a.id = ?`, [id]);
  if (!filas.length || (usuario.rol === ROLES.ciudadano && filas[0].usuario_id !== usuario.id)) {
    throw new HttpError(404, 'la alerta no existe');
  }
  return filas[0];
}

export async function crear(d: DatosAlerta, usuario: { id: number; rol: string }) {
  const r = await ejecutar(
    'insert into alertas (usuario_id, titulo, descripcion, ubicacion, edad_aprox, prioridad) values (?, ?, ?, ?, ?, ?)',
    [usuario.id, d.titulo, d.descripcion, d.ubicacion, d.edad_aprox ?? null, d.prioridad ?? 'media']
  );
  return obtener(r.insertId, usuario);
}

export async function actualizar(id: number, d: DatosAlerta, usuario: { id: number; rol: string }) {
  await obtener(id, usuario);
  await ejecutar(
    'update alertas set titulo = ?, descripcion = ?, ubicacion = ?, edad_aprox = ?, prioridad = coalesce(?, prioridad), estado = coalesce(?, estado) where id = ?',
    [d.titulo, d.descripcion, d.ubicacion, d.edad_aprox ?? null, d.prioridad ?? null, d.estado ?? null, id]
  );
  return obtener(id, usuario);
}

export async function eliminar(id: number, usuario: { id: number; rol: string }) {
  await obtener(id, usuario);
  await ejecutar('delete from alertas where id = ?', [id]);
}
