import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlmacenamientoService } from '../../servicios/almacenamiento.service';
import { Restaurante, Zona, Mesa, Horario } from '../../modelos/interfaces';

@Component({
  selector: 'app-restaurantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tab-content">
      <h2>Administración de Restaurantes</h2>
      
      <form (ngSubmit)="manejarEnvio()" class="form">
        <div class="form-group">
          <label>Nombre del Restaurante</label>
          <input 
            type="text" 
            [(ngModel)]="formulario.nombre" 
            name="nombre"
            placeholder="Ingrese nombre del restaurante"
            required>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">
            <i class="fas fa-save"></i> {{ formulario.id ? 'Actualizar' : 'Agregar' }} Restaurante
          </button>
          <button type="button" *ngIf="formulario.id" (click)="reiniciarFormulario()" class="btn-secondary">
            <i class="fas fa-times"></i> Cancelar
          </button>
        </div>
      </form>

      <div class="list">
        <div *ngFor="let restaurante of restaurantes" class="list-item">
          <div class="list-item-content">
            <h3>{{ restaurante.nombre }}</h3>
            <span class="badge">ID: {{ restaurante.id }}</span>
          </div>
          <div class="list-item-actions">
            <button (click)="editar(restaurante)" class="btn-icon" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button (click)="eliminar(restaurante.id)" class="btn-icon" title="Eliminar">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        <div *ngIf="restaurantes.length === 0" class="empty-state">
          <i class="fas fa-inbox fa-3x"></i>
          <p>No hay restaurantes registrados</p>
        </div>
      </div>
    </div>
  `
})
export class RestaurantesComponent implements OnInit {
  restaurantes: Restaurante[] = [];
  formulario = { id: '', nombre: '' };

  constructor(private almacenamientoService: AlmacenamientoService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.restaurantes = this.almacenamientoService.obtenerRestaurantes();
  }

  manejarEnvio() {
    if (!this.formulario.nombre) return;

    if (this.formulario.id) {
      this.restaurantes = this.restaurantes.map(r =>
        r.id === this.formulario.id ? { ...this.formulario } : r
      );
    } else {
      this.restaurantes.push({
        id: Date.now().toString(),
        nombre: this.formulario.nombre
      });
    }
    this.almacenamientoService.guardarRestaurantes(this.restaurantes);
    this.reiniciarFormulario();
  }

  editar(restaurante: Restaurante) {
    this.formulario = { ...restaurante };
  }

  eliminar(id: string) {
    if (!confirm('¿Eliminar restaurante? Se eliminarán también sus zonas, mesas y reservas.')) return;

    this.restaurantes = this.restaurantes.filter(r => r.id !== id);
    this.almacenamientoService.guardarRestaurantes(this.restaurantes);

    const zonas = this.almacenamientoService.obtenerZonas();
    const zonasAEliminar = zonas.filter(z => z.restauranteId === id).map(z => z.id);
    const zonasActualizadas = zonas.filter(z => z.restauranteId !== id);
    this.almacenamientoService.guardarZonas(zonasActualizadas);

    const mesas = this.almacenamientoService.obtenerMesas();
    const mesasActualizadas = mesas.filter(m => !zonasAEliminar.includes(m.zonaId));
    this.almacenamientoService.guardarMesas(mesasActualizadas);

    const horarios = this.almacenamientoService.obtenerHorarios();
    const horariosActualizados = horarios.filter(h => !zonasAEliminar.includes(h.zonaId));
    this.almacenamientoService.guardarHorarios(horariosActualizados);

    const reservas = this.almacenamientoService.obtenerReservas();
    const reservasActualizadas = reservas.filter(r => {
      const mesa = mesas.find(m => m.id === r.idMesaAsignada);
      return mesa ? !zonasAEliminar.includes(mesa.zonaId) : false;
    });
    this.almacenamientoService.guardarReservas(reservasActualizadas);
  }

  reiniciarFormulario() {
    this.formulario = { id: '', nombre: '' };
  }
}