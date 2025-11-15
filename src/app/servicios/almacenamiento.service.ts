import { Injectable } from '@angular/core';
import { Restaurante, Zona, Mesa, Horario, Reserva } from '../modelos/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AlmacenamientoService {

  obtenerRestaurantes(): Restaurante[] {
    return JSON.parse(localStorage.getItem('restaurantes') || '[]');
  }

  guardarRestaurantes(restaurantes: Restaurante[]): void {
    localStorage.setItem('restaurantes', JSON.stringify(restaurantes));
  }

  obtenerZonas(): Zona[] {
    return JSON.parse(localStorage.getItem('zonas') || '[]');
  }

  guardarZonas(zonas: Zona[]): void {
    localStorage.setItem('zonas', JSON.stringify(zonas));
  }

  obtenerMesas(): Mesa[] {
    return JSON.parse(localStorage.getItem('mesas') || '[]');
  }

  guardarMesas(mesas: Mesa[]): void {
    localStorage.setItem('mesas', JSON.stringify(mesas));
  }

  obtenerHorarios(): Horario[] {
    return JSON.parse(localStorage.getItem('horarios') || '[]');
  }

  guardarHorarios(horarios: Horario[]): void {
    localStorage.setItem('horarios', JSON.stringify(horarios));
  }

  obtenerReservas(): Reserva[] {
    return JSON.parse(localStorage.getItem('reservas') || '[]');
  }

  guardarReservas(reservas: Reserva[]): void {
    localStorage.setItem('reservas', JSON.stringify(reservas));
  }
}