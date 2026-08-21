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
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonNote,
} from '@ionic/react';
import type { Tarea, EstadoTarea } from '../types';
import { useDatos } from '../hooks/useDatos';
import { hoyISO, sumarDias } from '../utils/fechas';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  /** Si viene, se edita. Si no, se crea. */
  tarea?: Tarea | null;
  materiaFija?: string;
  bloqueFijo?: string;
}

const ModalTarea: React.FC<Props> = ({ abierto, onCerrar, tarea, materiaFija, bloqueFijo }) => {
  const { datos, crearTarea, actualizarTarea } = useDatos();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [materiaId, setMateriaId] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState(hoyISO());
  const [estado, setEstado] = useState<EstadoTarea>('pendiente');
  const [importante, setImportante] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    if (tarea) {
      setTitulo(tarea.titulo);
      setDescripcion(tarea.descripcion ?? '');
      setMateriaId(tarea.materiaId);
      setFechaEntrega(tarea.fechaEntrega);
      setEstado(tarea.estado);
      setImportante(tarea.importante);
    } else {
      setTitulo('');
      setDescripcion('');
      setMateriaId(materiaFija ?? datos.materias[0]?.id ?? '');
      setFechaEntrega(sumarDias(hoyISO(), 1));
      setEstado('pendiente');
      setImportante(false);
    }
  }, [abierto, tarea, materiaFija, datos.materias]);

  const puedeGuardar = titulo.trim().length > 0 && materiaId !== '';

  const guardar = () => {
    if (!puedeGuardar) return;
    if (tarea) {
      actualizarTarea({
        ...tarea,
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        materiaId,
        fechaEntrega,
        estado,
        importante,
      });
    } else {
      crearTarea({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        materiaId,
        bloqueId: bloqueFijo,
        fechaEntrega,
        estado,
        importante,
      });
    }
    onCerrar();
  };

  return (
    <IonModal isOpen={abierto} onDidDismiss={onCerrar}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onCerrar}>Cancelar</IonButton>
          </IonButtons>
          <IonTitle>{tarea ? 'Editar tarea' : 'Nueva tarea'}</IonTitle>
          <IonButtons slot="end">
            <IonButton strong disabled={!puedeGuardar} onClick={guardar}>
              Guardar
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="copol-formulario">
        <p className="copol-formulario-intro">
          {tarea ? 'Actualiza solo lo que necesites.' : 'Título, materia y fecha son suficientes para empezar.'}
        </p>

        <IonList inset className="copol-formulario-lista">
          <IonItem>
            <IonInput
              label="Título"
              labelPlacement="stacked"
              placeholder="Informe de laboratorio"
              value={titulo}
              onIonInput={(e) => setTitulo(e.detail.value ?? '')}
            />
          </IonItem>

          <IonItem>
            <IonSelect
              label="Materia"
              labelPlacement="stacked"
              placeholder="Elige una materia"
              value={materiaId}
              onIonChange={(e) => setMateriaId(e.detail.value)}
            >
              {datos.materias.map((m) => (
                <IonSelectOption key={m.id} value={m.id}>
                  {m.nombre}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonTextarea
              label="Detalles"
              labelPlacement="stacked"
              placeholder="Qué pide el profesor, extensión, formato"
              autoGrow
              rows={2}
              value={descripcion}
              onIonInput={(e) => setDescripcion(e.detail.value ?? '')}
            />
          </IonItem>

          <IonItem>
            <IonInput
              type="date"
              label="Fecha de entrega"
              labelPlacement="stacked"
              value={fechaEntrega}
              onIonInput={(e) => setFechaEntrega(e.detail.value ?? hoyISO())}
            />
          </IonItem>

          <IonItem>
            <IonSelect
              label="Estado"
              labelPlacement="stacked"
              value={estado}
              onIonChange={(e) => setEstado(e.detail.value as EstadoTarea)}
            >
              <IonSelectOption value="pendiente">Pendiente</IonSelectOption>
              <IonSelectOption value="en_progreso">En progreso</IonSelectOption>
              <IonSelectOption value="entregada">Entregada</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonToggle checked={importante} onIonChange={(e) => setImportante(e.detail.checked)}>
              Marcar como importante
            </IonToggle>
          </IonItem>
        </IonList>

        {datos.materias.length === 0 && (
          <IonNote color="danger" className="copol-formulario-aviso">
            Primero crea una materia en la pestaña Materias.
          </IonNote>
        )}
      </IonContent>
    </IonModal>
  );
};

export default ModalTarea;
