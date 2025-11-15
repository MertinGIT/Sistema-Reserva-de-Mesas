import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlmacenamientoService } from '../../servicios/almacenamiento.service';
import { Restaurante, Zona, Horario } from '../../modelos/interfaces';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tab-content">
      <h2>Configuración de Horarios por Zona</h2>
      
      <form (ngSubmit)="manejarEnvio()" class="form">
        <div class="form-group">
          <label>Restaurante</label>
          <select [(ngModel)]="formulario.restauranteId" name="restauranteId" 
                  (change)="formulario.zonaId = ''" required>
            <option value="">Seleccione un restaurante</option>
            <option *ngFor="let r of restaurantes" [value]="r.id">{{ r.nombre }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Zona</label>
          <select [(ngModel)]="formulario.zonaId" name="zonaId" 
                  (change)="cargarHorarioParaEditar()" required>
            <option value="">Seleccione una zona</option>
            <option *ngFor="let z of obtenerZonasPorRestaurante(formulario.restauranteId)" [value]="z.id">
              {{ z.nombre }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Horarios Disponibles</label>
          <input 
            type="text" 
            [(ngModel)]="formulario.horarios" 
            name="horarios"
            placeholder="Ej: 11:00, 12:00, 13:00, 20:00, 21:00"
            required>
          <small>Separe los horarios con comas</small>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">
            <i class="fas fa-save"></i> Guardar Horarios
          </button>
          <button type="button" (click)="reiniciarFormulario()" class="btn-secondary">
            <i class="fas fa-times"></i> Cancelar
          </button>
        </div>
      </form>

      <div class="list">
        <div *ngFor="let horario of horarios" class="list-item">
          <div class="list-item-content">
            <h3><i class="fas fa-map-marker-alt"></i> {{ obtenerNombreZona(horario.zonaId) }}</h3>
            <span class="badge"><i class="fas fa-store"></i> {{ obtenerNombreRestaurantePorZona(horario.zonaId) }}</span>
            <div class="schedule-times">
              <span *ngFor="let hora of horario.horarios" class="time-badge">
                <i class="far fa-clock"></i> {{ hora }}
              </span>
            </div>
          </div>
          <div class="list-item-actions">
            <button (click)="editar(horario)" class="btn-icon" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </div>
        <div *ngIf="horarios.length === 0" class="empty-state">
          <i class="fas fa-inbox fa-3x"></i>
          <p>No hay horarios configurados</p>
        </div>
      </div>
    </div>
  `
})
export class HorariosComponent implements OnInit {
  restaurantes: Restaurante[] = [];
  zonas: Zona[] = [];
  horarios: Horario[] = [];
  formulario = { zonaId: '', restauranteId: '', horarios: '' };

  constructor(private almacenamientoService: AlmacenamientoService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.restaurantes = this.almacenamientoService.obtenerRestaurantes();
    this.zonas = this.almacenamientoService.obtenerZonas();
    this.horarios = this.almacenamientoService.obtenerHorarios();
  }

  manejarEnvio() {
    if (!this.formulario.zonaId || !this.formulario.horarios) return;

    const horariosArray = this.formulario.horarios
      .split(',')
      .map(h => h.trim())
      .filter(h => h);

    const indiceExistente = this.horarios.findIndex(h => h.zonaId === this.formulario.zonaId);

    if (indiceExistente >= 0) {
      this.horarios[indiceExistente] = {
        zonaId: this.formulario.zonaId,
        horarios: horariosArray
      };
    } else {
      this.horarios.push({
        zonaId: this.formulario.zonaId,
        horarios: horariosArray
      });
    }

    this.almacenamientoService.guardarHorarios(this.horarios);
    this.reiniciarFormulario();
  }

  editar(horario: Horario) {
    const zona = this.zonas.find(z => z.id === horario.zonaId);
    this.formulario = {
      zonaId: horario.zonaId,
      restauranteId: zona?.restauranteId || '',
      horarios: horario.horarios.join(', ')
    };
  }

  cargarHorarioParaEditar() {
    if (!this.formulario.zonaId) return;

    const horario = this.horarios.find(h => h.zonaId === this.formulario.zonaId);
    if (horario) {
      this.formulario.horarios = horario.horarios.join(', ');
    } else {
      this.formulario.horarios = '';
    }
  }

  reiniciarFormulario() {
    this.formulario = { zonaId: '', restauranteId: '', horarios: '' };
  }

  obtenerZonasPorRestaurante(restauranteId: string): Zona[] {
    return this.zonas.filter(z => z.restauranteId === restauranteId);
  }

  obtenerNombreZona(id: string): string {
    const zona = this.zonas.find(z => z.id === id);
    return zona ? zona.nombre : 'N/A';
  }

  obtenerNombreRestaurantePorZona(zonaId: string): string {
    const zona = this.zonas.find(z => z.id === zonaId);
    if (!zona) return 'N/A';
    const restaurante = this.restaurantes.find(r => r.id === zona.restauranteId);
    return restaurante ? restaurante.nombre : 'N/A';
  }
}