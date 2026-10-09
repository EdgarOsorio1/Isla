import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { mensajeControl } from '../../core/utils';

@Component({
  selector: 'app-campo',
  templateUrl: './campo.component.html',
  styleUrl: './campo.component.css'
})
export class CampoComponent {
  etiqueta = input.required<string>();
  para = input.required<string>();
  control = input<AbstractControl | null>(null);
  ayuda = input('');

  mostrarError() {
    const c = this.control();
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  mensaje() {
    return mensajeControl(this.control());
  }
}