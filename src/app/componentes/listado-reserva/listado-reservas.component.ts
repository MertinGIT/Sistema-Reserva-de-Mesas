import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlmacenamientoService } from '../../servicios/almacenamiento.service';
import { Restaurante, Zona, Mesa, Reserva } from '../../modelos/interfaces';

@Component({
  selector: 'app-listado-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tab-content">
      <h2>Listado de Reservas</h2>
      
      <div class="filters">
        <div class="form-group">
          <label><i class="fas fa-filter"></i> Filtrar por Restaurante</label>
          <select [(ngModel)]="filtroRestaurante" name="filtroRestaurante">
            <option value="">Todos</option>
            <option *ngFor="let r of restaurantes" [value]="r.id">{{ r.nombre }}</option>
          </select>
        </div>
        <div class="form-group">
          <label><i class="fas fa-filter"></i> Filtrar por Zona</label>
          <select [(ngModel)]="filtroZona" name="filtroZona">
            <option value="">Todas</option>
            <option *ngFor="let z of obtenerZonasPorRestaurante(filtroRestaurante)" [value]="z.id">
              {{ z.nombre }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label><i class="fas fa-filter"></i> Filtrar por Fecha</label>
          <input type="date" [(ngModel)]="filtroFecha" name="filtroFecha">
        </div>
      </div>

      <div class="list">
        <div *ngFor="let reserva of obtenerReservasFiltradas()" class="list-item reservation-item">
          <div class="list-item-content">
            <h3><i class="fas fa-user"></i> {{ reserva.nombre }} {{ reserva.apellido }}</h3>
            <div class="info-row">
              <span class="badge"><i class="fas fa-calendar-alt"></i> {{ reserva.fecha }}</span>
              <span class="badge"><i class="far fa-clock"></i> {{ reserva.hora }}</span>
              <span class="badge"><i class="fas fa-users"></i> {{ reserva.cantidadPersonas }} personas</span>
            </div>
            <div class="info-row">
              <span class="badge"><i class="fas fa-table"></i> Mesa {{ obtenerNumeroMesa(reserva.idMesaAsignada) }}</span>
              <span class="badge"><i class="fas fa-map-marker-alt"></i> {{ obtenerNombreZonaPorMesa(reserva.idMesaAsignada) }}</span>
              <span class="badge"><i class="fas fa-store"></i> {{ obtenerNombreRestaurantePorMesa(reserva.idMesaAsignada) }}</span>
            </div>
            <div class="info-row">
              <span class="badge"><i class="fas fa-phone"></i> {{ reserva.telefono }}</span>
            </div>
          </div>
          <div class="list-item-actions">
            <button (click)="eliminar(reserva.id)" class="btn-icon" title="Eliminar">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        <div *ngIf="obtenerReservasFiltradas().length === 0" class="empty-state">
          <i class="fas fa-inbox fa-3x"></i>
          <p>No hay reservas que coincidan con los filtros</p>
        </div>
      </div>
    </div>
  `
})
export class ListadoReservasComponent implements OnInit {
  restaurantes: Restaurante[] = [];
  zonas: Zona[] = [];
  mesas: Mesa[] = [];
  reservas: Reserva[] = [];

  filtroRestaurante = '';
  filtroZona = '';
  filtroFecha = '';

  constructor(private almacenamientoService: AlmacenamientoService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.restaurantes = this.almacenamientoService.obtenerRestaurantes();
    this.zonas = this.almacenamientoService.obtenerZonas();
    this.mesas = this.almacenamientoService.obtenerMesas();
    this.reservas = this.almacenamientoService.obtenerReservas();
  }

  eliminar(id: string) {
    if (!confirm('¿Eliminar esta reserva?')) return;

    this.reservas = this.reservas.filter(r => r.id !== id);
    this.almacenamientoService.guardarReservas(this.reservas);
  }

  obtenerReservasFiltradas(): Reserva[] {
    return this.reservas.filter(r => {
      const mesa = this.mesas.find(m => m.id === r.idMesaAsignada);
      if (!mesa) return false;

      const zona = this.zonas.find(z => z.id === mesa.zonaId);
      if (!zona) return false;

      if (this.filtroRestaurante && zona.restauranteId !== this.filtroRestaurante) return false;
      if (this.filtroZona && mesa.zonaId !== this.filtroZona) return false;
      if (this.filtroFecha && r.fecha !== this.filtroFecha) return false;

      return true;
    });
  }

  obtenerZonasPorRestaurante(restauranteId: string): Zona[] {
    return this.zonas.filter(z => z.restauranteId === restauranteId);
  }

  obtenerNumeroMesa(mesaId: string): string {
    const mesa = this.mesas.find(m => m.id === mesaId);
    return mesa ? mesa.numero : 'N/A';
  }

  obtenerNombreZonaPorMesa(mesaId: string): string {
    const mesa = this.mesas.find(m => m.id === mesaId);
    if (!mesa) return 'N/A';
    const zona = this.zonas.find(z => z.id === mesa.zonaId);
    return zona ? zona.nombre : 'N/A';
  }

  obtenerNombreRestaurantePorMesa(mesaId: string): string {
    const mesa = this.mesas.find(m => m.id === mesaId);
    if (!mesa) return 'N/A';
    const zona = this.zonas.find(z => z.id === mesa.zonaId);
    if (!zona) return 'N/A';
    const restaurante = this.restaurantes.find(r => r.id === zona.restauranteId);
    return restaurante ? restaurante.nombre : 'N/A';
  }
}