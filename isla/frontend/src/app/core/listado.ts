import { inject, signal } from '@angular/core';
import { ApiService, mensajeError } from './api.service';

export abstract class ListadoBase<T> {
  protected api = inject(ApiService);
  abstract ruta: string;
  datos = signal<T[]>([]);
  total = signal(0);
  pagina = signal(1);
  paginas = signal(1);
  cargando = signal(true);
  error = signal('');
  q = '';
  estado = '';

  cargar() {
    this.cargando.set(true);
    this.error.set('');
    this.api.listar<T>(this.ruta, { pagina: this.pagina(), limite: 8, q: this.q, estado: this.estado }).subscribe({
      next: (r) => {
        this.datos.set(r.datos);
        this.total.set(r.total);
        this.paginas.set(r.paginas);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(mensajeError(e));
        this.cargando.set(false);
      }
    });
  }

  buscar(q: string, estado: string) {
    this.q = q.trim();
    this.estado = estado;
    this.pagina.set(1);
    this.cargar();
  }

  irA(pagina: number) {
    this.pagina.set(pagina);
    this.cargar();
  }
}
