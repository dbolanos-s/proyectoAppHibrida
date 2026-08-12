import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonModal,
  IonList,
  IonItem,
  IonInput,
  IonLabel,
  IonNote,
} from '@ionic/react';
import { optionsOutline, trash, add } from 'ionicons/icons';
import CuadriculaHorario from '../components/CuadriculaHorario';
import { useDatos } from '../hooks/useDatos';
import type { Periodo } from '../types';

const Horario: React.FC = () => {
  const { datos, guardarPeriodos } = useDatos();
  const [config, setConfig] = useState(false);
  const [borrador, setBorrador] = useState<Periodo[]>([]);

  const abrirConfig = () => {
    setBorrador(datos.periodos.map((p) => ({ ...p })));
    setConfig(true);
  };

  const cambiar = (i: number, campo: 'horaInicio' | 'horaFin', valor: string) => {
    setBorrador((b) => b.map((p, idx) => (idx === i ? { ...p, [campo]: valor } : p)));
  };

  const agregar = () => {
    setBorrador((b) => [
      ...b,
      { orden: b.length + 1, horaInicio: '12:00', horaFin: '12:45' },
    ]);
  };

  const quitar = (i: number) => {
    setBorrador((b) => b.filter((_, idx) => idx !== i).map((p, idx) => ({ ...p, orden: idx + 1 })));
  };

  const aplicar = () => {
    guardarPeriodos(borrador);
    setConfig(false);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Horario</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={abrirConfig} aria-label="Configurar períodos">
              <IonIcon slot="icon-only" icon={optionsOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <CuadriculaHorario />

        <IonModal isOpen={config} onDidDismiss={() => setConfig(false)}>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={() => setConfig(false)}>Cancelar</IonButton>
              </IonButtons>
              <IonTitle>Períodos</IonTitle>
              <IonButtons slot="end">
                <IonButton strong onClick={aplicar}>
                  Guardar
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
            <IonNote className="copol-nota">
              Define las horas de tu jornada. Al cambiar una hora de inicio, las materias ya
              asignadas a ese período se conservan.
            </IonNote>

            <IonList inset>
              {borrador.map((p, i) => (
                <IonItem key={i}>
                  <IonLabel slot="start" className="copol-orden">
                    {p.orden}
                  </IonLabel>
                  <IonInput
                    type="time"
                    label="Inicia"
                    labelPlacement="stacked"
                    value={p.horaInicio}
                    onIonInput={(e) => cambiar(i, 'horaInicio', e.detail.value ?? '')}
                  />
                  <IonInput
                    type="time"
                    label="Termina"
                    labelPlacement="stacked"
                    value={p.horaFin}
                    onIonInput={(e) => cambiar(i, 'horaFin', e.detail.value ?? '')}
                  />
                  <IonButton fill="clear" color="danger" slot="end" onClick={() => quitar(i)}>
                    <IonIcon slot="icon-only" icon={trash} />
                  </IonButton>
                </IonItem>
              ))}
            </IonList>

            <IonButton expand="block" fill="outline" onClick={agregar}>
              <IonIcon slot="start" icon={add} />
              Agregar período
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Horario;
