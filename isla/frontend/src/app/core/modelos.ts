export type Rol = 'administrador' | 'trabajador_social' | 'ciudadano';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  telefono?: string | null;
  activo?: number;
  creado_en?: string;
}

export interface Sesion {
  token: string;
  usuario: Usuario;
}

export interface Pagina<T> {
  datos: T[];
  total: number;
  pagina: number;
  limite: number;
  paginas: number;
}

export interface Hogar {
  id: number;
  nombre: string;
  tipo: 'hogar_temporal' | 'familia_acogida' | 'centro_proteccion';
  direccion: string | null;
  municipio: string;
  telefono: string | null;
  capacidad: number;
  ocupados: number;
  activo: number;
}

export interface Alerta {
  id: number;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  edad_aprox: number | null;
  prioridad: 'baja' | 'media' | 'alta';
  estado: 'pendiente' | 'en_revision' | 'atendida' | 'descartada';
  reportante: string;
  creado_en: string;
}

export interface Nino {
  id: number;
  alerta_id: number | null;
  alerta_titulo: string | null;
  nombres: string;
  apellidos: string | null;
  fecha_nacimiento: string | null;
  sexo: 'f' | 'm';
  estado: 'en_riesgo' | 'en_proceso' | 'acogido' | 'reintegrado';
  observaciones: string | null;
}

export interface Asignacion {
  id: number;
  nino_id: number;
  hogar_id: number;
  nino: string;
  hogar: string;
  solicitante: string;
  resolutor: string | null;
  motivo: string;
  respuesta: string | null;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'completada';
  creado_en: string;
}

export interface ConteoEstado {
  estado: string;
  total: number;
}

export interface Resumen {
  tipo: 'personal' | 'ciudadano';
  indicadores: Record<string, number>;
  alertas_por_estado?: ConteoEstado[];
  asignaciones_por_estado?: ConteoEstado[];
  ultimas_alertas: { id: number; titulo: string; ubicacion: string; prioridad: string; estado: string; creado_en: string }[];
}
