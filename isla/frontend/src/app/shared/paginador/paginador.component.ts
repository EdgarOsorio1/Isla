import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-paginador',
  templateUrl: './paginador.component.html',
  styleUrl: './paginador.component.css'
})
export class PaginadorComponent {
  pagina = input.required<number>();
  paginas = input.required<number>();
  total = input.required<number>();
  cambiar = output<number>();
}