import { Router } from 'express';
import { z } from 'zod';
import { autenticar, permitir } from '../../middlewares/auth';
import { validar } from '../../middlewares/validar';
import { ah } from '../../utils/asincrono';
import { consultaListado, idParam } from '../../utils/paginacion';
import { PERSONAL, ROLES } from '../../utils/roles';
import * as servicio from './alertas.service';

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

router.get('/', validar(consultaListado, 'query'), ah(async (req, res) => {
  res.json(await servicio.listar(res.locals.query, req.usuario!));
}));

router.get('/:id', validar(idParam, 'params'), ah(async (req, res) => {
  res.json(await servicio.obtener(res.locals.params.id, req.usuario!));
}));

router.post('/', validar(alertaSchema), ah(async (req, res) => {
  res.status(201).json(await servicio.crear(res.locals.body, req.usuario!));
}));

router.put('/:id', permitir(...PERSONAL), validar(idParam, 'params'), validar(alertaSchema), ah(async (req, res) => {
  res.json(await servicio.actualizar(res.locals.params.id, res.locals.body, req.usuario!));
}));

router.delete('/:id', permitir(ROLES.admin), validar(idParam, 'params'), ah(async (req, res) => {
  await servicio.eliminar(res.locals.params.id, req.usuario!);
  res.status(204).send();
}));

export default router;
