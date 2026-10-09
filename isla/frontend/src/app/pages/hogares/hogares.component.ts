import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { mensajeError } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { AvisosService } from '../../core/avisos.service';
import { ConfirmarService } from '../../core/confirmar.service';
import { ListadoBase } from '../../core/listado';
import { Hogar } from '../../core/modelos';
import { etiqueta, patronTelefono } from '../../core/utils';
import { CampoComponent } from '../../shared/campo/campo.component';
import { EstadoComponent } from '../../shared/estado/estado.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { PaginadorComponent } from '../../shared/paginador/paginador.component';
import { ListaEstadoComponent } from '../../shared/vacio/vacio.component';

@Component({
  selector: 'app-hogares',
  imports: [ReactiveFormsModule, CampoComponent, EstadoComponent, ModalComponent, PaginadorComponent, ListaEstadoComponent],
  templateUrl: './hogares.component.html',
  styleUrl: './hogares.component.css'
})
export class HogaresComponent extends ListadoBase<Hogar> {
  ruta = 'hogares';
  auth = inject(AuthService);
  private avisos = inject(AvisosService);
  private confirmar = inject(ConfirmarService);
  private fb = inject(FormBuilder);
  modal = signal(false);
  editando = signal<Hogar | null>(null);
  guardando = signal(false);
  errorForm = signal('');
  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    tipo: ['hogar_temporal', [Validators.required]],
    municipio: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    direccion: ['', [Validators.maxLength(160)]],
    telefono: ['', [Validators.pattern(patronTelefono)]],
    capacidad: [null as number | null, [Validators.required, Validators.min(1), Validators.max(200)]],
    activo: [true]
  });

  constructor() {
    super();
    this.cargar();
  }

  tipo(valor: string) {
    return etiqueta(valor);
  }

  estadoDe(h: Hogar) {
    if (!h.activo) return 'inactivo';
    return h.ocupados >= h.capacidad ? 'lleno' : 'disponible';
  }

  abrir(hogar?: Hogar) {
    this.errorForm.set('');
    this.editando.set(hogar ?? null);
    this.form.reset({
      nombre: hogar?.nombre ?? '',
      tipo: hogar?.tipo ?? 'hogar_temporal',
      municipio: hogar?.municipio ?? '',
      direccion: hogar?.direccion ?? '',
      telefono: hogar?.telefono ?? '',
      capacidad: hogar?.capacidad ?? null,
      activo: hogar ? !!hogar.activo : true
    });
    this.modal.set(true);
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const cuerpo = { ...v, direccion: v.direccion || null, telefono: v.telefono || null };
    const actual = this.editando();
    this.guardando.set(true);
    this.errorForm.set('');
    const peticion = actual ? this.api.actualizar(`hogares/${actual.id}`, cuerpo) : this.api.crear('hogares', cuerpo);
    peticion.subscribe({
      next: () => {
        this.avisos.exito(actual ? 'hogar actualizado' : 'hogar registrado');
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

  async eliminar(h: Hogar) {
    if (!(await this.confirmar.pedir('eliminar hogar', `se eliminará "${h.nombre}". esta acción no se puede deshacer.`, 'eliminar', true))) return;
    this.api.eliminar(`hogares/${h.id}`).subscribe({
      next: () => {
        this.avisos.exito('hogar eliminado');
        this.cargar();
      },
      error: (e) => this.avisos.error(mensajeError(e))
    });
  }
}