import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 3000),
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: Number(process.env.DB_PORT || 3306),
  dbUser: process.env.DB_USER || 'root',
  dbPassword: process.env.DB_PASSWORD || '',
  dbName: process.env.DB_NAME || 'isla',
  jwtSecret: process.env.JWT_SECRET || 'secreto_de_desarrollo',
  jwtExpires: process.env.JWT_EXPIRES || '8h',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:4200').split(',').map((o) => o.trim())
};
