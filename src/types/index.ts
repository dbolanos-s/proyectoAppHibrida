export type EstadoTarea = 'pendiente' | 'en_progreso' | 'entregada';

export type TipoEvento =
  | 'materia_creada'
  | 'materia_editada'
  | 'clase_asignada'
  | 'clase_liberada'
  | 'tarea_creada'
  | 'tarea_editada'
  | 'fecha_movida'
  | 'destacada'
  | 'sin_destacar'
  | 'entregada'
  | 'reabierta'
  | 'tarea_eliminada';

export interface Materia {
  id: string;
  nombre: string;
  /** Clave de la paleta fija definida en utils/colores.ts */
  color: string;
  docente?: string;
  aula?: string;
  /** Texto libre: el estudiante escribe su nivel, no se elige de una lista fija. */
  nivel?: string;
  /** Texto libre: "IB", "PAI", "Técnico", o vacío. */
  programa?: string;
  creditos?: number;
}

export interface Bloque {
  id: string;
  materiaId: string;
  /** 1 = lunes ... 5 = viernes */
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
}

export interface Tarea {
  id: string;
  materiaId: string;
  bloqueId?: string;
  titulo: string;
  descripcion?: string;
  /** Formato "YYYY-MM-DD". Sin hora, a propósito. */
  fechaEntrega: string;
  estado: EstadoTarea;
  importante: boolean;
  fechaCreacion: string;
}

/** Registro inmutable de lo que ha pasado en una materia. */
export interface Evento {
  id: string;
  materiaId: string;
  tareaId?: string;
  tipo: TipoEvento;
  /** Frase ya redactada, lista para mostrar. */
  detalle: string;
  /** ISO 8601 completo */
  fecha: string;
}

export interface Periodo {
  orden: number;
  horaInicio: string;
  horaFin: string;
}

export type Tema = 'sistema' | 'claro' | 'oscuro';

export interface Preferencias {
  tema: Tema;
  /** Coordenadas para el clima. Sin esto no se consulta nada. */
  climaActivo: boolean;
  latitud?: number;
  longitud?: number;
  ciudad?: string;
}

export interface DatosApp {
  materias: Materia[];
  bloques: Bloque[];
  tareas: Tarea[];
  eventos: Evento[];
  periodos: Periodo[];
  preferencias: Preferencias;
}

export const DIAS: { valor: number; corto: string; largo: string }[] = [
  { valor: 1, corto: 'Lun', largo: 'Lunes' },
  { valor: 2, corto: 'Mar', largo: 'Martes' },
  { valor: 3, corto: 'Mié', largo: 'Miércoles' },
  { valor: 4, corto: 'Jue', largo: 'Jueves' },
  { valor: 5, corto: 'Vie', largo: 'Viernes' },
];