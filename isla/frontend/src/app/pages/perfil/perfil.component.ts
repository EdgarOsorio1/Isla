import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, mensajeError } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { AvisosService } from '../../core/avisos.service';
import { Usuario } from '../../core/modelos';
import { etiqueta, patronClave, patronTelefono } from '../../core/utils';
import { CampoComponent } from '../../shared/campo/campo.component';
import { ListaEstadoComponent } from '../../shared/vacio/vacio.component';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, CampoComponent, ListaEstadoComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private avisos = inject(AvisosService);
  private fb = inject(FormBuilder);
  cargando = signal(true);
  guardando = signal(false);
  errorCarga = signal('');
  errorForm = signal('');
  email = signal('');
  rol = signal('');
  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    telefono: ['', [Validators.pattern(patronTelefono)]],
    clave: ['', [Validators.pattern(patronClave)]]
  });

  constructor() {
    this.api.obtener<Usuario>('usuarios/perfil').subscribe({
      next: (u) => {
        this.email.set(u.email);
        this.rol.set(etiqueta(u.rol));
        this.form.patchValue({ nombre: u.nombre, telefono: u.telefono ?? '' });
        this.cargando.set(false);
      },
      error: (e) => {
        this.errorCarga.set(mensajeError(e));
        this.cargando.set(false);
      }
    });
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.guardando.set(true);
    this.errorForm.set('');
    this.api.actualizar<Usuario>('usuarios/perfil', { nombre: v.nombre, telefono: v.telefono || null, clave: v.clave || undefined }).subscribe({
      next: (u) => {
        this.auth.actualizarUsuario({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol });
        this.form.patchValue({ clave: '' });
        this.avisos.exito('perfil actualizado');
        this.guardando.set(false);
      },
      error: (e) => {
        this.errorForm.set(mensajeError(e));
        this.guardando.set(false);
      }
    });
  }
}