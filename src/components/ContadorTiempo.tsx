import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import {
  alertCircle,
  flame,
  time,
  calendar,
  leaf,
  checkmarkCircle,
} from 'ionicons/icons';
import type { Tarea } from '../types';
import { estiloUrgencia } from '../utils/colores';
import { textoContador } from '../utils/fechas';

const ICONOS: Record<string, string> = {
  'alert-circle': alertCircle,
  flame: flame,
  time: time,
  calendar: calendar,
  leaf: leaf,
  'checkmark-circle': checkmarkCircle,
};

interface Props {
  tarea: Tarea;
  compacto?: boolean;
}

/**
 * El color nunca va solo: siempre acompañado del icono y del texto del contador.
 * Cerca del 8% de los hombres no distingue rojo de verde.
 */
const ContadorTiempo: React.FC<Props> = ({ tarea, compacto }) => {
  const [, forzar] = useState(0);

  // Refresca cada minuto para que "faltan 8 horas" no se quede congelado.
  useEffect(() => {
    const id = setInterval(() => forzar((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const estilo = estiloUrgencia(tarea);
  const texto =
    tarea.estado === 'entregada' ? 'Entregada' : textoContador(tarea.fechaEntrega);

  return (
    <span
      className={`copol-contador ${compacto ? 'compacto' : ''}`}
      style={{ color: `var(${estilo.variable})` }}
    >
      <IonIcon icon={ICONOS[estilo.icono]} aria-hidden="true" />
      <span>{texto}</span>
    </span>
  );
};

export default ContadorTiempo;
