import { describe, expect, it } from 'vitest';
import { loginSchema, registroSchema } from '../src/modules/auth/auth.schemas';

describe('validación de registro', () => {
  it('acepta datos correctos y normaliza el correo', () => {
    const r = registroSchema.safeParse({ nombre: 'Ana Pérez', email: 'ANA@isla.org', clave: 'Segura2026' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe('ana@isla.org');
  });

  it('rechaza contraseñas débiles', () => {
    expect(registroSchema.safeParse({ nombre: 'Ana Pérez', email: 'ana@isla.org', clave: 'abc' }).success).toBe(false);
    expect(registroSchema.safeParse({ nombre: 'Ana Pérez', email: 'ana@isla.org', clave: 'sololetras' }).success).toBe(false);
  });

  it('rechaza correos inválidos en el login', () => {
    expect(loginSchema.safeParse({ email: 'no-es-correo', clave: 'x' }).success).toBe(false);
  });
});
