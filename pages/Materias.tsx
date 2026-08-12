import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonBadge,
  IonFab,
  IonFabButton,
  IonIcon,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonButton,
} from '@ionic/react';
import { add, trash, create } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useDatos } from '../hooks/useDatos';
import type { Materia } from '../types';
import ModalMateria from '../components/ModalMateria';
import { hexDeMateria } from '../utils/colores';

const Materias: React.FC = () => {
  const { datos, eliminarMateria, cargarEjemplo, reiniciar } = useDatos();
  const history = useHistory();
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Materia | null>(null);

  const abrir = (m: Materia | null) => {
    setEditando(m);
    setModal(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Materias</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {datos.materias.length === 0 ? (
          <div className="copol-vacio">
            <h2>Empieza por tus materias</h2>
            <p>
              Cada tarea pertenece a una materia. Créalas aquí y luego colócalas en tu horario.
            </p>
            <IonButton fill="outline" size="small" onClick={cargarEjemplo}>
              Cargar datos de ejemplo
            </IonButton>
          </div>
        ) : (
          <IonList inset>
            {datos.materias.map((m) => {
              const pendientes = datos.tareas.filter(
                (t) => t.materiaId === m.id && t.estado !== 'entregada'
              ).length;
              const clases = datos.bloques.filter((b) => b.materiaId === m.id).length;
              return (
                <IonItemSliding key={m.id}>
                  <IonItem button detail onClick={() => history.push(`/materia/${m.id}`)}>
                    <span
                      className="copol-franja"
                      style={{ background: hexDeMateria(m.color) }}
                      aria-hidden="true"
                    />
                    <IonLabel>
                      <h2>{m.nombre}</h2>
                      <p>
                        {clases} {clases === 1 ? 'clase' : 'clases'} por semana
                        {m.docente ? ` · ${m.docente}` : ''}
                      </p>
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

        <IonNote className="copol-nota">
          Desliza una materia hacia la izquierda para editarla o eliminarla. Eliminar una materia
          borra también sus clases y sus tareas.
        </IonNote>

        {datos.materias.length > 0 && (
          <div className="ion-padding">
            <IonButton expand="block" fill="clear" color="medium" size="small" onClick={reiniciar}>
              Borrar todos los datos
            </IonButton>
          </div>
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
