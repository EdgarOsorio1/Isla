import { Component, input } from '@angular/core';

@Component({
  selector: 'app-lista-estado',
  templateUrl: './vacio.component.html',
  styleUrl: './vacio.component.css'
})
export class ListaEstadoComponent {
  cargando = input(false);
  error = input('');
  vacio = input(false);
  titulo = input('');
  detalle = input('');
}