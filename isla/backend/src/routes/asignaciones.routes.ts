import { Router } from 'express';
import { z } from 'zod';
import { autenticar, permitir } from '../middleware/auth';
import { validar } from '../middleware/validar';
import { consultaListado, idParam } from '../utils/paginacion';
import { PERSONAL, ROLES } from '../utils/roles';
import * as controlador from '../controllers/asignaciones.controller';

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

router.get('/', validar(consultaListado, 'query'), controlador.listar);
router.get('/:id', validar(idParam, 'params'), controlador.obtener);
router.post('/', validar(crearSchema), controlador.crear);
router.patch('/:id/resolver', permitir(ROLES.admin), validar(idParam, 'params'), validar(resolverSchema), controlador.resolver);
router.patch('/:id/completar', validar(idParam, 'params'), controlador.completar);

export default router;
