import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { apiUrl } from './config';
import { Rol, Sesion, Usuario } from './modelos';

const CLAVE_SESION = 'isla_sesion';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private estado = signal<Sesion | null>(this.leer());

  usuario = computed(() => this.estado()?.usuario ?? null);
  token = computed(() => this.estado()?.token ?? null);
  autenticado = computed(() => this.estado() !== null);

  private leer(): Sesion | null {
    try {
      const guardada = localStorage.getItem(CLAVE_SESION);
      return guardada ? (JSON.parse(guardada) as Sesion) : null;
    } catch {
      return null;
    }
  }

  private guardar(sesion: Sesion) {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    this.estado.set(sesion);
  }

  login(email: string, clave: string) {
    return this.http.post<Sesion>(`${apiUrl}/auth/login`, { email, clave }).pipe(tap((s) => this.guardar(s)));
  }

  registro(datos: { nombre: string; email: string; clave: string; telefono?: string }) {
    return this.http.post<Sesion>(`${apiUrl}/auth/registro`, datos).pipe(tap((s) => this.guardar(s)));
  }

  actualizarUsuario(usuario: Usuario) {
    const actual = this.estado();
    if (actual) this.guardar({ token: actual.token, usuario });
  }

  cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
    this.estado.set(null);
    this.router.navigate(['/login']);
  }

  tieneRol(...roles: Rol[]) {
    const u = this.usuario();
    return !!u && roles.includes(u.rol);
  }
}
