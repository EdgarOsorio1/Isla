import { Router } from 'express';
import { z } from 'zod';
import { autenticar } from '../middleware/auth';
import { validar } from '../middleware/validar';
import * as controlador from '../controllers/auth.controller';

const registroSchema = z.object({
  nombre: z.string().trim().min(3, 'el nombre debe tener al menos 3 caracteres').max(80, 'el nombre es demasiado largo'),
  email: z.string().trim().toLowerCase().email('el correo no es válido').max(120),
  clave: z
    .string()
    .min(8, 'la contraseña debe tener al menos 8 caracteres')
    .max(60, 'la contraseña es demasiado larga')
    .regex(/[A-Za-z]/, 'la contraseña debe incluir letras')
    .regex(/\d/, 'la contraseña debe incluir números'),
  telefono: z.string().trim().regex(/^[0-9+\-\s]{8,20}$/, 'el teléfono no es válido').optional().or(z.literal(''))
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('el correo no es válido'),
  clave: z.string().min(1, 'la contraseña es obligatoria')
});

const router = Router();

router.post('/registro', validar(registroSchema), controlador.registro);
router.post('/login', validar(loginSchema), controlador.login);
router.get('/me', autenticar, controlador.me);

export default router;
