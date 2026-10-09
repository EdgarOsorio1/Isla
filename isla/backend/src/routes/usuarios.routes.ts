import { Router } from 'express';
import { z } from 'zod';
import { autenticar, permitir } from '../middleware/auth';
import { validar } from '../middleware/validar';
import { consultaListado, idParam } from '../utils/paginacion';
import { ROLES } from '../utils/roles';
import * as controlador from '../controllers/usuarios.controller';

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

router.get('/perfil', controlador.obtenerPerfil);
router.put('/perfil', validar(perfilSchema), controlador.actualizarPerfil);
router.get('/', permitir(ROLES.admin), validar(consultaListado, 'query'), controlador.listar);
router.patch('/:id', permitir(ROLES.admin), validar(idParam, 'params'), validar(cambioSchema), controlador.cambiar);

export default router;
