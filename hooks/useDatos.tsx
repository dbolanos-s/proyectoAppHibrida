import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { DatosApp, Materia, Bloque, Tarea, Periodo } from '../types';
import { cargarDatos, guardarDatos, DATOS_VACIOS, nuevoId } from '../services/storage';
import { datosDeEjemplo } from '../services/ejemplo';
import { actualizarAviso, pedirPermiso } from '../services/notificaciones';

interface ContextoDatos {
  datos: DatosApp;
  listo: boolean;
  crearMateria: (m: Omit<Materia, 'id'>) => void;
  actualizarMateria: (m: Materia) => void;
  eliminarMateria: (id: string) => void;
  asignarBloque: (materiaId: string, diaSemana: number, periodo: Periodo) => void;
  quitarBloque: (bloqueId: string) => void;
  guardarPeriodos: (p: Periodo[]) => void;
  crearTarea: (t: Omit<Tarea, 'id' | 'fechaCreacion'>) => void;
  actualizarTarea: (t: Tarea) => void;
  eliminarTarea: (id: string) => void;
  alternarImportante: (id: string) => void;
  marcarEntregada: (id: string) => void;
  materiaDe: (id: string) => Materia | undefined;
  cargarEjemplo: () => void;
  reiniciar: () => void;
}

const Contexto = createContext<ContextoDatos | null>(null);

export const ProveedorDatos: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [datos, setDatos] = useState<DatosApp>(DATOS_VACIOS);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    cargarDatos().then((d) => {
      setDatos(d);
      setListo(true);
    });
  }, []);

  // Persiste en cada cambio, pero solo después de la carga inicial:
  // guardar antes sobrescribiría los datos reales con los vacíos.
  useEffect(() => {
    if (!listo) return;
    guardarDatos(datos);
    actualizarAviso(datos.tareas);
  }, [datos, listo]);

  const crearMateria = useCallback((m: Omit<Materia, 'id'>) => {
    setDatos((d) => ({ ...d, materias: [...d.materias, { ...m, id: nuevoId() }] }));
  }, []);

  const actualizarMateria = useCallback((m: Materia) => {
    setDatos((d) => ({ ...d, materias: d.materias.map((x) => (x.id === m.id ? m : x)) }));
  }, []);

  const eliminarMateria = useCallback((id: string) => {
    setDatos((d) => ({
      ...d,
      materias: d.materias.filter((x) => x.id !== id),
      bloques: d.bloques.filter((b) => b.materiaId !== id),
      tareas: d.tareas.filter((t) => t.materiaId !== id),
    }));
  }, []);

  const asignarBloque = useCallback((materiaId: string, diaSemana: number, periodo: Periodo) => {
    setDatos((d) => {
      // Una celda solo puede tener una materia: reemplazamos si ya estaba ocupada.
      const libres = d.bloques.filter(
        (b) => !(b.diaSemana === diaSemana && b.horaInicio === periodo.horaInicio)
      );
      const bloque: Bloque = {
        id: nuevoId(),
        materiaId,
        diaSemana,
        horaInicio: periodo.horaInicio,
        horaFin: periodo.horaFin,
      };
      return { ...d, bloques: [...libres, bloque] };
    });
  }, []);

  const quitarBloque = useCallback((bloqueId: string) => {
    setDatos((d) => ({
      ...d,
      bloques: d.bloques.filter((b) => b.id !== bloqueId),
      // Las tareas no se borran: pierden el vínculo con el bloque, no la materia.
      tareas: d.tareas.map((t) => (t.bloqueId === bloqueId ? { ...t, bloqueId: undefined } : t)),
    }));
  }, []);

  const guardarPeriodos = useCallback((periodos: Periodo[]) => {
    setDatos((d) => ({ ...d, periodos }));
  }, []);

  const crearTarea = useCallback((t: Omit<Tarea, 'id' | 'fechaCreacion'>) => {
    const tarea: Tarea = { ...t, id: nuevoId(), fechaCreacion: new Date().toISOString() };
    setDatos((d) => ({ ...d, tareas: [...d.tareas, tarea] }));
    if (tarea.importante) pedirPermiso();
  }, []);

  const actualizarTarea = useCallback((t: Tarea) => {
    setDatos((d) => ({ ...d, tareas: d.tareas.map((x) => (x.id === t.id ? t : x)) }));
  }, []);

  const eliminarTarea = useCallback((id: string) => {
    setDatos((d) => ({ ...d, tareas: d.tareas.filter((t) => t.id !== id) }));
  }, []);

  const alternarImportante = useCallback((id: string) => {
    setDatos((d) => {
      const tareas = d.tareas.map((t) => (t.id === id ? { ...t, importante: !t.importante } : t));
      const marcada = tareas.find((t) => t.id === id);
      if (marcada?.importante) pedirPermiso();
      return { ...d, tareas };
    });
  }, []);

  const marcarEntregada = useCallback((id: string) => {
    setDatos((d) => ({
      ...d,
      tareas: d.tareas.map((t) =>
        t.id === id
          ? { ...t, estado: t.estado === 'entregada' ? 'pendiente' : 'entregada' }
          : t
      ),
    }));
  }, []);

  const materiaDe = useCallback(
    (id: string) => datos.materias.find((m) => m.id === id),
    [datos.materias]
  );

  const cargarEjemplo = useCallback(() => setDatos(datosDeEjemplo()), []);

  const reiniciar = useCallback(() => setDatos({ ...DATOS_VACIOS }), []);

  return (
    <Contexto.Provider
      value={{
        datos,
        listo,
        crearMateria,
        actualizarMateria,
        eliminarMateria,
        asignarBloque,
        quitarBloque,
        guardarPeriodos,
        crearTarea,
        actualizarTarea,
        eliminarTarea,
        alternarImportante,
        marcarEntregada,
        materiaDe,
        cargarEjemplo,
        reiniciar,
      }}
    >
      {children}
    </Contexto.Provider>
  );
};

export function useDatos(): ContextoDatos {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useDatos debe usarse dentro de <ProveedorDatos>');
  return ctx;
}
