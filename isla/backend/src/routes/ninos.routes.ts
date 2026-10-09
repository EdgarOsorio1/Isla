import { Router } from 'express';
import { z } from 'zod';
import { autenticar, permitir } from '../middleware/auth';
import { validar } from '../middleware/validar';
import { consultaListado, idParam } from '../utils/paginacion';
import { PERSONAL, ROLES } from '../utils/roles';
import * as controlador from '../controllers/ninos.controller';

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

router.get('/disponibles', controlador.disponibles);
router.get('/', validar(consultaListado, 'query'), controlador.listar);
router.get('/:id', validar(idParam, 'params'), controlador.obtener);
router.post('/', validar(ninoSchema), controlador.crear);
router.put('/:id', validar(idParam, 'params'), validar(ninoSchema), controlador.actualizar);
router.delete('/:id', permitir(ROLES.admin), validar(idParam, 'params'), controlador.eliminar);

export default router;
