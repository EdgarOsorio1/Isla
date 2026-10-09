import { Router } from 'express';
import { z } from 'zod';
import { autenticar, permitir } from '../../middlewares/auth';
import { validar } from '../../middlewares/validar';
import { ah } from '../../utils/asincrono';
import { consultaListado, idParam } from '../../utils/paginacion';
import { PERSONAL, ROLES } from '../../utils/roles';
import * as servicio from './ninos.service';

const ninoSchema = z.object({
  nombres: z.string().trim().min(2, 'los nombres son obligatorios').max(80),
  apellidos: z.string().trim().max(80).nullable().optional(),
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'la fecha no es válida').nullable().optional(),
  sexo: z.enum(['f', 'm'], { message: 'selecciona el sexo' }),
  estado: z.enum(['en_riesgo', 'en_proceso', 'acogido', 'reintegrado'], { message: 'el estado no es válido' }).optional(),
  observaciones: z.string().trim().max(500, 'máximo 500 caracteres').nullable().optional(),
  alerta_id: z.coerce.number().int().positive().nullable().optional()
});

const router = Router();
router.use(autenticar, permitir(...PERSONAL));

router.get('/disponibles', ah(async (_req, res) => {
  res.json(await servicio.disponibles());
}));

router.get('/', validar(consultaListado, 'query'), ah(async (_req, res) => {
  res.json(await servicio.listar(res.locals.query));
}));

router.get('/:id', validar(idParam, 'params'), ah(async (_req, res) => {
  res.json(await servicio.obtener(res.locals.params.id));
}));

router.post('/', validar(ninoSchema), ah(async (req, res) => {
  res.status(201).json(await servicio.crear(res.locals.body, req.usuario!.id));
}));

router.put('/:id', validar(idParam, 'params'), validar(ninoSchema), ah(async (_req, res) => {
  res.json(await servicio.actualizar(res.locals.params.id, res.locals.body));
}));

router.delete('/:id', permitir(ROLES.admin), validar(idParam, 'params'), ah(async (_req, res) => {
  await servicio.eliminar(res.locals.params.id);
  res.status(204).send();
}));

export default router;
