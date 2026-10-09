import { calcularEdad, etiqueta, textoEdad } from './utils';

describe('utilidades', () => {
  it('convierte guiones bajos en espacios', () => {
    expect(etiqueta('en_riesgo')).toBe('en riesgo');
  });

  it('calcula la edad según la fecha de nacimiento', () => {
    expect(calcularEdad('2016-05-10', new Date(2026, 4, 9))).toBe(9);
    expect(calcularEdad('2016-05-10', new Date(2026, 4, 10))).toBe(10);
    expect(calcularEdad(null)).toBeNull();
  });

  it('muestra un texto legible de la edad', () => {
    expect(textoEdad(null)).toBe('sin dato');
  });
});
