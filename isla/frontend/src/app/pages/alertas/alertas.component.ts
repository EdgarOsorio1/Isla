import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { mensajeError } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { AvisosService } from '../../core/avisos.service';
import { ConfirmarService } from '../../core/confirmar.service';
import { ListadoBase } from '../../core/listado';
import { Alerta } from '../../core/modelos';
import { CampoComponent } from '../../shared/campo/campo.component';
import { EstadoComponent } from '../../shared/estado/estado.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { PaginadorComponent } from '../../shared/paginador/paginador.component';
import { ListaEstadoComponent } from '../../shared/vacio/vacio.component';

@Component({
  selector: 'app-alertas',
  imports: [ReactiveFormsModule, DatePipe, CampoComponent, EstadoComponent, ModalComponent, PaginadorComponent, ListaEstadoComponent],
  templateUrl: './alertas.component.html',
  styleUrl: './alertas.component.css'
})
export class AlertasComponent extends ListadoBase<Alerta> {
  ruta = 'alertas';
  auth = inject(AuthService);
  private avisos = inject(AvisosService);
  private confirmar = inject(ConfirmarService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  modal = signal(false);
  detalle = signal<Alerta | null>(null);
  editando = signal<Alerta | null>(null);
  guardando = signal(false);
  errorForm = signal('');
  form = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(120)]],
    descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    ubicacion: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(160)]],
    edad_aprox: [null as number | null, [Validators.min(0), Validators.max(17)]],
    prioridad: ['media', [Validators.required]],
    estado: ['pendiente']
  });

  constructor() {
    super();
    this.cargar();
  }

  esPersonal() {
    return this.auth.tieneRol('administrador', 'trabajador_social');
  }

  abrir(alerta?: Alerta) {
    this.errorForm.set('');
    this.editando.set(alerta ?? null);
    this.form.reset({
      titulo: alerta?.titulo ?? '',
      descripcion: alerta?.descripcion ?? '',
      ubicacion: alerta?.ubicacion ?? '',
      edad_aprox: alerta?.edad_aprox ?? null,
      prioridad: alerta?.prioridad ?? 'media',
      estado: alerta?.estado ?? 'pendiente'
    });
    this.modal.set(true);
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const actual = this.editando();
    const cuerpo = actual ? v : { ...v, estado: undefined };
    this.guardando.set(true);
    this.errorForm.set('');
    const peticion = actual ? this.api.actualizar(`alertas/${actual.id}`, cuerpo) : this.api.crear('alertas', cuerpo);
    peticion.subscribe({
      next: () => {
        this.avisos.exito(actual ? 'alerta actualizada' : 'alerta enviada, gracias por avisar');
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

  registrarNino(a: Alerta) {
    this.router.navigate(['/ninos'], { queryParams: { alerta: a.id } });
  }

  async eliminar(a: Alerta) {
    if (!(await this.confirmar.pedir('eliminar alerta', `se eliminará la alerta "${a.titulo}". esta acción no se puede deshacer.`, 'eliminar', true))) return;
    this.api.eliminar(`alertas/${a.id}`).subscribe({
      next: () => {
        this.avisos.exito('alerta eliminada');
        this.cargar();
      },
      error: (e) => this.avisos.error(mensajeError(e))
    });
  }
}