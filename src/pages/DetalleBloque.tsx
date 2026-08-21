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

const DetalleBloque: React.FC = () => {
  const { bloqueId } = useParams<{ bloqueId: string }>();
  const { datos, materiaDe } = useDatos();
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Tarea | null>(null);

  const bloque = datos.bloques.find((b) => b.id === bloqueId);
  const materia = bloque ? materiaDe(bloque.materiaId) : undefined;

  const tareas = datos.tareas
    .filter((t) => materia && t.materiaId === materia.id)
    .sort((a, b) => a.fechaEntrega.localeCompare(b.fechaEntrega));

  const pendientes = tareas.filter((t) => t.estado !== 'entregada');
  const entregadas = tareas.filter((t) => t.estado === 'entregada');
  const dia = bloque ? DIAS.find((d) => d.valor === bloque.diaSemana) : undefined;

  const abrirEdicion = (t: Tarea) => {
    setEditando(t);
    setModal(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/horario" text="Atrás" />
          </IonButtons>
          <IonTitle>{materia?.nombre ?? 'Clase'}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="copol-pagina-detalle">
        {!bloque || !materia ? (
          <div className="copol-vacio">
            <h2>Esta clase ya no existe</h2>
            <p>Se liberó la celda del horario. Vuelve atrás y asigna la materia de nuevo.</p>
          </div>
        ) : (
          <>
            <IonNote className="copol-nota copol-resumen-detalle">
              {dia?.largo} · {bloque.horaInicio} – {bloque.horaFin}
              {materia.aula ? ` · ${materia.aula}` : ''}
              {materia.docente ? ` · ${materia.docente}` : ''}
            </IonNote>

            <IonList inset className="copol-lista-principal">
              <IonListHeader>
                <IonLabel>Pendientes</IonLabel>
              </IonListHeader>
              {pendientes.length === 0 ? (
                <p className="copol-inicio-vacio">
                  Nada pendiente. Usa el botón + para anotar una tarea.
                </p>
              ) : (
                pendientes.map((t) => (
                  <TarjetaTarea
                    key={t.id}
                    tarea={t}
                    onEditar={abrirEdicion}
                    mostrarMateria={false}
                  />
                ))
              )}
            </IonList>

            {entregadas.length > 0 && (
              <IonList inset className="copol-lista-principal">
                <IonListHeader>
                  <IonLabel>Entregadas</IonLabel>
                </IonListHeader>
                {entregadas.map((t) => (
                  <TarjetaTarea
                    key={t.id}
                    tarea={t}
                    onEditar={abrirEdicion}
                    mostrarMateria={false}
                  />
                ))}
              </IonList>
            )}

            <div className="copol-espacio-fab" />

            <IonFab slot="fixed" vertical="bottom" horizontal="end">
              <IonFabButton
                aria-label="Nueva tarea en esta clase"
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
              bloqueFijo={bloque.id}
            />
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default DetalleBloque;
