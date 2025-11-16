import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlmacenamientoService } from '../../servicios/almacenamiento.service';
import { Restaurante, Zona, Mesa, Reserva } from '../../modelos/interfaces';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tab-content">
      <h2>Administración de Mesas</h2>

      <form (ngSubmit)="manejarEnvio()" class="form">
        <div class="form-group">
          <label>Restaurante</label>
          <select
            [(ngModel)]="formulario.restauranteId"
            name="restauranteId"
            (change)="formulario.zonaId = ''"
            required
          >
            <option value="">Seleccione un restaurante</option>
            <option *ngFor="let r of restaurantes" [value]="r.id">{{ r.nombre }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Zona</label>
          <select [(ngModel)]="formulario.zonaId" name="zonaId" required>
            <option value="">Seleccione una zona</option>
            <option
              *ngFor="let z of obtenerZonasPorRestaurante(formulario.restauranteId)"
              [value]="z.id"
            >
              {{ z.nombre }}
            </option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Número de Mesa</label>
            <input
              type="text"
              [(ngModel)]="formulario.numero"
              name="numero"
              placeholder="Ej: 1, A1, T-5"
              required
            />
          </div>
          <div class="form-group">
            <label>Capacidad</label>
            <input
              type="number"
              [(ngModel)]="formulario.capacidad"
              name="capacidad"
              min="1"
              placeholder="Personas"
              required
            />
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">
            <i class="fas fa-save"></i> {{ formulario.id ? 'Actualizar' : 'Agregar' }} Mesa
          </button>
          <button
            type="button"
            *ngIf="formulario.id"
            (click)="reiniciarFormulario()"
            class="btn-secondary"
          >
            <i class="fas fa-times"></i> Cancelar
          </button>
        </div>
      </form>

      <div class="list">
        <div *ngFor="let mesa of obtenerMesasFiltradas()" class="list-item">
          <div class="list-item-content">
            <h3><i class="fas fa-table"></i> Mesa {{ mesa.numero }}</h3>
            <div class="info-row">
              <span class="badge"><i class="fas fa-users"></i> {{ mesa.capacidad }} personas</span>
              <span class="badge"
                ><i class="fas fa-map-marker-alt"></i> {{ obtenerNombreZona(mesa.zonaId) }}</span
              >
              <span class="badge"
                ><i class="fas fa-store"></i>
                {{ obtenerNombreRestaurantePorZona(mesa.zonaId) }}</span
              >
            </div>
          </div>
          <div class="list-item-actions">
            <button (click)="editar(mesa)" class="btn-icon" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button (click)="eliminar(mesa.id)" class="btn-icon" title="Eliminar">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        <div *ngIf="obtenerMesasFiltradas().length === 0" class="empty-state">
          <i class="fas fa-inbox fa-3x"></i>
          <p>No hay mesas registradas</p>
        </div>
      </div>
    </div>
  `,
})
export class MesasComponent implements OnInit {
  restaurantes: Restaurante[] = [];
  zonas: Zona[] = [];
  mesas: Mesa[] = [];
  formulario = { id: '', numero: '', capacidad: 0, zonaId: '', restauranteId: '' };

  constructor(private almacenamientoService: AlmacenamientoService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.restaurantes = this.almacenamientoService.obtenerRestaurantes();
    this.zonas = this.almacenamientoService.obtenerZonas();
    this.mesas = this.almacenamientoService.obtenerMesas();
  }

  manejarEnvio() {
    if (!this.formulario.numero || !this.formulario.capacidad || !this.formulario.zonaId) return;

    const existeDuplicado = this.mesas.some(
      (m) =>
        m.numero.toLowerCase().trim() === this.formulario.numero.toLowerCase().trim() &&
        m.zonaId === this.formulario.zonaId &&
        m.id !== this.formulario.id
    );

    if (existeDuplicado) {
      alert('Ya existe una mesa con ese número en esta zona');
      return;
    }

    if (this.formulario.id) {
      this.mesas = this.mesas.map((m) =>
        m.id === this.formulario.id
          ? {
              id: m.id,
              numero: this.formulario.numero,
              capacidad: Number(this.formulario.capacidad),
              zonaId: this.formulario.zonaId,
            }
          : m
      );
    } else {
      this.mesas.push({
        id: Date.now().toString(),
        numero: this.formulario.numero,
        capacidad: Number(this.formulario.capacidad),
        zonaId: this.formulario.zonaId,
      });
    }
    this.almacenamientoService.guardarMesas(this.mesas);
    this.reiniciarFormulario();
  }

  editar(mesa: Mesa) {
    const zona = this.zonas.find((z) => z.id === mesa.zonaId);
    this.formulario = {
      id: mesa.id,
      numero: mesa.numero,
      capacidad: mesa.capacidad,
      zonaId: mesa.zonaId,
      restauranteId: zona?.restauranteId || '',
    };
  }

  eliminar(id: string) {
    if (!confirm('¿Eliminar mesa?')) return;

    this.mesas = this.mesas.filter((m) => m.id !== id);
    this.almacenamientoService.guardarMesas(this.mesas);

    const reservas = this.almacenamientoService.obtenerReservas();
    const reservasActualizadas = reservas.filter((r) => r.idMesaAsignada !== id);
    this.almacenamientoService.guardarReservas(reservasActualizadas);
  }

  reiniciarFormulario() {
    this.formulario = { id: '', numero: '', capacidad: 0, zonaId: '', restauranteId: '' };
  }

  obtenerZonasPorRestaurante(restauranteId: string): Zona[] {
    return this.zonas.filter((z) => z.restauranteId === restauranteId);
  }

  obtenerMesasFiltradas(): Mesa[] {
    if (this.formulario.restauranteId) {
      const zonasDelRestaurante = this.zonas
        .filter((z) => z.restauranteId === this.formulario.restauranteId)
        .map((z) => z.id);

      return this.mesas.filter((m) => zonasDelRestaurante.includes(m.zonaId));
    }

    return this.mesas;
  }

  obtenerNombreZona(id: string): string {
    const zona = this.zonas.find((z) => z.id === id);
    return zona ? zona.nombre : 'N/A';
  }

  obtenerNombreRestaurantePorZona(zonaId: string): string {
    const zona = this.zonas.find((z) => z.id === zonaId);
    if (!zona) return 'N/A';
    const restaurante = this.restaurantes.find((r) => r.id === zona.restauranteId);
    return restaurante ? restaurante.nombre : 'N/A';
  }
}
