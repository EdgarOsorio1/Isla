import { consultar, ejecutar, transaccion } from '../config/db';
import { HttpError } from '../utils/errors';
import { ConsultaListado, respuestaPaginada } from '../utils/paginacion';

export interface DatosNino {
  nombres: string;
  apellidos?: string | null;
  fecha_nacimiento?: string | null;
  sexo: string;
  estado?: string;
  observaciones?: string | null;
  alerta_id?: number | null;
}

const columnas = `n.id, n.alerta_id, n.nombres, n.apellidos, date_format(n.fecha_nacimiento, '%Y-%m-%d') as fecha_nacimiento,
  n.sexo, n.estado, n.observaciones, n.creado_en, a.titulo as alerta_titulo`;

export async function listar(c: ConsultaListado) {
  const donde: string[] = [];
  const p: any[] = [];
  if (c.q) {
    donde.push("concat(n.nombres, ' ', coalesce(n.apellidos, '')) like ?");
    p.push(`%${c.q}%`);
  }
  if (c.estado) {
    donde.push('n.estado = ?');
    p.push(c.estado);
  }
  const w = donde.length ? `where ${donde.join(' and ')}` : '';
  const [{ total }] = await consultar<{ total: number }>(`select count(*) as total from ninos n ${w}`, p);
  const datos = await consultar(
    `select ${columnas} from ninos n left join alertas a on a.id = n.alerta_id ${w} order by n.id desc limit ? offset ?`,
    [...p, c.limite, (c.pagina - 1) * c.limite]
  );
  return respuestaPaginada(datos, total, c);
}

export function disponibles() {
  return consultar(
    `select id, concat(nombres, ' ', coalesce(apellidos, '')) as nombre from ninos n
     where estado = 'en_riesgo' and not exists (select 1 from asignaciones s where s.nino_id = n.id and s.estado in ('pendiente','aprobada'))
     order by nombres`
  );
}

export async function obtener(id: number) {
  const filas = await consultar(`select ${columnas} from ninos n left join alertas a on a.id = n.alerta_id where n.id = ?`, [id]);
  if (!filas.length) throw new HttpError(404, 'el niño no existe');
  return filas[0];
}

export async function crear(d: DatosNino, usuarioId: number) {
  const id = await transaccion(async (c) => {
    if (d.alerta_id) {
      const [alertas]: any = await c.query('select id from alertas where id = ?', [d.alerta_id]);
      if (!alertas.length) throw new HttpError(404, 'la alerta indicada no existe');
    }
    const [r]: any = await c.query(
      'insert into ninos (alerta_id, registrado_por, nombres, apellidos, fecha_nacimiento, sexo, estado, observaciones) values (?, ?, ?, ?, ?, ?, ?, ?)',
      [d.alerta_id ?? null, usuarioId, d.nombres, d.apellidos ?? null, d.fecha_nacimiento ?? null, d.sexo, d.estado ?? 'en_riesgo', d.observaciones ?? null]
    );
    if (d.alerta_id) {
      await c.query("update alertas set estado = 'atendida' where id = ? and estado in ('pendiente','en_revision')", [d.alerta_id]);
    }
    return r.insertId as number;
  });
  return obtener(id);
}

export async function actualizar(id: number, d: DatosNino) {
  await obtener(id);
  await ejecutar(
    'update ninos set nombres = ?, apellidos = ?, fecha_nacimiento = ?, sexo = ?, estado = coalesce(?, estado), observaciones = ? where id = ?',
    [d.nombres, d.apellidos ?? null, d.fecha_nacimiento ?? null, d.sexo, d.estado ?? null, d.observaciones ?? null, id]
  );
  return obtener(id);
}

export async function eliminar(id: number) {
  await obtener(id);
  await ejecutar('delete from ninos where id = ?', [id]);
}
