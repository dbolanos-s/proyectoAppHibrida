import React from 'react';
import {
  IonItem,
  IonLabel,
  IonIcon,
  IonNote,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import { star, starOutline, checkmarkDone, trash, arrowUndo } from 'ionicons/icons';
import type { Tarea } from '../types';
import { useDatos } from '../hooks/useDatos';
import { hexDeMateria, estiloUrgencia } from '../utils/colores';
import ContadorTiempo from './ContadorTiempo';

interface Props {
  tarea: Tarea;
  onEditar?: (t: Tarea) => void;
  mostrarMateria?: boolean;
}

const TarjetaTarea: React.FC<Props> = ({ tarea, onEditar, mostrarMateria = true }) => {
  const { materiaDe, alternarImportante, marcarEntregada, eliminarTarea } = useDatos();
  const materia = materiaDe(tarea.materiaId);
  const estilo = estiloUrgencia(tarea);
  const entregada = tarea.estado === 'entregada';

  return (
    <IonItemSliding>
      <IonItem
        button
        detail={false}
        onClick={() => onEditar?.(tarea)}
        className={entregada ? 'copol-tarea entregada' : 'copol-tarea'}
      >
        <span
          className="copol-franja"
          style={{ background: `var(${estilo.variable})` }}
          aria-hidden="true"
        />
        <IonLabel>
          <h2 className={entregada ? 'tachado' : ''}>{tarea.titulo}</h2>
          {mostrarMateria && materia && (
            <p>
              <span
                className="copol-punto"
                style={{ background: hexDeMateria(materia.color) }}
                aria-hidden="true"
              />
              {materia.nombre}
            </p>
          )}
          <IonNote>
            <ContadorTiempo tarea={tarea} />
          </IonNote>
        </IonLabel>

        <IonIcon
          slot="end"
          icon={tarea.importante ? star : starOutline}
          className={tarea.importante ? 'copol-estrella activa' : 'copol-estrella'}
          aria-label={tarea.importante ? 'Quitar de destacadas' : 'Marcar como importante'}
          onClick={(e) => {
            e.stopPropagation();
            alternarImportante(tarea.id);
          }}
        />
      </IonItem>

      <IonItemOptions side="end">
        <IonItemOption color="success" onClick={() => marcarEntregada(tarea.id)}>
          <IonIcon slot="icon-only" icon={entregada ? arrowUndo : checkmarkDone} />
        </IonItemOption>
        <IonItemOption color="danger" onClick={() => eliminarTarea(tarea.id)}>
          <IonIcon slot="icon-only" icon={trash} />
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};

export default TarjetaTarea;
