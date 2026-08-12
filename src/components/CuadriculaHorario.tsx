import React, { useState } from 'react';
import { IonAlert, IonBadge, IonNote } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { DIAS } from '../types';
import type { Periodo } from '../types';
import { useDatos } from '../hooks/useDatos';
import { hexDeMateria } from '../utils/colores';
import { aMinutos, minutosAhora, diaSemanaHoy } from '../utils/fechas';

interface Seleccion {
  dia: number;
  periodo: Periodo;
}

const CuadriculaHorario: React.FC = () => {
  const { datos, asignarBloque, quitarBloque } = useDatos();
  const history = useHistory();
  const [seleccion, setSeleccion] = useState<Seleccion | null>(null);

  const diaHoy = diaSemanaHoy();
  const ahora = minutosAhora();

  const bloqueDe = (dia: number, horaInicio: string) =>
    datos.bloques.find((b) => b.diaSemana === dia && b.horaInicio === horaInicio);

  const pendientesDe = (materiaId: string) =>
    datos.tareas.filter((t) => t.materiaId === materiaId && t.estado !== 'entregada').length;

  const esAhora = (dia: number, p: Periodo) =>
    dia === diaHoy && ahora >= aMinutos(p.horaInicio) && ahora < aMinutos(p.horaFin);

  if (datos.materias.length === 0) {
    return (
      <IonNote className="copol-vacio">
        Aún no tienes materias. Créalas en la pestaña Materias y vuelve aquí para armar tu horario.
      </IonNote>
    );
  }

  return (
    <>
      <div className="copol-grid" role="table" aria-label="Horario semanal">
        <div className="copol-grid-cabecera" role="row">
          <div className="copol-col-hora" />
          {DIAS.map((d) => (
            <div
              key={d.valor}
              role="columnheader"
              className={`copol-dia ${d.valor === diaHoy ? 'hoy' : ''}`}
            >
              {d.corto}
            </div>
          ))}
        </div>

        {datos.periodos.map((p) => (
          <div className="copol-grid-fila" role="row" key={p.orden}>
            <div className="copol-col-hora" role="rowheader">
              <strong>{p.horaInicio}</strong>
              <span>{p.horaFin}</span>
            </div>

            {DIAS.map((d) => {
              const bloque = bloqueDe(d.valor, p.horaInicio);
              const materia = bloque && datos.materias.find((m) => m.id === bloque.materiaId);
              const activo = esAhora(d.valor, p);

              if (!bloque || !materia) {
                return (
                  <button
                    key={d.valor}
                    type="button"
                    className={`copol-celda vacia ${activo ? 'ahora' : ''}`}
                    aria-label={`Asignar materia el ${d.largo} a las ${p.horaInicio}`}
                    onClick={() => setSeleccion({ dia: d.valor, periodo: p })}
                  >
                    +
                  </button>
                );
              }

              const pendientes = pendientesDe(materia.id);
              return (
                <button
                  key={d.valor}
                  type="button"
                  className={`copol-celda llena ${activo ? 'ahora' : ''}`}
                  style={{ background: hexDeMateria(materia.color) }}
                  aria-label={`${materia.nombre}, ${d.largo} ${p.horaInicio}. ${pendientes} pendientes.`}
                  onClick={() => history.push(`/clase/${bloque.id}`)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    quitarBloque(bloque.id);
                  }}
                >
                  <span className="copol-celda-nombre">{materia.nombre}</span>
                  {pendientes > 0 && (
                    <IonBadge className="copol-celda-badge">{pendientes}</IonBadge>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <IonNote className="copol-nota">
        Toca una celda vacía para asignar materia. Mantén pulsada una celda ocupada para liberarla.
      </IonNote>

      <IonAlert
        isOpen={seleccion !== null}
        header="Asignar materia"
        onDidDismiss={() => setSeleccion(null)}
        inputs={datos.materias.map((m) => ({
          type: 'radio' as const,
          label: m.nombre,
          value: m.id,
        }))}
        buttons={[
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Asignar',
            handler: (materiaId: string) => {
              if (seleccion && materiaId) {
                asignarBloque(materiaId, seleccion.dia, seleccion.periodo);
              }
            },
          },
        ]}
      />
    </>
  );
};

export default CuadriculaHorario;
