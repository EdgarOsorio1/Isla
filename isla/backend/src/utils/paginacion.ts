import { z } from 'zod';

export const consultaListado = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(50).default(8),
  q: z.string().trim().max(80).optional(),
  estado: z.string().trim().max(30).optional()
});

export type ConsultaListado = z.infer<typeof consultaListado>;

export const idParam = z.object({ id: z.coerce.number().int().positive('id inválido') });

export function respuestaPaginada<T>(datos: T[], total: number, c: { pagina: number; limite: number }) {
  return { datos, total, pagina: c.pagina, limite: c.limite, paginas: Math.max(1, Math.ceil(total / c.limite)) };
}
