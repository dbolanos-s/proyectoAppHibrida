import type { DatosApp } from '../types';
import { nuevoId, PERIODOS_POR_DEFECTO } from './storage';
import { hoyISO, sumarDias } from '../utils/fechas';

/**
 * Datos de demostración. Sirven para probar la aplicación sin cargar todo a mano
 * y para mostrarla en clase. Las fechas son relativas a hoy, así que los colores
 * y los contadores siempre se ven variados.
 */
export function datosDeEjemplo(): DatosApp {
  const mat = {
    quimica: { id: nuevoId(), nombre: 'Química', color: 'turquesa', docente: 'Ing. Salazar', aula: 'Lab 2' },
    matematica: { id: nuevoId(), nombre: 'Matemática', color: 'indigo', docente: 'Lcda. Ortiz', aula: 'A-14' },
    lengua: { id: nuevoId(), nombre: 'Lengua y Literatura', color: 'frambuesa', aula: 'A-09' },
    historia: { id: nuevoId(), nombre: 'Historia', color: 'ocre' },
    fisica: { id: nuevoId(), nombre: 'Física', color: 'cobalto', aula: 'Lab 1' },
    ingles: { id: nuevoId(), nombre: 'Inglés', color: 'oliva' },
  };

  const p = PERIODOS_POR_DEFECTO;
  const bloque = (materiaId: string, dia: number, i: number) => ({
    id: nuevoId(),
    materiaId,
    diaSemana: dia,
    horaInicio: p[i].horaInicio,
    horaFin: p[i].horaFin,
  });

  const bloques = [
    bloque(mat.matematica.id, 1, 0), bloque(mat.quimica.id, 1, 1), bloque(mat.ingles.id, 1, 3),
    bloque(mat.lengua.id, 2, 0), bloque(mat.fisica.id, 2, 2), bloque(mat.historia.id, 2, 4),
    bloque(mat.quimica.id, 3, 1), bloque(mat.matematica.id, 3, 2), bloque(mat.ingles.id, 3, 5),
    bloque(mat.fisica.id, 4, 0), bloque(mat.historia.id, 4, 3), bloque(mat.lengua.id, 4, 4),
    bloque(mat.matematica.id, 5, 1), bloque(mat.quimica.id, 5, 2), bloque(mat.ingles.id, 5, 4),
  ];

  const hoy = hoyISO();
  const tarea = (
    materiaId: string,
    titulo: string,
    dias: number,
    importante = false,
    estado: 'pendiente' | 'en_progreso' | 'entregada' = 'pendiente',
    descripcion?: string
  ) => ({
    id: nuevoId(),
    materiaId,
    titulo,
    descripcion,
    fechaEntrega: sumarDias(hoy, dias),
    estado,
    importante,
    fechaCreacion: new Date().toISOString(),
  });

  const tareas = [
    tarea(mat.quimica.id, 'Informe de laboratorio: titulación', 0, true, 'en_progreso',
      'Incluir tabla de datos, cálculo de molaridad y análisis de error.'),
    tarea(mat.matematica.id, 'Ejercicios de derivadas, pág. 84', 1, true),
    tarea(mat.lengua.id, 'Ensayo argumentativo, 800 palabras', 3, true,
      'pendiente', 'Tema libre dentro de literatura latinoamericana.'),
    tarea(mat.fisica.id, 'Problemas de movimiento circular', 5, true),
    tarea(mat.historia.id, 'Línea de tiempo del siglo XX', 6),
    tarea(mat.ingles.id, 'Oral presentation draft', 2),
    tarea(mat.matematica.id, 'Prueba de integrales', 14),
    tarea(mat.quimica.id, 'Consulta sobre enlaces químicos', -2),
    tarea(mat.lengua.id, 'Lectura capítulo 4', -1, false, 'entregada'),
  ];

  return {
    materias: Object.values(mat),
    bloques,
    tareas,
    periodos: PERIODOS_POR_DEFECTO,
  };
}
