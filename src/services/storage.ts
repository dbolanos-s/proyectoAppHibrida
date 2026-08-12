import { Preferences } from '@capacitor/preferences';
import type { DatosApp, Periodo, Preferencias } from '../types';

const CLAVE = 'copol.datos.v2';

/** Jornada de arranque. El estudiante la edita a su realidad desde Horario. */
export const PERIODOS_POR_DEFECTO: Periodo[] = [
  { orden: 1, horaInicio: '07:00', horaFin: '07:45' },
  { orden: 2, horaInicio: '07:45', horaFin: '08:30' },
  { orden: 3, horaInicio: '08:45', horaFin: '09:30' },
  { orden: 4, horaInicio: '09:30', horaFin: '10:15' },
  { orden: 5, horaInicio: '10:30', horaFin: '11:15' },
  { orden: 6, horaInicio: '11:15', horaFin: '12:00' },
];

export const PREFERENCIAS_POR_DEFECTO: Preferencias = {
  tema: 'sistema',
  climaActivo: false,
};

/**
 * Arranque en blanco. No hay materias precargadas: el estudiante escribe las
 * suyas, que cambian según el nivel y el programa que curse.
 */
export const DATOS_VACIOS: DatosApp = {
  materias: [],
  bloques: [],
  tareas: [],
  eventos: [],
  periodos: PERIODOS_POR_DEFECTO,
  preferencias: PREFERENCIAS_POR_DEFECTO,
};

export async function cargarDatos(): Promise<DatosApp> {
  try {
    const { value } = await Preferences.get({ key: CLAVE });
    if (!value) return DATOS_VACIOS;
    const p = JSON.parse(value) as Partial<DatosApp>;
    return {
      materias: p.materias ?? [],
      bloques: p.bloques ?? [],
      tareas: p.tareas ?? [],
      eventos: p.eventos ?? [],
      periodos: p.periodos?.length ? p.periodos : PERIODOS_POR_DEFECTO,
      preferencias: { ...PREFERENCIAS_POR_DEFECTO, ...(p.preferencias ?? {}) },
    };
  } catch {
    return DATOS_VACIOS;
  }
}

export async function guardarDatos(datos: DatosApp): Promise<void> {
  await Preferences.set({ key: CLAVE, value: JSON.stringify(datos) });
}

export function nuevoId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}