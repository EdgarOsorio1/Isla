import { Injectable, signal } from '@angular/core';

export interface Confirmacion {
  titulo: string;
  texto: string;
  accion: string;
  peligro: boolean;
  resolver: (valor: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmarService {
  pendiente = signal<Confirmacion | null>(null);

  pedir(titulo: string, texto: string, accion = 'confirmar', peligro = false): Promise<boolean> {
    return new Promise((resolver) => this.pendiente.set({ titulo, texto, accion, peligro, resolver }));
  }

  responder(valor: boolean) {
    this.pendiente()?.resolver(valor);
    this.pendiente.set(null);
  }
}
