import { Router } from 'express';
import { z } from 'zod';
import { autenticar, permitir } from '../../middlewares/auth';
import { validar } from '../../middlewares/validar';
import { ah } from '../../utils/asincrono';
import { consultaListado, idParam } from '../../utils/paginacion';
import { ROLES } from '../../utils/roles';
import * as servicio from './usuarios.service';

const perfilSchema = z.object({
  nombre: z.string().trim().min(3, 'el nombre debe tener al menos 3 caracteres').max(80),
  telefono: z.string().trim().regex(/^[0-9+\-\s]{8,20}$/, 'el teléfono no es válido').nullable().optional().or(z.literal('')),
  clave: z
    .string()
    .min(8, 'la contraseña debe tener al menos 8 caracteres')
    .max(60)
    .regex(/[A-Za-z]/, 'la contraseña debe incluir letras')
    .regex(/\d/, 'la contraseña debe incluir números')
    .optional()
    .or(z.literal(''))
});

const cambioSchema = z.object({
  rol: z.enum([ROLES.admin, ROLES.trabajador, ROLES.ciudadano], { message: 'rol inválido' }).optional(),
  activo: z.boolean().optional()
});

const router = Router();
router.use(autenticar);

router.get('/perfil', ah(async (req, res) => {
  res.json(await servicio.obtenerPerfil(req.usuario!.id));
}));

router.put('/perfil', validar(perfilSchema), ah(async (req, res) => {
  res.json(await servicio.actualizarPerfil(req.usuario!.id, res.locals.body));
}));

router.get('/', permitir(ROLES.admin), validar(consultaListado, 'query'), ah(async (_req, res) => {
  res.json(await servicio.listar(res.locals.query));
}));

router.patch('/:id', permitir(ROLES.admin), validar(idParam, 'params'), validar(cambioSchema), ah(async (req, res) => {
  res.json(await servicio.cambiar(res.locals.params.id, res.locals.body, req.usuario!.id));
}));

export default router;
