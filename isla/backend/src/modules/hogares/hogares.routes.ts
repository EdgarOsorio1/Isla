import { Router } from 'express';
import { z } from 'zod';
import { autenticar, permitir } from '../../middlewares/auth';
import { validar } from '../../middlewares/validar';
import { ah } from '../../utils/asincrono';
import { consultaListado, idParam } from '../../utils/paginacion';
import { PERSONAL, ROLES } from '../../utils/roles';
import * as servicio from './hogares.service';

const hogarSchema = z.object({
  nombre: z.string().trim().min(3, 'el nombre debe tener al menos 3 caracteres').max(100),
  tipo: z.enum(['hogar_temporal', 'familia_acogida', 'centro_proteccion'], { message: 'el tipo de hogar no es válido' }),
  direccion: z.string().trim().max(160).nullable().optional(),
  municipio: z.string().trim().min(2, 'el municipio es obligatorio').max(80),
  telefono: z.string().trim().regex(/^[0-9+\-\s]{8,20}$/, 'el teléfono no es válido').nullable().optional(),
  capacidad: z.coerce.number({ message: 'la capacidad debe ser un número' }).int().min(1, 'la capacidad mínima es 1').max(200, 'la capacidad máxima es 200'),
  activo: z.boolean().optional()
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

router.post('/', validar(hogarSchema), ah(async (_req, res) => {
  res.status(201).json(await servicio.crear(res.locals.body));
}));

router.put('/:id', validar(idParam, 'params'), validar(hogarSchema), ah(async (_req, res) => {
  res.json(await servicio.actualizar(res.locals.params.id, res.locals.body));
}));

router.delete('/:id', permitir(ROLES.admin), validar(idParam, 'params'), ah(async (_req, res) => {
  await servicio.eliminar(res.locals.params.id);
  res.status(204).send();
}));

export default router;
