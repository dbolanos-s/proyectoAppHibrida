import React, { useEffect, useState } from 'react';
import { IonCard, IonCardContent, IonIcon, IonSpinner, IonNote } from '@ionic/react';
import { sunny, partlySunny, cloudy, rainy, thunderstorm, snow } from 'ionicons/icons';
import { obtenerClima, type Clima } from '../services/clima';
import { useDatos } from '../hooks/useDatos';

function iconoDe(codigo: number): string {
  if (codigo >= 95) return thunderstorm;
  if (codigo >= 71 && codigo <= 77) return snow;
  if (codigo >= 51) return rainy;
  if (codigo === 3) return cloudy;
  if (codigo >= 1) return partlySunny;
  return sunny;
}

const TarjetaClima: React.FC = () => {
  const { datos } = useDatos();
  const { climaActivo, latitud, longitud, ciudad } = datos.preferencias;

  const [clima, setClima] = useState<Clima | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!climaActivo || latitud === undefined || longitud === undefined) {
      setClima(null);
      return;
    }
    let cancelado = false;
    setCargando(true);
    setError(null);

    obtenerClima(latitud, longitud, ciudad ?? 'Tu ciudad')
      .then((c) => { if (!cancelado) setClima(c); })
      .catch(() => { if (!cancelado) setError('No se pudo consultar el clima. Revisa tu conexión.'); })
      .finally(() => { if (!cancelado) setCargando(false); });

    return () => { cancelado = true; };
  }, [climaActivo, latitud, longitud, ciudad]);

  if (!climaActivo) return null;

  if (cargando) {
    return (
      <IonCard className="copol-clima">
        <IonCardContent className="copol-clima-cargando">
          <IonSpinner name="dots" /> <span>Consultando el clima</span>
        </IonCardContent>
      </IonCard>
    );
  }

  if (error) {
    return (
      <IonCard className="copol-clima">
        <IonCardContent><IonNote color="danger">{error}</IonNote></IonCardContent>
      </IonCard>
    );
  }

  if (!clima) return null;

  return (
    <IonCard className="copol-clima">
      <IonCardContent>
        <div className="copol-clima-fila">
          <IonIcon icon={iconoDe(clima.codigo)} aria-hidden="true" />
          <div className="copol-clima-datos">
            <strong>{clima.temperatura}°</strong>
            <span>{clima.descripcion} · {clima.ciudad}</span>
          </div>
          <div className="copol-clima-rango">
            <span>max {clima.temperaturaMax}°</span>
            <span>min {clima.temperaturaMin}°</span>
          </div>
        </div>
        <p className="copol-clima-consejo">{clima.consejo}</p>
      </IonCardContent>
    </IonCard>
  );
};

export default TarjetaClima;