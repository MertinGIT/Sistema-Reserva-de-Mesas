import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlmacenamientoService } from '../../servicios/almacenamiento.service';
import { Restaurante, Zona, Mesa, Horario, Reserva } from '../../modelos/interfaces';

@Component({
  selector: 'app-nueva-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tab-content">
      <h2>Nueva Reserva</h2>

      <form (ngSubmit)="manejarEnvio()" class="form">
        <div class="form-group">
          <label><i class="fas fa-arrow-right"></i> 1. Seleccione Restaurante</label>
          <select
            [(ngModel)]="formulario.restauranteId"
            name="restauranteId"
            (change)="alCambiarRestaurante()"
            required
          >
            <option value="">Seleccione un restaurante</option>
            <option *ngFor="let r of restaurantes" [value]="r.id">{{ r.nombre }}</option>
          </select>
        </div>

        <div class="form-group" *ngIf="formulario.restauranteId">
          <label><i class="fas fa-arrow-right"></i> 2. Seleccione Zona</label>
          <select [(ngModel)]="formulario.zonaId" name="zonaId" (change)="alCambiarZona()" required>
            <option value="">Seleccione una zona</option>
            <option
              *ngFor="let z of obtenerZonasPorRestaurante(formulario.restauranteId)"
              [value]="z.id"
            >
              {{ z.nombre }}
            </option>
          </select>
        </div>

        <div class="form-row" *ngIf="formulario.zonaId">
          <div class="form-group">
            <label><i class="fas fa-calendar-alt"></i> 3. Fecha</label>
            <input
              type="date"
              [(ngModel)]="formulario.fecha"
              name="fecha"
              [min]="obtenerFechaHoy()"
              (change)="alCambiarFecha()"
              required
            />
          </div>
          <div class="form-group">
            <label><i class="fas fa-clock"></i> 4. Horario</label>
            <select
              [(ngModel)]="formulario.hora"
              name="hora"
              required
              [disabled]="!formulario.fecha"
            >
              <option value="">Seleccione horario</option>
              <option *ngFor="let hora of obtenerHorariosDisponibles()" [value]="hora">
                {{ hora }}
              </option>
            </select>
            <small
              *ngIf="formulario.fecha && obtenerHorariosDisponibles().length === 0"
              style="color: #991b1b;"
            >
              No hay horarios disponibles para esta fecha
            </small>
          </div>
        </div>

        <div class="form-group" *ngIf="formulario.hora">
          <label><i class="fas fa-users"></i> 5. Cantidad de Personas</label>
          <input
            type="number"
            [(ngModel)]="formulario.cantidadPersonas"
            name="cantidadPersonas"
            min="1"
            placeholder="Número de comensales"
            required
          />
        </div>

        <div *ngIf="formulario.cantidadPersonas" class="form-section">
          <h3><i class="fas fa-user"></i> 6. Datos del Cliente</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Nombre</label>
              <input
                type="text"
                [(ngModel)]="formulario.nombre"
                name="nombre"
                placeholder="Nombre"
                required
              />
            </div>
            <div class="form-group">
              <label>Apellido</label>
              <input
                type="text"
                [(ngModel)]="formulario.apellido"
                name="apellido"
                placeholder="Apellido"
                required
              />
            </div>
          </div>
          <div class="form-group">
            <label><i class="fas fa-phone"></i> Teléfono</label>
            <input
              type="tel"
              [(ngModel)]="formulario.telefono"
              name="telefono"
              placeholder="Teléfono de contacto"
              required
            />
          </div>
        </div>

        <div class="form-actions" *ngIf="formulario.telefono">
          <button type="submit" class="btn-primary btn-large">
            <i class="fas fa-check-circle"></i> Confirmar Reserva
          </button>
        </div>
      </form>

      <div *ngIf="mensaje" [class]="claseMensaje">
        {{ mensaje }}
      </div>
    </div>
  `,
})
export class NuevaReservaComponent implements OnInit {
  @Output() reservaCreada = new EventEmitter<void>();

  restaurantes: Restaurante[] = [];
  zonas: Zona[] = [];
  mesas: Mesa[] = [];
  horarios: Horario[] = [];
  reservas: Reserva[] = [];

  formulario = {
    restauranteId: '',
    zonaId: '',
    fecha: '',
    hora: '',
    cantidadPersonas: 0,
    nombre: '',
    apellido: '',
    telefono: '',
  };

  mensaje = '';
  claseMensaje = '';

  constructor(private almacenamientoService: AlmacenamientoService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.restaurantes = this.almacenamientoService.obtenerRestaurantes();
    this.zonas = this.almacenamientoService.obtenerZonas();
    this.mesas = this.almacenamientoService.obtenerMesas();
    this.horarios = this.almacenamientoService.obtenerHorarios();
    this.reservas = this.almacenamientoService.obtenerReservas();
  }

  manejarEnvio() {
    const { restauranteId, zonaId, fecha, hora, cantidadPersonas, nombre, apellido, telefono } =
      this.formulario;

    if (
      !restauranteId ||
      !zonaId ||
      !fecha ||
      !hora ||
      !cantidadPersonas ||
      !nombre ||
      !apellido ||
      !telefono
    ) {
      this.mostrarMensaje('Por favor complete todos los campos', 'error');
      return;
    }

    if (!this.validarHorario(fecha, hora)) {
      this.mostrarMensaje('No puede reservar en un horario que ya pasó', 'error');
      return;
    }

    const mesasDisponibles = this.mesas.filter(
      (m) => m.zonaId === zonaId && m.capacidad >= cantidadPersonas
    );

    if (mesasDisponibles.length === 0) {
      this.mostrarMensaje(
        'No hay mesas disponibles con capacidad suficiente para la cantidad de personas',
        'error'
      );
      return;
    }

    const idsMesasOcupadas = this.reservas
      .filter((r) => r.fecha === fecha && r.hora === hora)
      .map((r) => r.idMesaAsignada);

    // Filtrar solo mesas libres
    const mesasLibres = mesasDisponibles.filter((m) => !idsMesasOcupadas.includes(m.id));

    if (mesasLibres.length === 0) {
      const totalMesas = mesasDisponibles.length;
      const mesasOcupadas = mesasDisponibles.filter((m) => idsMesasOcupadas.includes(m.id)).length;

      this.mostrarMensaje(
        `No hay mesas disponibles para la fecha y hora seleccionadas. ` +
          `${mesasOcupadas} de ${totalMesas} mesas con capacidad suficiente ya están reservadas.`,
        'error'
      );
      return;
    }

    // Elegir la mesa más adecuada:
    // 1. Primero buscar una mesa con capacidad exacta
    // 2. Si no hay, buscar la de menor capacidad que cumpla
    // Ordenar mesas por capacidad ascendente
    const mesasOrdenadas = mesasLibres.sort((a, b) => a.capacidad - b.capacidad);

    // Buscar primero una mesa con capacidad exacta
    let mesaLibre = mesasOrdenadas.find((m) => m.capacidad === cantidadPersonas);

    // Si no hay mesa exacta, tomar la primera (menor capacidad disponible)
    if (!mesaLibre) {
      mesaLibre = mesasOrdenadas[0];
    }

    const nuevaReserva: Reserva = {
      id: Date.now().toString(),
      fecha,
      hora,
      cantidadPersonas: Number(cantidadPersonas),
      idMesaAsignada: mesaLibre.id,
      nombre,
      apellido,
      telefono,
    };

    this.reservas.push(nuevaReserva);
    this.almacenamientoService.guardarReservas(this.reservas);

    this.mostrarMensaje(
      `Reserva confirmada exitosamente! Mesa ${mesaLibre.numero} asignada para ${cantidadPersonas} personas el ${fecha} a las ${hora}`,
      'success'
    );

    setTimeout(() => {
      this.reiniciarFormulario();
      this.reservaCreada.emit();
    }, 3000);
  }

  alCambiarRestaurante() {
    this.formulario.zonaId = '';
    this.formulario.fecha = '';
    this.formulario.hora = '';
  }

  alCambiarZona() {
    this.formulario.fecha = '';
    this.formulario.hora = '';
  }

  alCambiarFecha() {
    this.formulario.hora = '';
  }

  reiniciarFormulario() {
    this.formulario = {
      restauranteId: '',
      zonaId: '',
      fecha: '',
      hora: '',
      cantidadPersonas: 0,
      nombre: '',
      apellido: '',
      telefono: '',
    };
    this.mensaje = '';
  }

  obtenerZonasPorRestaurante(restauranteId: string): Zona[] {
    return this.zonas.filter((z) => z.restauranteId === restauranteId);
  }

  obtenerHorariosDisponibles(): string[] {
    if (!this.formulario.zonaId || !this.formulario.fecha) return [];

    const horario = this.horarios.find((h) => h.zonaId === this.formulario.zonaId);
    if (!horario) return [];

    const esHoy = this.esHoy(this.formulario.fecha);

    if (esHoy) {
      const horaActual = this.obtenerHoraActual();
      return horario.horarios.filter((h) => this.compararHoras(h, horaActual) > 0);
    }

    return horario.horarios;
  }

  esHoy(fecha: string): boolean {
    const hoy = new Date();
    const fechaSeleccionada = new Date(fecha + 'T00:00:00');
    return hoy.toDateString() === fechaSeleccionada.toDateString();
  }

  obtenerHoraActual(): string {
    const ahora = new Date();
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  }

  normalizarHora(hora: string): string {
    hora = hora.trim();

    if (hora.includes(':')) {
      return hora;
    }

    const numero = parseInt(hora);
    if (!isNaN(numero)) {
      return numero.toString().padStart(2, '0') + ':00';
    }

    return hora;
  }

  compararHoras(hora1: string, hora2: string): number {
    const h1Normalizada = this.normalizarHora(hora1);
    const h2Normalizada = this.normalizarHora(hora2);

    const [horas1, minutos1] = h1Normalizada.split(':').map(Number);
    const [horas2, minutos2] = h2Normalizada.split(':').map(Number);

    const totalMinutos1 = horas1 * 60 + (minutos1 || 0);
    const totalMinutos2 = horas2 * 60 + (minutos2 || 0);

    return totalMinutos1 - totalMinutos2;
  }

  validarHorario(fecha: string, hora: string): boolean {
    if (!this.esHoy(fecha)) return true;

    const horaActual = this.obtenerHoraActual();
    return this.compararHoras(hora, horaActual) > 0;
  }

  obtenerFechaHoy(): string {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error') {
    this.mensaje = mensaje;
    this.claseMensaje = tipo === 'success' ? 'alert alert-success' : 'alert alert-error';

    setTimeout(() => {
      this.mensaje = '';
    }, 5000);
  }
}
