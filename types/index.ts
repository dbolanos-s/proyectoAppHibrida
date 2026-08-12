export type EstadoTarea = 'pendiente' | 'en_progreso' | 'entregada';

export interface Materia {
  id: string;
  nombre: string;
  /** Clave de la paleta fija definida en utils/colores.ts */
  color: string;
  docente?: string;
  aula?: string;
}

export interface Bloque {
  id: string;
  materiaId: string;
  /** 1 = lunes ... 5 = viernes */
  diaSemana: number;
  /** Formato "07:30" */
  horaInicio: string;
  /** Formato "08:15" */
  horaFin: string;
}

export interface Tarea {
  id: string;
  materiaId: string;
  /** Opcional: no toda tarea nace dentro de una clase */
  bloqueId?: string;
  titulo: string;
  descripcion?: string;
  /** Formato "YYYY-MM-DD". Sin hora, a propósito. */
  fechaEntrega: string;
  estado: EstadoTarea;
  importante: boolean;
  /** ISO 8601 completo */
  fechaCreacion: string;
}

export interface Periodo {
  orden: number;
  horaInicio: string;
  horaFin: string;
}

export interface DatosApp {
  materias: Materia[];
  bloques: Bloque[];
  tareas: Tarea[];
  periodos: Periodo[];
}

export const DIAS: { valor: number; corto: string; largo: string }[] = [
  { valor: 1, corto: 'Lun', largo: 'Lunes' },
  { valor: 2, corto: 'Mar', largo: 'Martes' },
  { valor: 3, corto: 'Mié', largo: 'Miércoles' },
  { valor: 4, corto: 'Jue', largo: 'Jueves' },
  { valor: 5, corto: 'Vie', largo: 'Viernes' },
];
