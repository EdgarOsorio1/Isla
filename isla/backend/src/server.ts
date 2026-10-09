import { crearApp } from './app';
import { env } from './config/env';

crearApp().listen(env.port, () => {
  console.log(`isla api escuchando en http://localhost:${env.port}/api`);
});
