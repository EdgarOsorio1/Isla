import mysql from 'mysql2/promise';
import type { PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { env } from './env';

export const pool = mysql.createPool({
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  waitForConnections: true,
  connectionLimit: 10
});

export async function consultar<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const [filas] = await pool.query(sql, params);
  return filas as T[];
}

export async function ejecutar(sql: string, params: any[] = []): Promise<ResultSetHeader> {
  const [resultado] = await pool.query<ResultSetHeader>(sql, params);
  return resultado;
}

export async function transaccion<T>(trabajo: (conexion: PoolConnection) => Promise<T>): Promise<T> {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    const resultado = await trabajo(conexion);
    await conexion.commit();
    return resultado;
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}
