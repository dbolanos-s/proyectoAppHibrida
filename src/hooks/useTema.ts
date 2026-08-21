import { useEffect } from 'react';
import type { Tema } from '../types';

/**
 * Aplica el tema. Ionic 8 conmuta el modo oscuro con la clase `ion-palette-dark`
 * en <html>, así que basta añadirla o quitarla.
 */
export function useTema(tema: Tema): void {
  useEffect(() => {
    const html = document.documentElement;

    const aplicar = (oscuro: boolean) => {
      html.classList.toggle('ion-palette-dark', oscuro);
      html.setAttribute('data-tema', oscuro ? 'oscuro' : 'claro');
    };

    if (tema === 'claro') { aplicar(false); return; }
    if (tema === 'oscuro') { aplicar(true); return; }

    // 'sistema': seguimos la preferencia del dispositivo y reaccionamos a cambios.
    const consulta = window.matchMedia('(prefers-color-scheme: dark)');
    aplicar(consulta.matches);
    const alCambiar = (e: MediaQueryListEvent) => aplicar(e.matches);
    if (typeof consulta.addEventListener === 'function') {
      consulta.addEventListener('change', alCambiar);
      return () => consulta.removeEventListener('change', alCambiar);
    }

    // Compatibilidad con navegadores antiguos y con el entorno de pruebas.
    consulta.addListener(alCambiar);
    return () => consulta.removeListener(alCambiar);
  }, [tema]);
}
