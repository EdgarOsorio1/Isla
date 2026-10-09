import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { apiUrl } from './config';
import { Pagina } from './modelos';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  listar<T>(ruta: string, filtros: Record<string, string | number | null | undefined> = {}) {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor !== '' && valor !== null && valor !== undefined) params = params.set(clave, String(valor));
    }
    return this.http.get<Pagina<T>>(`${apiUrl}/${ruta}`, { params });
  }

  obtener<T>(ruta: string) {
    return this.http.get<T>(`${apiUrl}/${ruta}`);
  }

  crear<T>(ruta: string, cuerpo: unknown) {
    return this.http.post<T>(`${apiUrl}/${ruta}`, cuerpo);
  }

  actualizar<T>(ruta: string, cuerpo: unknown) {
    return this.http.put<T>(`${apiUrl}/${ruta}`, cuerpo);
  }

  parcial<T>(ruta: string, cuerpo: unknown = {}) {
    return this.http.patch<T>(`${apiUrl}/${ruta}`, cuerpo);
  }

  eliminar(ruta: string) {
    return this.http.delete<void>(`${apiUrl}/${ruta}`);
  }
}

export function mensajeError(error: unknown): string {
  const e = error as HttpErrorResponse;
  if (e?.status === 0) return 'no hay conexión con el servidor. verifica que el backend esté encendido.';
  const detalles = e?.error?.detalles as { mensaje: string }[] | undefined;
  if (detalles?.length) return detalles.map((d) => d.mensaje).join('. ');
  return e?.error?.error || 'ocurrió un error inesperado. intenta de nuevo.';
}
