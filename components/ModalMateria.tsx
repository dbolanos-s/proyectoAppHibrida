import React, { useEffect, useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonLabel,
} from '@ionic/react';
import type { Materia } from '../types';
import { useDatos } from '../hooks/useDatos';
import { PALETA } from '../utils/colores';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  materia?: Materia | null;
}

const ModalMateria: React.FC<Props> = ({ abierto, onCerrar, materia }) => {
  const { crearMateria, actualizarMateria } = useDatos();
  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState(PALETA[0].clave);
  const [docente, setDocente] = useState('');
  const [aula, setAula] = useState('');

  useEffect(() => {
    if (!abierto) return;
    setNombre(materia?.nombre ?? '');
    setColor(materia?.color ?? PALETA[0].clave);
    setDocente(materia?.docente ?? '');
    setAula(materia?.aula ?? '');
  }, [abierto, materia]);

  const puedeGuardar = nombre.trim().length > 0;

  const guardar = () => {
    if (!puedeGuardar) return;
    const datos = {
      nombre: nombre.trim(),
      color,
      docente: docente.trim() || undefined,
      aula: aula.trim() || undefined,
    };
    if (materia) actualizarMateria({ ...materia, ...datos });
    else crearMateria(datos);
    onCerrar();
  };

  return (
    <IonModal isOpen={abierto} onDidDismiss={onCerrar}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onCerrar}>Cancelar</IonButton>
          </IonButtons>
          <IonTitle>{materia ? 'Editar materia' : 'Nueva materia'}</IonTitle>
          <IonButtons slot="end">
            <IonButton strong disabled={!puedeGuardar} onClick={guardar}>
              Guardar
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonList inset>
          <IonItem>
            <IonInput
              label="Nombre"
              labelPlacement="stacked"
              placeholder="Química"
              value={nombre}
              onIonInput={(e) => setNombre(e.detail.value ?? '')}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="Docente"
              labelPlacement="stacked"
              placeholder="Opcional"
              value={docente}
              onIonInput={(e) => setDocente(e.detail.value ?? '')}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="Aula"
              labelPlacement="stacked"
              placeholder="Opcional"
              value={aula}
              onIonInput={(e) => setAula(e.detail.value ?? '')}
            />
          </IonItem>
        </IonList>

        <IonLabel className="copol-seccion">Color</IonLabel>
        <div className="copol-paleta">
          {PALETA.map((c) => (
            <button
              key={c.clave}
              type="button"
              aria-label={c.nombre}
              aria-pressed={color === c.clave}
              className={`copol-swatch ${color === c.clave ? 'elegido' : ''}`}
              style={{ background: c.hex }}
              onClick={() => setColor(c.clave)}
            />
          ))}
        </div>
      </IonContent>
    </IonModal>
  );
};

export default ModalMateria;
