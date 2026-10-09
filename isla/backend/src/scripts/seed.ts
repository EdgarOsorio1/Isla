import { consultar, ejecutar, pool } from '../config/db';
import { hashear } from '../utils/password';

async function sembrar() {
  const [{ total }] = await consultar<{ total: number }>('select count(*) as total from usuarios');
  if (total > 0) {
    console.log('la base ya contiene datos, no se sembró nada');
    return;
  }
  const hash = await hashear('Isla2026!');

  await ejecutar(
    'insert into usuarios (rol_id, nombre, email, clave_hash, telefono) values (1, ?, ?, ?, ?), (2, ?, ?, ?, ?), (3, ?, ?, ?, ?), (3, ?, ?, ?, ?)',
    [
      'administración isla', 'admin@isla.org', hash, '22001000',
      'marta lópez', 'trabajador@isla.org', hash, '55501234',
      'carlos pérez', 'ciudadano@isla.org', hash, '44405678',
      'lucía ramírez', 'lucia@isla.org', hash, null
    ]
  );

  await ejecutar(
    'insert into hogares (nombre, tipo, direccion, municipio, telefono, capacidad, ocupados) values (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?)',
    [
      'hogar esperanza', 'hogar_temporal', '5a avenida 10-20 zona 1', 'guatemala', '22001111', 12, 1,
      'familia de acogida morales', 'familia_acogida', 'colonia el mirador', 'mixco', '55502222', 3, 0,
      'centro de protección luz', 'centro_proteccion', 'km 18 carretera a villa nueva', 'villa nueva', '22003333', 20, 1,
      'hogar manos unidas', 'hogar_temporal', '3a calle 4-15 zona 3', 'quetzaltenango', '77004444', 10, 0,
      'casa del sol', 'centro_proteccion', 'barrio san sebastián', 'antigua guatemala', '78005555', 4, 4
    ]
  );

  await ejecutar(
    'insert into alertas (usuario_id, titulo, descripcion, ubicacion, edad_aprox, prioridad, estado) values (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?)',
    [
      3, 'bebé encontrado en un parque', 'un vecino encontró a un bebé envuelto en una manta cerca de las bancas del parque.', 'parque central zona 1', 0, 'alta', 'atendida',
      4, 'dos hermanos solos en el mercado', 'dos niños de unos 6 y 8 años llevan dos días pidiendo comida en el mercado sin ningún adulto.', 'mercado la terminal', 7, 'alta', 'atendida',
      3, 'menor sin cuidado en una vivienda', 'una niña pequeña queda sola durante toda la jornada mientras la madre trabaja.', 'colonia la florida', 4, 'media', 'en_revision',
      4, 'niña pidiendo comida en la calle', 'se ve a una niña todas las tardes pidiendo comida frente a una panadería.', 'avenida las américas', 9, 'alta', 'pendiente',
      3, 'adolescente sin hogar', 'un joven duerme en una parada de buses desde hace una semana.', 'terminal de buses zona 4', 15, 'media', 'pendiente',
      4, 'madre pide ayuda para su bebé', 'una vecina no tiene recursos para cuidar a su bebé y teme perder la custodia.', 'colonia santa fe', 1, 'baja', 'pendiente'
    ]
  );

  await ejecutar(
    'insert into ninos (alerta_id, registrado_por, nombres, apellidos, fecha_nacimiento, sexo, estado, observaciones) values (?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      1, 2, 'sofía', null, '2026-09-20', 'f', 'acogido', 'recién nacida, en buen estado de salud',
      2, 2, 'mateo', 'gómez', '2019-05-14', 'm', 'en_proceso', 'hermano de ana, deben mantenerse cerca',
      2, 2, 'ana', 'gómez', '2017-03-02', 'f', 'en_riesgo', 'requiere acompañamiento escolar',
      null, 2, 'luis', null, '2010-09-20', 'm', 'en_riesgo', 'llegó referido por una escuela'
    ]
  );

  await ejecutar(
    'insert into asignaciones (nino_id, hogar_id, solicitado_por, resuelto_por, estado, motivo, respuesta, resuelto_en) values (?, ?, ?, ?, ?, ?, ?, now()), (?, ?, ?, ?, ?, ?, ?, now()), (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      1, 3, 2, 1, 'completada', 'el centro cuenta con atención neonatal permanente', 'aprobada, el centro tiene cupo y personal',
      2, 1, 2, 1, 'aprobada', 'el hogar tiene espacio y está cerca de su escuela', 'aprobada, pendiente de traslado',
      3, 2, 2, null, 'pendiente', 'la familia de acogida puede recibir a la niña y mantener contacto con su hermano', null, null
    ]
  );

  console.log('datos de demostración creados. contraseña de las cuentas: Isla2026!');
}

sembrar()
  .catch((error) => {
    console.error('no se pudo sembrar la base de datos:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
