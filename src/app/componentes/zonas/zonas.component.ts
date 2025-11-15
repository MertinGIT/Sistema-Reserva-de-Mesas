import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlmacenamientoService } from '../../servicios/almacenamiento.service';
import { Restaurante, Zona, Mesa, Horario, Reserva } from '../../modelos/interfaces';

@Component({
  selector: 'app-zonas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tab-content">
      <h2>Administración de Zonas</h2>
      
      <form (ngSubmit)="manejarEnvio()" class="form">
        <div class="form-group">
          <label>Restaurante</label>
          <select [(ngModel)]="formulario.restauranteId" name="restauranteId" required>
            <option value="">Seleccione un restaurante</option>
            <option *ngFor="let r of restaurantes" [value]="r.id">{{ r.nombre }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Nombre de la Zona</label>
          <input 
            type="text" 
            [(ngModel)]="formulario.nombre" 
            name="nombre"
            placeholder="Ej: Terraza, Salón, Patio"
            required>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">
            <i class="fas fa-save"></i> {{ formulario.id ? 'Actualizar' : 'Agregar' }} Zona
          </button>
          <button type="button" *ngIf="formulario.id" (click)="reiniciarFormulario()" class="btn-secondary">
            <i class="fas fa-times"></i> Cancelar
          </button>
        </div>
      </form>

      <div class="form-group" style="margin-top: 30px;">
        <label><i class="fas fa-filter"></i> Filtrar por Restaurante</label>
        <select [(ngModel)]="filtroRestaurante" name="filter">
          <option value="">Todos los restaurantes</option>
          <option *ngFor="let r of restaurantes" [value]="r.id">{{ r.nombre }}</option>
        </select>
      </div>

      <div class="list">
        <div *ngFor="let zona of obtenerZonasFiltradas()" class="list-item">
          <div class="list-item-content">
            <h3>{{ zona.nombre }}</h3>
            <span class="badge"><i class="fas fa-store"></i> {{ obtenerNombreRestaurante(zona.restauranteId) }}</span>
          </div>
          <div class="list-item-actions">
            <button (click)="editar(zona)" class="btn-icon" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button (click)="eliminar(zona.id)" class="btn-icon" title="Eliminar">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        <div *ngIf="obtenerZonasFiltradas().length === 0" class="empty-state">
          <i class="fas fa-inbox fa-3x"></i>
          <p>No hay zonas registradas</p>
        </div>
      </div>
    </div>
  `
})
export class ZonasComponent implements OnInit {
  restaurantes: Restaurante[] = [];
  zonas: Zona[] = [];
  formulario = { id: '', nombre: '', restauranteId: '' };
  filtroRestaurante = '';

  constructor(private almacenamientoService: AlmacenamientoService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.restaurantes = this.almacenamientoService.obtenerRestaurantes();
    this.zonas = this.almacenamientoService.obtenerZonas();
  }

  manejarEnvio() {
    if (!this.formulario.nombre || !this.formulario.restauranteId) return;

    if (this.formulario.id) {
      this.zonas = this.zonas.map(z =>
        z.id === this.formulario.id ? { 
          id: z.id, 
          nombre: this.formulario.nombre, 
          restauranteId: this.formulario.restauranteId 
        } : z
      );
    } else {
      this.zonas.push({
        id: Date.now().toString(),
        nombre: this.formulario.nombre,
        restauranteId: this.formulario.restauranteId
      });
    }
    this.almacenamientoService.guardarZonas(this.zonas);
    this.reiniciarFormulario();
  }

  editar(zona: Zona) {
    this.formulario = { ...zona };
  }

  eliminar(id: string) {
    if (!confirm('¿Eliminar zona? Se eliminarán también sus mesas y reservas.')) return;

    this.zonas = this.zonas.filter(z => z.id !== id);
    this.almacenamientoService.guardarZonas(this.zonas);

    const mesas = this.almacenamientoService.obtenerMesas();
    const mesasActualizadas = mesas.filter(m => m.zonaId !== id);
    this.almacenamientoService.guardarMesas(mesasActualizadas);

    const horarios = this.almacenamientoService.obtenerHorarios();
    const horariosActualizados = horarios.filter(h => h.zonaId !== id);
    this.almacenamientoService.guardarHorarios(horariosActualizados);

    const reservas = this.almacenamientoService.obtenerReservas();
    const reservasActualizadas = reservas.filter(r => {
      const mesa = mesas.find(m => m.id === r.idMesaAsignada);
      return mesa ? mesa.zonaId !== id : false;
    });
    this.almacenamientoService.guardarReservas(reservasActualizadas);
  }

  reiniciarFormulario() {
    this.formulario = { id: '', nombre: '', restauranteId: '' };
  }

  obtenerZonasFiltradas(): Zona[] {
    if (!this.filtroRestaurante) return this.zonas;
    return this.zonas.filter(z => z.restauranteId === this.filtroRestaurante);
  }

  obtenerNombreRestaurante(id: string): string {
    const restaurante = this.restaurantes.find(r => r.id === id);
    return restaurante ? restaurante.nombre : 'N/A';
  }
}