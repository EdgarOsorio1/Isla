import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { manejadorErrores, noEncontrado } from './middleware/errores';
import { rutas } from './routes';

export function crearApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json({ limit: '100kb' }));
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
  app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders: true, legacyHeaders: false }));
  app.get('/api/salud', (_req, res) => {
    res.json({ estado: 'ok', servicio: 'isla-api' });
  });
  app.use('/api', rutas);
  app.use(noEncontrado);
  app.use(manejadorErrores);
  return app;
}
