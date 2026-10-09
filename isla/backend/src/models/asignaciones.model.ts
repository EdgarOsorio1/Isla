import { consultar, transaccion } from '../config/db';
import { HttpError } from '../utils/errors';
import { ConsultaListado, respuestaPaginada } from '../utils/paginacion';

const desde = `from asignaciones a
  join ninos n on n.id = a.nino_id
  join hogares h on h.id = a.hogar_id
  join usuarios us on us.id = a.solicitado_por
  left join usuarios ur on ur.id = a.resuelto_por`;

const columnas = `a.id, a.nino_id, a.hogar_id, a.motivo, a.respuesta, a.estado, a.creado_en, a.resuelto_en,
  concat(n.nombres, ' ', coalesce(n.apellidos, '')) as nino, h.nombre as hogar, us.nombre as solicitante, ur.nombre as resolutor`;

export async function listar(c: ConsultaListado) {
  const donde: string[] = [];
  const p: any[] = [];
  if (c.q) {
    donde.push("(concat(n.nombres, ' ', coalesce(n.apellidos, '')) like ? or h.nombre like ?)");
    p.push(`%${c.q}%`, `%${c.q}%`);
  }
  if (c.estado) {
    donde.push('a.estado = ?');
    p.push(c.estado);
  }
  const w = donde.length ? `where ${donde.join(' and ')}` : '';
  const [{ total }] = await consultar<{ total: number }>(`select count(*) as total ${desde} ${w}`, p);
  const datos = await consultar(`select ${columnas} ${desde} ${w} order by a.id desc limit ? offset ?`, [...p, c.limite, (c.pagina - 1) * c.limite]);
  return respuestaPaginada(datos, total, c);
}

export async function obtener(id: number) {
  const filas = await consultar(`select ${columnas} ${desde} where a.id = ?`, [id]);
  if (!filas.length) throw new HttpError(404, 'la asignación no existe');
  return filas[0];
}

export async function crear(d: { nino_id: number; hogar_id: number; motivo: string }, usuarioId: number) {
  const id = await transaccion(async (c) => {
    const [ninos]: any = await c.query('select id, estado from ninos where id = ? for update', [d.nino_id]);
    if (!ninos.length) throw new HttpError(404, 'el niño no existe');
    if (ninos[0].estado !== 'en_riesgo') throw new HttpError(409, 'el niño no está disponible para una asignación');
    const [abiertas]: any = await c.query("select id from asignaciones where nino_id = ? and estado in ('pendiente','aprobada')", [d.nino_id]);
    if (abiertas.length) throw new HttpError(409, 'el niño ya tiene una asignación en curso');
    const [hogares]: any = await c.query('select activo, capacidad, ocupados from hogares where id = ?', [d.hogar_id]);
    if (!hogares.length) throw new HttpError(404, 'el hogar no existe');
    if (!hogares[0].activo || hogares[0].ocupados >= hogares[0].capacidad) throw new HttpError(409, 'el hogar no tiene cupo disponible');
    const [r]: any = await c.query('insert into asignaciones (nino_id, hogar_id, solicitado_por, motivo) values (?, ?, ?, ?)', [
      d.nino_id,
      d.hogar_id,
      usuarioId,
      d.motivo
    ]);
    return r.insertId as number;
  });
  return obtener(id);
}

export async function resolver(id: number, accion: 'aprobar' | 'rechazar', respuesta: string | undefined, adminId: number) {
  await transaccion(async (c) => {
    const [filas]: any = await c.query('select * from asignaciones where id = ? for update', [id]);
    if (!filas.length) throw new HttpError(404, 'la asignación no existe');
    const a = filas[0];
    if (a.estado !== 'pendiente') throw new HttpError(409, 'la solicitud ya fue resuelta');
    if (accion === 'aprobar') {
      const [hogares]: any = await c.query('select activo, capacidad, ocupados from hogares where id = ? for update', [a.hogar_id]);
      if (!hogares.length || !hogares[0].activo || hogares[0].ocupados >= hogares[0].capacidad) {
        throw new HttpError(409, 'el hogar ya no tiene cupo disponible');
      }
      await c.query('update hogares set ocupados = ocupados + 1 where id = ?', [a.hogar_id]);
      await c.query("update ninos set estado = 'en_proceso' where id = ?", [a.nino_id]);
      await c.query("update asignaciones set estado = 'aprobada', respuesta = ?, resuelto_por = ?, resuelto_en = now() where id = ?", [
        respuesta ?? null,
        adminId,
        id
      ]);
    } else {
      await c.query("update asignaciones set estado = 'rechazada', respuesta = ?, resuelto_por = ?, resuelto_en = now() where id = ?", [
        respuesta ?? null,
        adminId,
        id
      ]);
    }
  });
  return obtener(id);
}

export async function completar(id: number) {
  await transaccion(async (c) => {
    const [filas]: any = await c.query('select * from asignaciones where id = ? for update', [id]);
    if (!filas.length) throw new HttpError(404, 'la asignación no existe');
    if (filas[0].estado !== 'aprobada') throw new HttpError(409, 'solo se puede completar una asignación aprobada');
    await c.query("update asignaciones set estado = 'completada' where id = ?", [id]);
    await c.query("update ninos set estado = 'acogido' where id = ?", [filas[0].nino_id]);
  });
  return obtener(id);
}
