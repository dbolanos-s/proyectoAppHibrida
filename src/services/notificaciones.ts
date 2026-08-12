import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { Tarea } from '../types';
import { textoContador, diasCalendario } from '../utils/fechas';

/** Un solo aviso diario. Id fijo para poder reemplazarlo o cancelarlo. */
const ID_AVISO = 1001;
const HORA_AVISO = 7;
const MINUTO_AVISO = 0;

function enDispositivo(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Pide el permiso POST_NOTIFICATIONS. Se llama la primera vez que el estudiante
 * marca una tarea como importante, no al abrir la app: así entiende para qué es.
 */
export async function pedirPermiso(): Promise<boolean> {
  if (!enDispositivo()) return false;
  try {
    const actual = await LocalNotifications.checkPermissions();
    if (actual.display === 'granted') return true;
    const pedido = await LocalNotifications.requestPermissions();
    return pedido.display === 'granted';
  } catch {
    return false;
  }
}

/**
 * Reprograma el aviso diario con la tarea importante más próxima.
 * Si no queda ninguna pendiente, cancela el aviso.
 */
export async function actualizarAviso(tareas: Tarea[]): Promise<void> {
  if (!enDispositivo()) return;

  const destacadas = tareas
    .filter((t) => t.importante && t.estado !== 'entregada')
    .sort((a, b) => a.fechaEntrega.localeCompare(b.fechaEntrega));

  try {
    await LocalNotifications.cancel({ notifications: [{ id: ID_AVISO }] });
    if (destacadas.length === 0) return;

    const permitido = await pedirPermiso();
    if (!permitido) return;

    const primera = destacadas[0];
    const resto = destacadas.length - 1;
    const cuerpo =
      `${primera.titulo} — ${textoContador(primera.fechaEntrega)}` +
      (resto > 0 ? ` y ${resto} ${resto === 1 ? 'tarea más' : 'tareas más'}` : '');

    await LocalNotifications.schedule({
      notifications: [
        {
          id: ID_AVISO,
          title: 'Tus entregas destacadas',
          body: cuerpo,
          schedule: {
            on: { hour: HORA_AVISO, minute: MINUTO_AVISO },
            allowWhileIdle: true,
          },
          ongoing: diasCalendario(primera.fechaEntrega) <= 1,
        },
      ],
    });
  } catch {
    // Sin permisos o plugin no disponible: la app sigue funcionando igual.
  }
}

export async function cancelarAviso(): Promise<void> {
  if (!enDispositivo()) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: ID_AVISO }] });
  } catch {
    /* nada que hacer */
  }
}
