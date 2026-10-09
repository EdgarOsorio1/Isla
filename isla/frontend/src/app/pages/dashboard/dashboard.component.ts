import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, mensajeError } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ConteoEstado, Resumen } from '../../core/modelos';
import { etiqueta } from '../../core/utils';
import { EstadoComponent } from '../../shared/estado/estado.component';
import { ListaEstadoComponent } from '../../shared/vacio/vacio.component';

const textos: Record<string, string> = {
  alertas_pendientes: 'alertas por atender',
  ninos_en_riesgo: 'niños en riesgo',
  ninos_acogidos: 'niños acogidos',
  cupos_disponibles: 'cupos disponibles',
  asignaciones_pendientes: 'asignaciones por aprobar',
  mis_alertas: 'alertas que has reportado',
  pendientes: 'en espera de atención',
  atendidas: 'alertas atendidas'
};

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe, EstadoComponent, ListaEstadoComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  datos = signal<Resumen | null>(null);
  cargando = signal(true);
  error = signal('');
  nombre = computed(() => (this.auth.usuario()?.nombre ?? '').split(' ')[0]);
  subtitulo = computed(() =>
    this.auth.usuario()?.rol === 'ciudadano' ? 'aquí ves el estado de las alertas que has reportado.' : 'este es el resumen actual de los casos y los cupos.'
  );
  kpis = computed(() => {
    const d = this.datos();
    return d ? Object.entries(d.indicadores).map(([clave, valor]) => ({ clave, valor, texto: textos[clave] ?? etiqueta(clave) })) : [];
  });

  constructor() {
    this.api.obtener<Resumen>('dashboard').subscribe({
      next: (r) => {
        this.datos.set(r);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(mensajeError(e));
        this.cargando.set(false);
      }
    });
  }

  barras(lista: ConteoEstado[] | undefined) {
    const items = lista ?? [];
    const maximo = Math.max(1, ...items.map((i) => i.total));
    return items.map((i) => ({ ...i, etiqueta: etiqueta(i.estado), porcentaje: (i.total / maximo) * 100 }));
  }
}