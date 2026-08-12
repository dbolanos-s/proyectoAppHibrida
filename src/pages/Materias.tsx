import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonLabel, IonNote, IonBadge, IonFab, IonFabButton, IonIcon,
  IonItemSliding, IonItemOptions, IonItemOption, IonButtons, IonButton,
} from '@ionic/react';
import { add, trash, create, settingsOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useDatos } from '../hooks/useDatos';
import type { Materia } from '../types';
import ModalMateria from '../components/ModalMateria';
import { hexDeMateria } from '../utils/colores';

const Materias: React.FC = () => {
  const { datos, eliminarMateria } = useDatos();
  const history = useHistory();
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Materia | null>(null);

  const abrir = (m: Materia | null) => { setEditando(m); setModal(true); };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Materias</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push('/ajustes')} aria-label="Ajustes">
              <IonIcon slot="icon-only" icon={settingsOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {datos.materias.length === 0 ? (
          <div className="copol-vacio">
            <h2>Empieza por tus materias</h2>
            <p>
              Escribe las asignaturas que cursas este año. Cada tarea pertenecerá a una
              de ellas y luego las colocarás en tu horario.
            </p>
            <IonButton fill="outline" size="small" onClick={() => abrir(null)}>
              Crear la primera materia
            </IonButton>
          </div>
        ) : (
          <IonList inset>
            {datos.materias.map((m) => {
              const pendientes = datos.tareas.filter(
                (t) => t.materiaId === m.id && t.estado !== 'entregada'
              ).length;
              const clases = datos.bloques.filter((b) => b.materiaId === m.id).length;
              const subtitulo = [
                `${clases} ${clases === 1 ? 'clase' : 'clases'} por semana`,
                m.nivel, m.programa, m.docente,
              ].filter(Boolean).join(' · ');

              return (
                <IonItemSliding key={m.id}>
                  <IonItem button detail onClick={() => history.push(`/materia/${m.id}`)}>
                    <span className="copol-franja"
                      style={{ background: hexDeMateria(m.color) }} aria-hidden="true" />
                    <IonLabel className="ion-text-wrap">
                      <h2>{m.nombre}</h2>
                      <p>{subtitulo}</p>
                    </IonLabel>
                    {pendientes > 0 && <IonBadge slot="end">{pendientes}</IonBadge>}
                  </IonItem>
                  <IonItemOptions side="end">
                    <IonItemOption onClick={() => abrir(m)}>
                      <IonIcon slot="icon-only" icon={create} />
                    </IonItemOption>
                    <IonItemOption color="danger" onClick={() => eliminarMateria(m.id)}>
                      <IonIcon slot="icon-only" icon={trash} />
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              );
            })}
          </IonList>
        )}

        {datos.materias.length > 0 && (
          <IonNote className="copol-nota">
            Desliza una materia hacia la izquierda para editarla o eliminarla. Eliminar
            una materia borra también sus clases, sus tareas y su historial.
          </IonNote>
        )}

        <div className="copol-espacio-fab" />

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton aria-label="Nueva materia" onClick={() => abrir(null)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <ModalMateria abierto={modal} onCerrar={() => setModal(false)} materia={editando} />
      </IonContent>
    </IonPage>
  );
};

export default Materias;