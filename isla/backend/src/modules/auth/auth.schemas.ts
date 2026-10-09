import { z } from 'zod';

export const registroSchema = z.object({
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

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('el correo no es válido'),
  clave: z.string().min(1, 'la contraseña es obligatoria')
});
