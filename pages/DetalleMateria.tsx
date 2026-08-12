import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonList,
  IonListHeader,
  IonLabel,
  IonItem,
  IonNote,
  IonFab,
  IonFabButton,
  IonIcon,
} from '@ionic/react';
import { add } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { useDatos } from '../hooks/useDatos';
import { DIAS } from '../types';
import type { Tarea } from '../types';
import TarjetaTarea from '../components/TarjetaTarea';
import ModalTarea from '../components/ModalTarea';
import { aMinutos } from '../utils/fechas';

const DetalleMateria: React.FC = () => {
  const { materiaId } = useParams<{ materiaId: string }>();
  const { datos, materiaDe } = useDatos();
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Tarea | null>(null);

  const materia = materiaDe(materiaId);

  const clases = datos.bloques
    .filter((b) => b.materiaId === materiaId)
    .sort((a, b) => a.diaSemana - b.diaSemana || aMinutos(a.horaInicio) - aMinutos(b.horaInicio));

  const tareas = datos.tareas
    .filter((t) => t.materiaId === materiaId)
    .sort((a, b) => a.fechaEntrega.localeCompare(b.fechaEntrega));

  const pendientes = tareas.filter((t) => t.estado !== 'entregada');
  const entregadas = tareas.filter((t) => t.estado === 'entregada');

  const abrirEdicion = (t: Tarea) => {
    setEditando(t);
    setModal(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/materias" text="Atrás" />
          </IonButtons>
          <IonTitle>{materia?.nombre ?? 'Materia'}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {!materia ? (
          <div className="copol-vacio">
            <h2>Esta materia ya no existe</h2>
          </div>
        ) : (
          <>
            {clases.length > 0 && (
              <IonNote className="copol-nota">
                {clases
                  .map(
                    (c) =>
                      `${DIAS.find((d) => d.valor === c.diaSemana)?.corto} ${c.horaInicio}`
                  )
                  .join(' · ')}
              </IonNote>
            )}

            <IonList inset>
              <IonListHeader>
                <IonLabel>Pendientes</IonLabel>
              </IonListHeader>
              {pendientes.length === 0 ? (
                <IonItem lines="none">
                  <IonNote>Nada pendiente en {materia.nombre}.</IonNote>
                </IonItem>
              ) : (
                pendientes.map((t) => (
                  <TarjetaTarea key={t.id} tarea={t} onEditar={abrirEdicion} mostrarMateria={false} />
                ))
              )}
            </IonList>

            {entregadas.length > 0 && (
              <IonList inset>
                <IonListHeader>
                  <IonLabel>Entregadas</IonLabel>
                </IonListHeader>
                {entregadas.map((t) => (
                  <TarjetaTarea key={t.id} tarea={t} onEditar={abrirEdicion} mostrarMateria={false} />
                ))}
              </IonList>
            )}

            <div className="copol-espacio-fab" />

            <IonFab slot="fixed" vertical="bottom" horizontal="end">
              <IonFabButton
                aria-label="Nueva tarea"
                onClick={() => {
                  setEditando(null);
                  setModal(true);
                }}
              >
                <IonIcon icon={add} />
              </IonFabButton>
            </IonFab>

            <ModalTarea
              abierto={modal}
              onCerrar={() => setModal(false)}
              tarea={editando}
              materiaFija={materia.id}
            />
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default DetalleMateria;
