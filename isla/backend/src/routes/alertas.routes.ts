import { Router } from 'express';
import { z } from 'zod';
import { autenticar, permitir } from '../middleware/auth';
import { validar } from '../middleware/validar';
import { consultaListado, idParam } from '../utils/paginacion';
import { PERSONAL, ROLES } from '../utils/roles';
import * as controlador from '../controllers/alertas.controller';

const alertaSchema = z.object({
  titulo: z.string().trim().min(5, 'el título debe tener al menos 5 caracteres').max(120),
  descripcion: z.string().trim().min(10, 'describe la situación con al menos 10 caracteres').max(1000),
  ubicacion: z.string().trim().min(3, 'indica dónde ocurre').max(160),
  edad_aprox: z.coerce.number().int().min(0, 'la edad mínima es 0').max(17, 'la edad máxima es 17').nullable().optional(),
  prioridad: z.enum(['baja', 'media', 'alta'], { message: 'la prioridad no es válida' }).optional(),
  estado: z.enum(['pendiente', 'en_revision', 'atendida', 'descartada'], { message: 'el estado no es válido' }).optional()
});

const router = Router();
router.use(autenticar);

router.get('/', validar(consultaListado, 'query'), controlador.listar);
router.get('/:id', validar(idParam, 'params'), controlador.obtener);
router.post('/', validar(alertaSchema), controlador.crear);
router.put('/:id', permitir(...PERSONAL), validar(idParam, 'params'), validar(alertaSchema), controlador.actualizar);
router.delete('/:id', permitir(ROLES.admin), validar(idParam, 'params'), controlador.eliminar);

export default router;
