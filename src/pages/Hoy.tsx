import React, { useMemo, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonListHeader,
  IonLabel,
  IonItem,
  IonNote,
  IonBadge,
  IonButton,
  IonFab,
  IonFabButton,
  IonIcon,
} from '@ionic/react';
import { add, star, calendarClear } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useDatos } from '../hooks/useDatos';
import type { Tarea } from '../types';
import TarjetaTarea from '../components/TarjetaTarea';
import ModalTarea from '../components/ModalTarea';
import TarjetaClima from '../components/TarjetaClima';
import GraficoEntregas from '../components/GraficoEntregas';
import { hexDeMateria } from '../utils/colores';
import {
  diaSemanaHoy,
  diasCalendario,
  aMinutos,
  minutosAhora,
  fechaLegible,
  nombreDiaLargo,
  hoyISO,
} from '../utils/fechas';

const Hoy: React.FC = () => {
  const { datos, listo, materiaDe } = useDatos();
  const history = useHistory();
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Tarea | null>(null);
  const [verTodas, setVerTodas] = useState(false);
  const [vistaGrafico, setVistaGrafico] = useState<'semana' | 'materia'>('semana');

  const activas = useMemo(
    () => datos.tareas.filter((t) => t.estado !== 'entregada'),
    [datos.tareas]
  );

  const destacadas = useMemo(
    () =>
      activas
        .filter((t) => t.importante)
        .sort((a, b) => a.fechaEntrega.localeCompare(b.fechaEntrega)),
    [activas]
  );

  const proximas = useMemo(
    () =>
      activas
        .filter((t) => {
          const d = diasCalendario(t.fechaEntrega);
          return !t.importante && d >= 0 && d <= 7;
        })
        .sort((a, b) => a.fechaEntrega.localeCompare(b.fechaEntrega)),
    [activas]
  );

  const diaHoy = diaSemanaHoy();
  const ahora = minutosAhora();

  const clasesHoy = useMemo(
    () =>
      datos.bloques
        .filter((b) => b.diaSemana === diaHoy)
        .sort((a, b) => aMinutos(a.horaInicio) - aMinutos(b.horaInicio)),
    [datos.bloques, diaHoy]
  );

  const visibles = verTodas ? destacadas : destacadas.slice(0, 3);
  const ocultas = destacadas.length - visibles.length;

  const abrirEdicion = (t: Tarea) => {
    setEditando(t);
    setModal(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Hoy</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="copol-inicio">
        <section className="copol-resumen-hoy" aria-label="Resumen de hoy">
          <div className="copol-resumen-fecha">
            <span>{nombreDiaLargo(hoyISO())}</span>
            <strong>{fechaLegible(hoyISO())}</strong>
          </div>
          <div className="copol-resumen-metricas">
            <div>
              <strong>{activas.length}</strong>
              <span>pendientes</span>
            </div>
            <div>
              <strong>{clasesHoy.length}</strong>
              <span>clases hoy</span>
            </div>
          </div>
        </section>

        {!listo && <IonNote className="copol-nota">Cargando tus datos…</IonNote>}
         <TarjetaClima />

        {/* 1. Destacadas */}
        <IonList inset className="copol-bloque-inicio">
          <IonListHeader>
            <IonLabel>
              <IonIcon icon={star} aria-hidden="true" /> Destacadas
            </IonLabel>
            {destacadas.length > 0 && <IonBadge>{destacadas.length}</IonBadge>}
          </IonListHeader>

          {destacadas.length === 0 ? (
            <p className="copol-inicio-vacio">
              Marca una tarea con la estrella para verla aquí con su cuenta regresiva.
            </p>
          ) : (
            visibles.map((t) => (
              <TarjetaTarea key={t.id} tarea={t} onEditar={abrirEdicion} />
            ))
          )}

          {ocultas > 0 && (
            <IonItem lines="none">
              <IonButton fill="clear" size="small" onClick={() => setVerTodas(true)}>
                Ver {ocultas} más
              </IonButton>
            </IonItem>
          )}
          {verTodas && destacadas.length > 3 && (
            <IonItem lines="none">
              <IonButton fill="clear" size="small" onClick={() => setVerTodas(false)}>
                Ver menos
              </IonButton>
            </IonItem>
          )}
        </IonList>

        {/* 2. Clases del día */}
        <IonList inset className="copol-bloque-inicio">
          <IonListHeader>
            <IonLabel>
              <IonIcon icon={calendarClear} aria-hidden="true" /> Clases de hoy
            </IonLabel>
          </IonListHeader>

          {diaHoy === 0 ? (
            <p className="copol-inicio-vacio">
              Hoy es fin de semana. Buen momento para adelantar pendientes.
            </p>
          ) : clasesHoy.length === 0 ? (
            <p className="copol-inicio-vacio">
              No hay clases registradas. Puedes armar tu día desde Horario.
            </p>
          ) : (
            clasesHoy.map((b) => {
              const materia = materiaDe(b.materiaId);
              if (!materia) return null;
              const enCurso = ahora >= aMinutos(b.horaInicio) && ahora < aMinutos(b.horaFin);
              const pendientes = activas.filter((t) => t.materiaId === materia.id).length;
              return (
                <IonItem
                  key={b.id}
                  button
                  detail
                  className={enCurso ? 'copol-clase en-curso' : 'copol-clase'}
                  onClick={() => history.push(`/clase/${b.id}`)}
                >
                  <span
                    className="copol-franja"
                    style={{ background: hexDeMateria(materia.color) }}
                    aria-hidden="true"
                  />
                  <IonLabel>
                    <h2>{materia.nombre}</h2>
                    <p>
                      {b.horaInicio} – {b.horaFin}
                      {materia.aula ? ` · ${materia.aula}` : ''}
                      {enCurso ? ' · en curso' : ''}
                    </p>
                  </IonLabel>
                  {pendientes > 0 && <IonBadge slot="end">{pendientes}</IonBadge>}
                </IonItem>
              );
            })
          )}
        </IonList>

        {/* 3. Entregas próximas */}
        <IonList inset className="copol-bloque-inicio">
          <IonListHeader>
            <IonLabel>Próximos 7 días</IonLabel>
          </IonListHeader>
          {proximas.length === 0 ? (
            <p className="copol-inicio-vacio">Sin entregas en la próxima semana.</p>
          ) : (
            proximas.map((t) => <TarjetaTarea key={t.id} tarea={t} onEditar={abrirEdicion} />)
          )}
        </IonList>
        <GraficoEntregas vista={vistaGrafico} onCambiarVista={setVistaGrafico} />
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

        <ModalTarea abierto={modal} onCerrar={() => setModal(false)} tarea={editando} />
      </IonContent>
    </IonPage>
  );
};

export default Hoy;
