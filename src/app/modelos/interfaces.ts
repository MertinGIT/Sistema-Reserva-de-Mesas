export interface Restaurante {
  id: string;
  nombre: string;
}

export interface Zona {
  id: string;
  nombre: string;
  restauranteId: string;
}

export interface Mesa {
  id: string;
  numero: string;
  capacidad: number;
  zonaId: string;
}

export interface Horario {
  zonaId: string;
  horarios: string[];
}

export interface Reserva {
  id: string;
  fecha: string;
  hora: string;
  cantidadPersonas: number;
  idMesaAsignada: string;
  nombre: string;
  apellido: string;
  telefono: string;
}