import { describe, expect, it } from 'vitest';
import { firmar, verificar } from '../src/utils/jwt';
import { comparar, hashear } from '../src/utils/password';

describe('contraseñas', () => {
  it('guarda un hash distinto a la contraseña y lo valida', async () => {
    const hash = await hashear('Isla2026!');
    expect(hash).not.toBe('Isla2026!');
    expect(await comparar('Isla2026!', hash)).toBe(true);
  });

  it('rechaza una contraseña incorrecta', async () => {
    const hash = await hashear('Isla2026!');
    expect(await comparar('otraClave1', hash)).toBe(false);
  });
});

describe('tokens', () => {
  it('firma y verifica la carga del usuario', () => {
    const carga = verificar(firmar({ id: 7, rol: 'ciudadano' }));
    expect(carga.id).toBe(7);
    expect(carga.rol).toBe('ciudadano');
  });

  it('rechaza un token alterado', () => {
    expect(() => verificar('token.invalido.firma')).toThrow();
  });
});
