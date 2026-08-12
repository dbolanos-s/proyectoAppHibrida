import React from 'react';
import { IonList, IonItem, IonLabel, IonNote, IonIcon } from '@ionic/react';
import {
  addCircle, createOutline, calendarNumber, star, starOutline,
  checkmarkCircle, arrowUndoCircle, trashBin, gridOutline, removeCircle,
} from 'ionicons/icons';
import type { Evento, TipoEvento } from '../types';

const ICONO: Record<TipoEvento, string> = {
  materia_creada: addCircle,
  materia_editada: createOutline,
  clase_asignada: gridOutline,
  clase_liberada: removeCircle,
  tarea_creada: addCircle,
  tarea_editada: createOutline,
  fecha_movida: calendarNumber,
  destacada: star,
  sin_destacar: starOutline,
  entregada: checkmarkCircle,
  reabierta: arrowUndoCircle,
  tarea_eliminada: trashBin,
};

function cuandoFue(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'hace un momento';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'ayer';
  if (d < 30) return `hace ${d} días`;
  return new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
}

const HistorialMateria: React.FC<{ eventos: Evento[] }> = ({ eventos }) => {
  if (eventos.length === 0) {
    return (
      <IonNote className="copol-nota">
        Aún no hay movimientos registrados. Cada tarea que crees, muevas o entregues
        quedará anotada aquí.
      </IonNote>
    );
  }

  return (
    <IonList inset>
      {eventos.map((e) => (
        <IonItem key={e.id} lines="full" className="copol-evento">
          <IonIcon slot="start" icon={ICONO[e.tipo]} aria-hidden="true" className="copol-evento-icono" />
          <IonLabel className="ion-text-wrap">
            <p className="copol-evento-detalle">{e.detalle}</p>
            <IonNote>{cuandoFue(e.fecha)}</IonNote>
          </IonLabel>
        </IonItem>
      ))}
    </IonList>
  );
};

export default HistorialMateria;