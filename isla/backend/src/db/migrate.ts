import { readFileSync } from 'fs';
import { join } from 'path';
import mysql from 'mysql2/promise';
import { env } from '../config/env';

async function migrar() {
  const conexion = await mysql.createConnection({
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUser,
    password: env.dbPassword,
    multipleStatements: true
  });
  const sql = readFileSync(join(__dirname, '..', '..', 'db', 'schema.sql'), 'utf8');
  await conexion.query(sql);
  await conexion.end();
  console.log('base de datos creada correctamente');
}

migrar().catch((error) => {
  console.error('no se pudo crear la base de datos:', error.message);
  process.exit(1);
});
