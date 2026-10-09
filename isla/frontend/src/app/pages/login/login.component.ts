import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { mensajeError } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { AuthMarcoComponent } from '../../shared/auth-marco/auth-marco.component';
import { CampoComponent } from '../../shared/campo/campo.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, AuthMarcoComponent, CampoComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  cargando = signal(false);
  error = signal('');
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    clave: ['', [Validators.required]]
  });

  entrar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    const { email, clave } = this.form.getRawValue();
    this.auth.login(email, clave).subscribe({
      next: () => this.router.navigate(['/panel']),
      error: (e) => {
        this.error.set(mensajeError(e));
        this.cargando.set(false);
      }
    });
  }
}