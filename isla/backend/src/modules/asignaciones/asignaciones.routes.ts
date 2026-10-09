import { Router } from 'express';
import { z } from 'zod';
import { autenticar, permitir } from '../../middlewares/auth';
import { validar } from '../../middlewares/validar';
import { ah } from '../../utils/asincrono';
import { consultaListado, idParam } from '../../utils/paginacion';
import { PERSONAL, ROLES } from '../../utils/roles';
import * as servicio from './asignaciones.service';

const crearSchema = z.object({
  nino_id: z.coerce.number({ message: 'selecciona un niño' }).int().positive('selecciona un niño'),
  hogar_id: z.coerce.number({ message: 'selecciona un hogar' }).int().positive('selecciona un hogar'),
  motivo: z.string().trim().min(10, 'explica el motivo con al menos 10 caracteres').max(500)
});

const resolverSchema = z
  .object({
    accion: z.enum(['aprobar', 'rechazar'], { message: 'la acción no es válida' }),
    respuesta: z.string().trim().max(255).optional()
  })
  .refine((d) => d.accion === 'aprobar' || (d.respuesta && d.respuesta.length >= 5), {
    message: 'indica el motivo del rechazo',
    path: ['respuesta']
  });

const router = Router();
router.use(autenticar, permitir(...PERSONAL));

router.get('/', validar(consultaListado, 'query'), ah(async (_req, res) => {
  res.json(await servicio.listar(res.locals.query));
}));

router.get('/:id', validar(idParam, 'params'), ah(async (_req, res) => {
  res.json(await servicio.obtener(res.locals.params.id));
}));

router.post('/', validar(crearSchema), ah(async (req, res) => {
  res.status(201).json(await servicio.crear(res.locals.body, req.usuario!.id));
}));

router.patch('/:id/resolver', permitir(ROLES.admin), validar(idParam, 'params'), validar(resolverSchema), ah(async (req, res) => {
  const { accion, respuesta } = res.locals.body;
  res.json(await servicio.resolver(res.locals.params.id, accion, respuesta, req.usuario!.id));
}));

router.patch('/:id/completar', validar(idParam, 'params'), ah(async (_req, res) => {
  res.json(await servicio.completar(res.locals.params.id));
}));

export default router;
