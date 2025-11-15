import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantesComponent } from './componentes/restaurantes/restaurantes.component';
import { ZonasComponent } from './componentes/zonas/zonas.component';
import { MesasComponent } from './componentes/mesas/mesas.component';
import { HorariosComponent } from './componentes/horarios/horarios.component';
import { NuevaReservaComponent } from './componentes/nueva-reserva/nueva-reserva.component';
import { ListadoReservasComponent } from './componentes/listado-reserva/listado-reservas.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RestaurantesComponent,
    ZonasComponent,
    MesasComponent,
    HorariosComponent,
    NuevaReservaComponent,
    ListadoReservasComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  pestanaActiva = 'restaurantes';

  cambiarPestana(pestana: string) {
    this.pestanaActiva = pestana;
  }

  alCrearReserva() {
    this.pestanaActiva = 'listado';
  }
}
