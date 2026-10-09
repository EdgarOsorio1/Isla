export const ROLES = {
  admin: 'administrador',
  trabajador: 'trabajador_social',
  ciudadano: 'ciudadano'
} as const;

export const PERSONAL: string[] = [ROLES.admin, ROLES.trabajador];
