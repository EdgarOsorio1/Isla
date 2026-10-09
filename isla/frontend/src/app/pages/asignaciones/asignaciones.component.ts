import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { mensajeError } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { AvisosService } from '../../core/avisos.service';
import { ConfirmarService } from '../../core/confirmar.service';
import { ListadoBase } from '../../core/listado';
import { Asignacion } from '../../core/modelos';
import { CampoComponent } from '../../shared/campo/campo.component';
import { EstadoComponent } from '../../shared/estado/estado.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { PaginadorComponent } from '../../shared/paginador/paginador.component';
import { ListaEstadoComponent } from '../../shared/vacio/vacio.component';

interface Opcion {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-asignaciones',
  imports: [ReactiveFormsModule, DatePipe, CampoComponent, EstadoComponent, ModalComponent, PaginadorComponent, ListaEstadoComponent],
  templateUrl: './asignaciones.component.html',
  styleUrl: './asignaciones.component.css'
})
export class AsignacionesComponent extends ListadoBase<Asignacion> {
  ruta = 'asignaciones';
  auth = inject(AuthService);
  private avisos = inject(AvisosService);
  private confirmar = inject(ConfirmarService);
  private fb = inject(FormBuilder);
  private rutaActiva = inject(ActivatedRoute);
  modal = signal(false);
  guardando = signal(false);
  errorForm = signal('');
  ninos = signal<Opcion[]>([]);
  hogares = signal<Opcion[]>([]);
  rechazando = signal<Asignacion | null>(null);
  motivoRechazo = this.fb.nonNullable.control('', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]);
  form = this.fb.group({
    nino_id: [null as number | null, [Validators.required]],
    hogar_id: [null as number | null, [Validators.required]],
    motivo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
  });

  constructor() {
    super();
    this.cargar();
    const nino = Number(this.rutaActiva.snapshot.queryParamMap.get('nino'));
    if (nino) this.abrir(nino);
  }

  abrir(nino: number | null = null) {
    this.errorForm.set('');
    this.form.reset({ nino_id: nino, hogar_id: null, motivo: '' });
    this.api.obtener<Opcion[]>('ninos/disponibles').subscribe({ next: (r) => this.ninos.set(r), error: (e) => this.errorForm.set(mensajeError(e)) });
    this.api.obtener<Opcion[]>('hogares/disponibles').subscribe({ next: (r) => this.hogares.set(r), error: (e) => this.errorForm.set(mensajeError(e)) });
    this.modal.set(true);
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.errorForm.set('');
    this.api.crear('asignaciones', this.form.getRawValue()).subscribe({
      next: () => {
        this.avisos.exito('solicitud enviada para aprobación');
        this.guardando.set(false);
        this.modal.set(false);
        this.cargar();
      },
      error: (e) => {
        this.errorForm.set(mensajeError(e));
        this.guardando.set(false);
      }
    });
  }

  async aprobar(a: Asignacion) {
    if (!(await this.confirmar.pedir('aprobar asignación', `se reservará un cupo en ${a.hogar} para ${a.nino}.`, 'aprobar'))) return;
    this.api.parcial(`asignaciones/${a.id}/resolver`, { accion: 'aprobar' }).subscribe({
      next: () => {
        this.avisos.exito('asignación aprobada');
        this.cargar();
      },
      error: (e) => this.avisos.error(mensajeError(e))
    });
  }

  abrirRechazo(a: Asignacion) {
    this.motivoRechazo.reset('');
    this.rechazando.set(a);
  }

  rechazar() {
    const a = this.rechazando();
    if (!a) return;
    if (this.motivoRechazo.invalid) {
      this.motivoRechazo.markAsTouched();
      return;
    }
    this.api.parcial(`asignaciones/${a.id}/resolver`, { accion: 'rechazar', respuesta: this.motivoRechazo.value }).subscribe({
      next: () => {
        this.avisos.exito('solicitud rechazada');
        this.rechazando.set(null);
        this.cargar();
      },
      error: (e) => this.avisos.error(mensajeError(e))
    });
  }

  async completar(a: Asignacion) {
    if (!(await this.confirmar.pedir('confirmar traslado', `${a.nino} quedará como acogido en ${a.hogar}.`, 'confirmar traslado'))) return;
    this.api.parcial(`asignaciones/${a.id}/completar`).subscribe({
      next: () => {
        this.avisos.exito('traslado confirmado');
        this.cargar();
      },
      error: (e) => this.avisos.error(mensajeError(e))
    });
  }
}