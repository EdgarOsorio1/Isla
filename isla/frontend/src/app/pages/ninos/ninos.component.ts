import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { AvisosService } from '../../core/avisos.service';
import { ConfirmarService } from '../../core/confirmar.service';
import { ListadoBase } from '../../core/listado';
import { Nino } from '../../core/modelos';
import { textoEdad } from '../../core/utils';
import { CampoComponent } from '../../shared/campo/campo.component';
import { EstadoComponent } from '../../shared/estado/estado.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { PaginadorComponent } from '../../shared/paginador/paginador.component';
import { ListaEstadoComponent } from '../../shared/vacio/vacio.component';

@Component({
  selector: 'app-ninos',
  imports: [ReactiveFormsModule, CampoComponent, EstadoComponent, ModalComponent, PaginadorComponent, ListaEstadoComponent],
  templateUrl: './ninos.component.html',
  styleUrl: './ninos.component.css'
})
export class NinosComponent extends ListadoBase<Nino> {
  ruta = 'ninos';
  auth = inject(AuthService);
  private avisos = inject(AvisosService);
  private confirmar = inject(ConfirmarService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private rutaActiva = inject(ActivatedRoute);
  hoy = new Date().toISOString().slice(0, 10);
  modal = signal(false);
  editando = signal<Nino | null>(null);
  alertaOrigen = signal<number | null>(null);
  guardando = signal(false);
  errorForm = signal('');
  form = this.fb.group({
    nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    apellidos: ['', [Validators.maxLength(80)]],
    fecha_nacimiento: [''],
    sexo: ['f', [Validators.required]],
    estado: ['en_riesgo'],
    observaciones: ['', [Validators.maxLength(500)]]
  });

  constructor() {
    super();
    this.cargar();
    const alerta = Number(this.rutaActiva.snapshot.queryParamMap.get('alerta'));
    if (alerta) {
      this.abrir();
      this.alertaOrigen.set(alerta);
    }
  }

  edad(fecha: string | null) {
    return textoEdad(fecha);
  }

  abrir(nino?: Nino) {
    this.errorForm.set('');
    this.alertaOrigen.set(null);
    this.editando.set(nino ?? null);
    this.form.reset({
      nombres: nino?.nombres ?? '',
      apellidos: nino?.apellidos ?? '',
      fecha_nacimiento: nino?.fecha_nacimiento ?? '',
      sexo: nino?.sexo ?? 'f',
      estado: nino?.estado ?? 'en_riesgo',
      observaciones: nino?.observaciones ?? ''
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
    const cuerpo = {
      nombres: v.nombres,
      apellidos: v.apellidos || null,
      fecha_nacimiento: v.fecha_nacimiento || null,
      sexo: v.sexo,
      estado: actual ? v.estado : undefined,
      observaciones: v.observaciones || null,
      alerta_id: actual ? undefined : this.alertaOrigen()
    };
    this.guardando.set(true);
    this.errorForm.set('');
    const peticion = actual ? this.api.actualizar(`ninos/${actual.id}`, cuerpo) : this.api.crear('ninos', cuerpo);
    peticion.subscribe({
      next: () => {
        this.avisos.exito(actual ? 'datos del niño actualizados' : 'niño registrado');
        this.guardando.set(false);
        this.modal.set(false);
        if (this.alertaOrigen()) this.router.navigate(['/ninos'], { replaceUrl: true });
        this.alertaOrigen.set(null);
        this.cargar();
      },
      error: (e) => {
        this.errorForm.set(mensajeError(e));
        this.guardando.set(false);
      }
    });
  }

  asignar(n: Nino) {
    this.router.navigate(['/asignaciones'], { queryParams: { nino: n.id } });
  }

  async eliminar(n: Nino) {
    if (!(await this.confirmar.pedir('eliminar registro', `se eliminará el registro de ${n.nombres}. esta acción no se puede deshacer.`, 'eliminar', true))) return;
    this.api.eliminar(`ninos/${n.id}`).subscribe({
      next: () => {
        this.avisos.exito('registro eliminado');
        this.cargar();
      },
      error: (e) => this.avisos.error(mensajeError(e))
    });
  }
}