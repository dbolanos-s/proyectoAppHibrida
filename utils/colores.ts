import type { Tarea } from '../types';
import { diasCalendario, msRestantes } from './fechas';

export type NivelUrgencia =
  | 'entregada'
  | 'vencida'
  | 'inmediata'
  | 'proxima'
  | 'semana'
  | 'lejana';

export interface EstiloUrgencia {
  nivel: NivelUrgencia;
  /** Texto que acompaña al color. El color nunca viaja solo. */
  etiqueta: string;
  /** Nombre del icono de ionicons */
  icono: string;
  /** Variable CSS definida en theme/copol.css */
  variable: string;
}

const ESTILOS: Record<NivelUrgencia, EstiloUrgencia> = {
  entregada: { nivel: 'entregada', etiqueta: 'Entregada', icono: 'checkmark-circle', variable: '--copol-entregada' },
  vencida: { nivel: 'vencida', etiqueta: 'Vencida', icono: 'alert-circle', variable: '--copol-vencida' },
  inmediata: { nivel: 'inmediata', etiqueta: 'Urgente', icono: 'flame', variable: '--copol-inmediata' },
  proxima: { nivel: 'proxima', etiqueta: 'Pronto', icono: 'time', variable: '--copol-proxima' },
  semana: { nivel: 'semana', etiqueta: 'Esta semana', icono: 'calendar', variable: '--copol-semana' },
  lejana: { nivel: 'lejana', etiqueta: 'Con tiempo', icono: 'leaf', variable: '--copol-lejana' },
};

/**
 * El nivel se calcula siempre a partir del tiempo restante.
 * Nunca se guarda en la base de datos: quedaría desactualizado al día siguiente.
 */
export function nivelUrgencia(tarea: Tarea): NivelUrgencia {
  if (tarea.estado === 'entregada') return 'entregada';
  if (msRestantes(tarea.fechaEntrega) <= 0) return 'vencida';

  const dias = diasCalendario(tarea.fechaEntrega);
  if (dias <= 1) return 'inmediata';
  if (dias <= 3) return 'proxima';
  if (dias <= 7) return 'semana';
  return 'lejana';
}

export function estiloUrgencia(tarea: Tarea): EstiloUrgencia {
  return ESTILOS[nivelUrgencia(tarea)];
}

/** Paleta fija de materias. El estudiante elige de aquí, no con selector libre. */
export const PALETA: { clave: string; nombre: string; hex: string }[] = [
  { clave: 'indigo', nombre: 'Índigo', hex: '#4c5fd7' },
  { clave: 'turquesa', nombre: 'Turquesa', hex: '#0e9594' },
  { clave: 'ciruela', nombre: 'Ciruela', hex: '#8e44ad' },
  { clave: 'terracota', nombre: 'Terracota', hex: '#c0562f' },
  { clave: 'oliva', nombre: 'Oliva', hex: '#6b8e23' },
  { clave: 'frambuesa', nombre: 'Frambuesa', hex: '#c2185b' },
  { clave: 'ocre', nombre: 'Ocre', hex: '#b8860b' },
  { clave: 'pizarra', nombre: 'Pizarra', hex: '#4a5568' },
  { clave: 'cobalto', nombre: 'Cobalto', hex: '#1565c0' },
  { clave: 'bosque', nombre: 'Bosque', hex: '#2e7d5b' },
];

export function hexDeMateria(clave: string): string {
  return PALETA.find((c) => c.clave === clave)?.hex ?? PALETA[7].hex;
}
