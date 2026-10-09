import { AbstractControl } from '@angular/forms';

export function etiqueta(valor: string | null | undefined): string {
  return (valor ?? '').replace(/_/g, ' ');
}

export function calcularEdad(fecha: string | null | undefined, hoy: Date = new Date()): number | null {
  if (!fecha) return null;
  const nacimiento = new Date(`${fecha}T00:00:00`);
  if (isNaN(nacimiento.getTime())) return null;
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const aunNoCumple = hoy.getMonth() < nacimiento.getMonth() || (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (aunNoCumple) edad--;
  return Math.max(edad, 0);
}

export function textoEdad(fecha: string | null | undefined): string {
  const edad = calcularEdad(fecha);
  if (edad === null) return 'sin dato';
  return edad === 1 ? '1 año' : edad === 0 ? 'menos de 1 año' : `${edad} años`;
}

export function mensajeControl(control: AbstractControl | null): string {
  const errores = control?.errors;
  if (!errores) return '';
  if (errores['required']) return 'este campo es obligatorio';
  if (errores['email']) return 'escribe un correo válido';
  if (errores['minlength']) return `escribe al menos ${errores['minlength'].requiredLength} caracteres`;
  if (errores['maxlength']) return `máximo ${errores['maxlength'].requiredLength} caracteres`;
  if (errores['min']) return `el valor mínimo es ${errores['min'].min}`;
  if (errores['max']) return `el valor máximo es ${errores['max'].max}`;
  if (errores['pattern']) {
    const patron = String(errores['pattern'].requiredPattern);
    return patron.includes('(?=') ? 'usa letras y números, mínimo 8 caracteres' : 'el formato no es válido';
  }
  if (errores['coincidir']) return 'las contraseñas no coinciden';
  return 'el valor no es válido';
}

export const patronTelefono = /^[0-9+\-\s]{8,20}$/;
export const patronClave = /^(?=.*[A-Za-z])(?=.*\d).{8,60}$/;
