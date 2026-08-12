import { Preferences } from '@capacitor/preferences';
import type { DatosApp, Periodo } from '../types';

const CLAVE = 'copol.datos.v1';

/** Horario de arranque: 6 períodos de 45 minutos desde las 07:00. */
export const PERIODOS_POR_DEFECTO: Periodo[] = [
  { orden: 1, horaInicio: '07:00', horaFin: '07:45' },
  { orden: 2, horaInicio: '07:45', horaFin: '08:30' },
  { orden: 3, horaInicio: '08:45', horaFin: '09:30' },
  { orden: 4, horaInicio: '09:30', horaFin: '10:15' },
  { orden: 5, horaInicio: '10:30', horaFin: '11:15' },
  { orden: 6, horaInicio: '11:15', horaFin: '12:00' },
];

export const DATOS_VACIOS: DatosApp = {
  materias: [],
  bloques: [],
  tareas: [],
  periodos: PERIODOS_POR_DEFECTO,
};

export async function cargarDatos(): Promise<DatosApp> {
  try {
    const { value } = await Preferences.get({ key: CLAVE });
    if (!value) return DATOS_VACIOS;
    const parsed = JSON.parse(value) as Partial<DatosApp>;
    return {
      materias: parsed.materias ?? [],
      bloques: parsed.bloques ?? [],
      tareas: parsed.tareas ?? [],
      periodos: parsed.periodos?.length ? parsed.periodos : PERIODOS_POR_DEFECTO,
    };
  } catch {
    // Datos corruptos: arrancamos limpio en vez de dejar la app trabada.
    return DATOS_VACIOS;
  }
}

export async function guardarDatos(datos: DatosApp): Promise<void> {
  await Preferences.set({ key: CLAVE, value: JSON.stringify(datos) });
}

export async function borrarDatos(): Promise<void> {
  await Preferences.remove({ key: CLAVE });
}

export function nuevoId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
