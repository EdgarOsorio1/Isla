import { consultar } from '../../config/db';
import { ROLES } from '../../utils/roles';

async function contar(sql: string, params: any[] = []): Promise<number> {
  const [fila] = await consultar<{ total: number | string }>(sql, params);
  return Number(fila.total);
}

export async function resumen(usuario: { id: number; rol: string }) {
  if (usuario.rol === ROLES.ciudadano) {
    const ultimas = await consultar(
      'select id, titulo, ubicacion, prioridad, estado, creado_en from alertas where usuario_id = ? order by id desc limit 5',
      [usuario.id]
    );
    return {
      tipo: 'ciudadano',
      indicadores: {
        mis_alertas: await contar('select count(*) as total from alertas where usuario_id = ?', [usuario.id]),
        pendientes: await contar("select count(*) as total from alertas where usuario_id = ? and estado in ('pendiente','en_revision')", [usuario.id]),
        atendidas: await contar("select count(*) as total from alertas where usuario_id = ? and estado = 'atendida'", [usuario.id])
      },
      ultimas_alertas: ultimas
    };
  }
  return {
    tipo: 'personal',
    indicadores: {
      alertas_pendientes: await contar("select count(*) as total from alertas where estado in ('pendiente','en_revision')"),
      ninos_en_riesgo: await contar("select count(*) as total from ninos where estado = 'en_riesgo'"),
      ninos_acogidos: await contar("select count(*) as total from ninos where estado = 'acogido'"),
      cupos_disponibles: await contar('select coalesce(sum(capacidad - ocupados), 0) as total from hogares where activo = 1'),
      asignaciones_pendientes: await contar("select count(*) as total from asignaciones where estado = 'pendiente'")
    },
    alertas_por_estado: await consultar('select estado, count(*) as total from alertas group by estado order by total desc'),
    asignaciones_por_estado: await consultar('select estado, count(*) as total from asignaciones group by estado order by total desc'),
    ultimas_alertas: await consultar(
      'select id, titulo, ubicacion, prioridad, estado, creado_en from alertas order by id desc limit 5'
    )
  };
}
