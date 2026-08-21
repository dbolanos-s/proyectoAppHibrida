import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonList, IonListHeader, IonItem, IonLabel, IonSelect,
  IonSelectOption, IonToggle, IonInput, IonButton, IonNote, IonIcon,
  IonSpinner, IonToast,
} from '@ionic/react';
import { search, cloudUpload, cloudDownload } from 'ionicons/icons';
import { useDatos } from '../hooks/useDatos';
import type { Tema } from '../types';
import { buscarCiudad, type Ciudad } from '../services/clima';
import { firebaseConfigurado, subir, descargar, entrar } from '../services/firebase';

const Ajustes: React.FC = () => {
  const { datos, guardarPreferencias, reemplazarTodo, reiniciar } = useDatos();
  const p = datos.preferencias;

  const [busqueda, setBusqueda] = useState(p.ciudad ?? '');
  const [resultados, setResultados] = useState<Ciudad[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const buscar = async () => {
    if (busqueda.trim().length < 3) {
      setAviso('Escribe al menos tres letras del nombre de la ciudad.');
      return;
    }
    setBuscando(true);
    try {
      const r = await buscarCiudad(busqueda.trim());
      setResultados(r);
      if (r.length === 0) setAviso('No se encontró esa ciudad. Revisa la escritura.');
    } catch {
      setAviso('No se pudo conectar con el servicio de búsqueda.');
    } finally {
      setBuscando(false);
    }
  };

  const elegirCiudad = (c: Ciudad) => {
    guardarPreferencias({
      ciudad: c.nombre, latitud: c.latitud, longitud: c.longitud, climaActivo: true,
    });
    setResultados([]);
    setAviso(`Clima activado para ${c.nombre}.`);
  };

  const respaldar = async () => {
    setSincronizando(true);
    try {
      await entrar();
      await subir(datos);
      setAviso('Respaldo subido correctamente.');
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'No se pudo subir el respaldo.');
    } finally {
      setSincronizando(false);
    }
  };

  const restaurar = async () => {
    setSincronizando(true);
    try {
      await entrar();
      const remoto = await descargar();
      if (!remoto) { setAviso('No hay ningún respaldo guardado todavía.'); return; }
      reemplazarTodo(remoto);
      setAviso('Datos restaurados desde el respaldo.');
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'No se pudo restaurar.');
    } finally {
      setSincronizando(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/materias" text="Atrás" /></IonButtons>
          <IonTitle>Ajustes</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="copol-pagina-ajustes">
        <IonList inset className="copol-ajustes-grupo">
          <IonListHeader><IonLabel>Apariencia</IonLabel></IonListHeader>
          <IonItem>
            <IonSelect
              label="Tema" labelPlacement="stacked" value={p.tema}
              onIonChange={(e) => guardarPreferencias({ tema: e.detail.value as Tema })}
            >
              <IonSelectOption value="sistema">Seguir al dispositivo</IonSelectOption>
              <IonSelectOption value="claro">Claro</IonSelectOption>
              <IonSelectOption value="oscuro">Oscuro</IonSelectOption>
            </IonSelect>
          </IonItem>
        </IonList>

        <IonList inset className="copol-ajustes-grupo">
          <IonListHeader><IonLabel>Clima</IonLabel></IonListHeader>
          <IonItem>
            <IonToggle
              checked={p.climaActivo}
              disabled={p.latitud === undefined}
              onIonChange={(e) => guardarPreferencias({ climaActivo: e.detail.checked })}
            >
              Mostrar el clima en la pantalla Hoy
            </IonToggle>
          </IonItem>
          <IonItem>
            <IonInput
              label="Ciudad" labelPlacement="stacked" placeholder="Guayaquil"
              value={busqueda} onIonInput={(e) => setBusqueda(e.detail.value ?? '')}
            />
            <IonButton slot="end" fill="clear" onClick={buscar} aria-label="Buscar ciudad">
              {buscando ? <IonSpinner name="dots" /> : <IonIcon slot="icon-only" icon={search} />}
            </IonButton>
          </IonItem>
          {resultados.map((c) => (
            <IonItem key={`${c.latitud},${c.longitud}`} button onClick={() => elegirCiudad(c)}>
              <IonLabel>
                <h3>{c.nombre}</h3>
                <p>{c.region}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
        <IonNote className="copol-nota">
          El clima usa Open-Meteo y solo envía las coordenadas de la ciudad.
        </IonNote>

        <IonList inset className="copol-ajustes-grupo">
          <IonListHeader><IonLabel>Respaldo en la nube</IonLabel></IonListHeader>
          {!firebaseConfigurado() ? (
            <IonItem lines="none">
              <IonNote>
                Falta pegar tu configuración de Firebase en src/services/firebase.ts.
                Mientras tanto, tus datos se guardan solo en este dispositivo.
              </IonNote>
            </IonItem>
          ) : (
            <>
              <IonItem button detail={false} disabled={sincronizando} onClick={respaldar}>
                <IonIcon slot="start" icon={cloudUpload} aria-hidden="true" />
                <IonLabel>Subir respaldo</IonLabel>
                {sincronizando && <IonSpinner slot="end" name="dots" />}
              </IonItem>
              <IonItem button detail={false} disabled={sincronizando} onClick={restaurar}>
                <IonIcon slot="start" icon={cloudDownload} aria-hidden="true" />
                <IonLabel>Restaurar desde la nube</IonLabel>
              </IonItem>
            </>
          )}
        </IonList>
        <IonNote className="copol-nota">
          Restaurar reemplaza los datos de este dispositivo y no se puede deshacer.
        </IonNote>

        <div className="copol-zona-peligro">
          <IonButton expand="block" fill="clear" color="danger" size="small" onClick={reiniciar}>
            Borrar datos del dispositivo
          </IonButton>
        </div>

        <IonToast
          isOpen={aviso !== null} message={aviso ?? ''} duration={2600}
          onDidDismiss={() => setAviso(null)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Ajustes;
