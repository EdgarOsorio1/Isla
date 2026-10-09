import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { mensajeError } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { patronClave, patronTelefono } from '../../core/utils';
import { AuthMarcoComponent } from '../../shared/auth-marco/auth-marco.component';
import { CampoComponent } from '../../shared/campo/campo.component';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, AuthMarcoComponent, CampoComponent],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  cargando = signal(false);
  error = signal('');
  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.pattern(patronTelefono)]],
    clave: ['', [Validators.required, Validators.pattern(patronClave)]],
    confirmar: ['', [Validators.required, (c: AbstractControl) => (c.parent?.get('clave')?.value === c.value ? null : { coincidir: true })]]
  });

  constructor() {
    this.form.controls.clave.valueChanges.subscribe(() => this.form.controls.confirmar.updateValueAndValidity());
  }

  registrar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    const { nombre, email, telefono, clave } = this.form.getRawValue();
    this.auth.registro({ nombre, email, clave, telefono }).subscribe({
      next: () => this.router.navigate(['/panel']),
      error: (e) => {
        this.error.set(mensajeError(e));
        this.cargando.set(false);
      }
    });
  }
}