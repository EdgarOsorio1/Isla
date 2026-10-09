import { Component, computed, input } from '@angular/core';
import { etiqueta } from '../../core/utils';

@Component({
  selector: 'app-estado',
  templateUrl: './estado.component.html',
  styleUrl: './estado.component.css'
})
export class EstadoComponent {
  valor = input.required<string>();
  texto = computed(() => etiqueta(this.valor()));
}