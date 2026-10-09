import { consultar, ejecutar } from '../config/db';
import { HttpError } from '../utils/errors';
import { ConsultaListado, respuestaPaginada } from '../utils/paginacion';

export interface DatosHogar {
  nombre: string;
  tipo: string;
  direccion?: string | null;
  municipio: string;
  telefono?: string | null;
  capacidad: number;
  activo?: boolean;
}

export async function listar(c: ConsultaListado) {
  const donde: string[] = [];
  const p: any[] = [];
  if (c.q) {
    donde.push('(nombre like ? or municipio like ?)');
    p.push(`%${c.q}%`, `%${c.q}%`);
  }
  if (c.estado === 'disponible') donde.push('activo = 1 and ocupados < capacidad');
  if (c.estado === 'lleno') donde.push('ocupados >= capacidad');
  if (c.estado === 'inactivo') donde.push('activo = 0');
  const w = donde.length ? `where ${donde.join(' and ')}` : '';
  const [{ total }] = await consultar<{ total: number }>(`select count(*) as total from hogares ${w}`, p);
  const datos = await consultar(`select * from hogares ${w} order by id desc limit ? offset ?`, [...p, c.limite, (c.pagina - 1) * c.limite]);
  return respuestaPaginada(datos, total, c);
}

export function disponibles() {
  return consultar('select id, nombre, municipio, capacidad, ocupados from hogares where activo = 1 and ocupados < capacidad order by nombre');
}

export async function obtener(id: number) {
  const filas = await consultar('select * from hogares where id = ?', [id]);
  if (!filas.length) throw new HttpError(404, 'el hogar no existe');
  return filas[0];
}

export async function crear(d: DatosHogar) {
  const r = await ejecutar(
    'insert into hogares (nombre, tipo, direccion, municipio, telefono, capacidad, activo) values (?, ?, ?, ?, ?, ?, ?)',
    [d.nombre, d.tipo, d.direccion ?? null, d.municipio, d.telefono ?? null, d.capacidad, d.activo === false ? 0 : 1]
  );
  return obtener(r.insertId);
}

export async function actualizar(id: number, d: DatosHogar) {
  const actual = await obtener(id);
  if (d.capacidad < actual.ocupados) throw new HttpError(409, 'la capacidad no puede ser menor a los cupos ocupados');
  await ejecutar(
    'update hogares set nombre = ?, tipo = ?, direccion = ?, municipio = ?, telefono = ?, capacidad = ?, activo = coalesce(?, activo) where id = ?',
    [d.nombre, d.tipo, d.direccion ?? null, d.municipio, d.telefono ?? null, d.capacidad, d.activo === undefined ? null : Number(d.activo), id]
  );
  return obtener(id);
}

export async function eliminar(id: number) {
  await obtener(id);
  await ejecutar('delete from hogares where id = ?', [id]);
}
