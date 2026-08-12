import React, { useEffect, useState } from 'react';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonList, IonItem, IonInput, IonLabel, IonNote,
} from '@ionic/react';
import type { Materia } from '../types';
import { useDatos } from '../hooks/useDatos';
import { PALETA } from '../utils/colores';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  materia?: Materia | null;
}

/**
 * Todos los campos son de texto libre. No hay lista fija de materias ni de
 * niveles: cada estudiante cursa un plan distinto según su año y su programa.
 */
const ModalMateria: React.FC<Props> = ({ abierto, onCerrar, materia }) => {
  const { crearMateria, actualizarMateria } = useDatos();
  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState(PALETA[0].clave);
  const [docente, setDocente] = useState('');
  const [aula, setAula] = useState('');
  const [nivel, setNivel] = useState('');
  const [programa, setPrograma] = useState('');

  useEffect(() => {
    if (!abierto) return;
    setNombre(materia?.nombre ?? '');
    setColor(materia?.color ?? PALETA[0].clave);
    setDocente(materia?.docente ?? '');
    setAula(materia?.aula ?? '');
    setNivel(materia?.nivel ?? '');
    setPrograma(materia?.programa ?? '');
  }, [abierto, materia]);

  const puedeGuardar = nombre.trim().length > 0;

  const guardar = () => {
    if (!puedeGuardar) return;
    const campos = {
      nombre: nombre.trim(),
      color,
      docente: docente.trim() || undefined,
      aula: aula.trim() || undefined,
      nivel: nivel.trim() || undefined,
      programa: programa.trim() || undefined,
    };
    if (materia) actualizarMateria({ ...materia, ...campos });
    else crearMateria(campos);
    onCerrar();
  };

  return (
    <IonModal isOpen={abierto} onDidDismiss={onCerrar}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonButton onClick={onCerrar}>Cancelar</IonButton></IonButtons>
          <IonTitle>{materia ? 'Editar materia' : 'Nueva materia'}</IonTitle>
          <IonButtons slot="end">
            <IonButton strong disabled={!puedeGuardar} onClick={guardar}>Guardar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList inset>
          <IonItem>
            <IonInput
              label="Nombre de la materia" labelPlacement="stacked"
              placeholder="Escribe el nombre tal como aparece en tu malla"
              value={nombre} onIonInput={(e) => setNombre(e.detail.value ?? '')}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="Nivel o curso" labelPlacement="stacked"
              placeholder="10mo, 1ero de bachillerato, 3ro BGU"
              value={nivel} onIonInput={(e) => setNivel(e.detail.value ?? '')}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="Programa" labelPlacement="stacked"
              placeholder="PAI, IB, técnico, general"
              value={programa} onIonInput={(e) => setPrograma(e.detail.value ?? '')}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="Docente" labelPlacement="stacked" placeholder="Opcional"
              value={docente} onIonInput={(e) => setDocente(e.detail.value ?? '')}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="Aula" labelPlacement="stacked" placeholder="Opcional"
              value={aula} onIonInput={(e) => setAula(e.detail.value ?? '')}
            />
          </IonItem>
        </IonList>

        <IonNote className="copol-nota">
          Escribe tus materias tal como las cursas. Secundaria y bachillerato tienen
          planes distintos, y dentro del bachillerato cada programa cambia las asignaturas.
        </IonNote>

        <IonLabel className="copol-seccion">Color de la materia</IonLabel>
        <div className="copol-paleta">
          {PALETA.map((c) => (
            <button
              key={c.clave} type="button" aria-label={c.nombre}
              aria-pressed={color === c.clave}
              className={`copol-swatch ${color === c.clave ? 'elegido' : ''}`}
              style={{ background: c.hex }} onClick={() => setColor(c.clave)}
            />
          ))}
        </div>
      </IonContent>
    </IonModal>
  );
};

export default ModalMateria;