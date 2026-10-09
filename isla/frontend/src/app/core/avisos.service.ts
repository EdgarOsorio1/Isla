import { Injectable, signal } from '@angular/core';

export interface Aviso {
  id: number;
  tipo: 'exito' | 'error' | 'info';
  texto: string;
}

@Injectable({ providedIn: 'root' })
export class AvisosService {
  avisos = signal<Aviso[]>([]);
  private contador = 0;

  mostrar(tipo: Aviso['tipo'], texto: string) {
    const id = ++this.contador;
    this.avisos.update((lista) => [...lista, { id, tipo, texto }]);
    setTimeout(() => this.quitar(id), 5000);
  }

  exito(texto: string) {
    this.mostrar('exito', texto);
  }

  error(texto: string) {
    this.mostrar('error', texto);
  }

  quitar(id: number) {
    this.avisos.update((lista) => lista.filter((a) => a.id !== id));
  }
}
