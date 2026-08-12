import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type {
  DatosApp, Materia, Bloque, Tarea, Periodo, Evento, TipoEvento, Preferencias,
} from '../types';
import { cargarDatos, guardarDatos, DATOS_VACIOS, nuevoId } from '../services/storage';
import { actualizarAviso, pedirPermiso } from '../services/notificaciones';
import { fechaLegible } from '../utils/fechas';

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
  historialDe: (materiaId: string) => Evento[];
  guardarPreferencias: (p: Partial<Preferencias>) => void;
  reemplazarTodo: (d: DatosApp) => void;
  reiniciar: () => void;
}

const Contexto = createContext<ContextoDatos | null>(null);

/** Construye un evento de historial ya redactado. */
function evento(materiaId: string, tipo: TipoEvento, detalle: string, tareaId?: string): Evento {
  return { id: nuevoId(), materiaId, tareaId, tipo, detalle, fecha: new Date().toISOString() };
}

export const ProveedorDatos: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [datos, setDatos] = useState<DatosApp>(DATOS_VACIOS);
  const [listo, setListo] = useState(false);
  const permisoPedido = useRef(false);

  useEffect(() => {
    cargarDatos().then((d) => {
      setDatos(d);
      setListo(true);
    });
  }, []);

  useEffect(() => {
    if (!listo) return;
    guardarDatos(datos);
    actualizarAviso(datos.tareas);
  }, [datos, listo]);

  /** Pide el permiso una sola vez por sesión, al marcar la primera destacada. */
  const permisoUnaVez = () => {
    if (permisoPedido.current) return;
    permisoPedido.current = true;
    pedirPermiso();
  };

  const registrar = (d: DatosApp, ...nuevos: Evento[]): DatosApp => ({
    ...d,
    // Los eventos más recientes van primero y se conservan los últimos 300.
    eventos: [...nuevos, ...d.eventos].slice(0, 300),
  });

  const crearMateria = useCallback((m: Omit<Materia, 'id'>) => {
    setDatos((d) => {
      const materia: Materia = { ...m, id: nuevoId() };
      return registrar(
        { ...d, materias: [...d.materias, materia] },
        evento(materia.id, 'materia_creada', `Materia "${materia.nombre}" creada`)
      );
    });
  }, []);

  const actualizarMateria = useCallback((m: Materia) => {
    setDatos((d) =>
      registrar(
        { ...d, materias: d.materias.map((x) => (x.id === m.id ? m : x)) },
        evento(m.id, 'materia_editada', `Datos de la materia actualizados`)
      )
    );
  }, []);

  const eliminarMateria = useCallback((id: string) => {
    setDatos((d) => ({
      ...d,
      materias: d.materias.filter((x) => x.id !== id),
      bloques: d.bloques.filter((b) => b.materiaId !== id),
      tareas: d.tareas.filter((t) => t.materiaId !== id),
      // El historial también se va: sin materia no hay dónde consultarlo.
      eventos: d.eventos.filter((e) => e.materiaId !== id),
    }));
  }, []);

  const asignarBloque = useCallback((materiaId: string, diaSemana: number, periodo: Periodo) => {
    setDatos((d) => {
      const libres = d.bloques.filter(
        (b) => !(b.diaSemana === diaSemana && b.horaInicio === periodo.horaInicio)
      );
      const bloque: Bloque = {
        id: nuevoId(), materiaId, diaSemana,
        horaInicio: periodo.horaInicio, horaFin: periodo.horaFin,
      };
      return registrar(
        { ...d, bloques: [...libres, bloque] },
        evento(materiaId, 'clase_asignada', `Clase agregada al horario: ${periodo.horaInicio}`)
      );
    });
  }, []);

  const quitarBloque = useCallback((bloqueId: string) => {
    setDatos((d) => {
      const bloque = d.bloques.find((b) => b.id === bloqueId);
      const base: DatosApp = {
        ...d,
        bloques: d.bloques.filter((b) => b.id !== bloqueId),
        tareas: d.tareas.map((t) => (t.bloqueId === bloqueId ? { ...t, bloqueId: undefined } : t)),
      };
      if (!bloque) return base;
      return registrar(base, evento(bloque.materiaId, 'clase_liberada', 'Clase quitada del horario'));
    });
  }, []);

  const guardarPeriodos = useCallback((periodos: Periodo[]) => {
    setDatos((d) => ({ ...d, periodos }));
  }, []);

  const crearTarea = useCallback((t: Omit<Tarea, 'id' | 'fechaCreacion'>) => {
    setDatos((d) => {
      const tarea: Tarea = { ...t, id: nuevoId(), fechaCreacion: new Date().toISOString() };
      return registrar(
        { ...d, tareas: [...d.tareas, tarea] },
        evento(tarea.materiaId, 'tarea_creada',
          `"${tarea.titulo}" para el ${fechaLegible(tarea.fechaEntrega)}`, tarea.id)
      );
    });
    if (t.importante) permisoUnaVez();
  }, []);

  const actualizarTarea = useCallback((t: Tarea) => {
    setDatos((d) => {
      const previa = d.tareas.find((x) => x.id === t.id);
      const nuevos: Evento[] = [];
      if (previa && previa.fechaEntrega !== t.fechaEntrega) {
        nuevos.push(evento(t.materiaId, 'fecha_movida',
          `"${t.titulo}": entrega movida del ${fechaLegible(previa.fechaEntrega)} al ${fechaLegible(t.fechaEntrega)}`,
          t.id));
      } else if (previa) {
        nuevos.push(evento(t.materiaId, 'tarea_editada', `"${t.titulo}" editada`, t.id));
      }
      return registrar({ ...d, tareas: d.tareas.map((x) => (x.id === t.id ? t : x)) }, ...nuevos);
    });
  }, []);

  const eliminarTarea = useCallback((id: string) => {
    setDatos((d) => {
      const t = d.tareas.find((x) => x.id === id);
      const base = { ...d, tareas: d.tareas.filter((x) => x.id !== id) };
      if (!t) return base;
      return registrar(base, evento(t.materiaId, 'tarea_eliminada', `"${t.titulo}" eliminada`));
    });
  }, []);

  const alternarImportante = useCallback((id: string) => {
    setDatos((d) => {
      const tareas = d.tareas.map((t) => (t.id === id ? { ...t, importante: !t.importante } : t));
      const t = tareas.find((x) => x.id === id);
      if (!t) return { ...d, tareas };
      if (t.importante) permisoUnaVez();
      return registrar({ ...d, tareas },
        evento(t.materiaId, t.importante ? 'destacada' : 'sin_destacar',
          `"${t.titulo}" ${t.importante ? 'marcada como importante' : 'ya no es importante'}`, t.id));
    });
  }, []);

  const marcarEntregada = useCallback((id: string) => {
    setDatos((d) => {
      const tareas = d.tareas.map((t) =>
        t.id === id ? { ...t, estado: t.estado === 'entregada' ? 'pendiente' as const : 'entregada' as const } : t
      );
      const t = tareas.find((x) => x.id === id);
      if (!t) return { ...d, tareas };
      const entregada = t.estado === 'entregada';
      return registrar({ ...d, tareas },
        evento(t.materiaId, entregada ? 'entregada' : 'reabierta',
          `"${t.titulo}" ${entregada ? 'marcada como entregada' : 'reabierta'}`, t.id));
    });
  }, []);

  const materiaDe = useCallback(
    (id: string) => datos.materias.find((m) => m.id === id),
    [datos.materias]
  );

  const historialDe = useCallback(
    (materiaId: string) => datos.eventos.filter((e) => e.materiaId === materiaId),
    [datos.eventos]
  );

  const guardarPreferencias = useCallback((p: Partial<Preferencias>) => {
    setDatos((d) => ({ ...d, preferencias: { ...d.preferencias, ...p } }));
  }, []);

  const reemplazarTodo = useCallback((d: DatosApp) => setDatos(d), []);

  const reiniciar = useCallback(() => setDatos({ ...DATOS_VACIOS }), []);

  return (
    <Contexto.Provider value={{
      datos, listo, crearMateria, actualizarMateria, eliminarMateria,
      asignarBloque, quitarBloque, guardarPeriodos, crearTarea, actualizarTarea,
      eliminarTarea, alternarImportante, marcarEntregada, materiaDe, historialDe,
      guardarPreferencias, reemplazarTodo, reiniciar,
    }}>
      {children}
    </Contexto.Provider>
  );
};

export function useDatos(): ContextoDatos {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useDatos debe usarse dentro de <ProveedorDatos>');
  return ctx;
}