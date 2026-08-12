const MS_HORA = 3600_000;
const MS_DIA = 86_400_000;

/** Fecha de hoy en formato "YYYY-MM-DD", en hora local del dispositivo. */
export function hoyISO(): string {
  return aISO(new Date());
}

export function aISO(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/**
 * Convierte "YYYY-MM-DD" a un Date en medianoche local.
 * No uses new Date("2026-08-14"): eso se interpreta como UTC y en Ecuador
 * devuelve el día anterior a las 19:00.
 */
export function desdeISO(fecha: string): Date {
  const [a, m, d] = fecha.split('-').map(Number);
  return new Date(a, m - 1, d, 0, 0, 0, 0);
}

/** Diferencia en días calendario. 0 = hoy, 1 = mañana, -1 = ayer. */
export function diasCalendario(fechaEntrega: string): number {
  const hoy = desdeISO(hoyISO()).getTime();
  const entrega = desdeISO(fechaEntrega).getTime();
  return Math.round((entrega - hoy) / MS_DIA);
}

/** Milisegundos hasta el final del día de entrega (medianoche siguiente). */
export function msRestantes(fechaEntrega: string): number {
  const limite = desdeISO(fechaEntrega).getTime() + MS_DIA;
  return limite - Date.now();
}

/**
 * Texto del contador. Cambia de días a horas cuando falta menos de un día.
 * Ejemplos: "en 12 días", "faltan 3 días", "faltan 8 horas", "atrasada 2 días".
 */
export function textoContador(fechaEntrega: string): string {
  const dias = diasCalendario(fechaEntrega);
  const ms = msRestantes(fechaEntrega);

  if (ms <= 0) {
    const atraso = Math.abs(dias);
    return atraso === 1 ? 'atrasada 1 día' : `atrasada ${atraso} días`;
  }
  if (ms < MS_DIA) {
    const horas = Math.ceil(ms / MS_HORA);
    return horas <= 1 ? 'falta menos de 1 hora' : `faltan ${horas} horas`;
  }
  if (dias <= 7) {
    return dias === 1 ? 'falta 1 día' : `faltan ${dias} días`;
  }
  return `en ${dias} días`;
}

export function nombreDiaLargo(fecha: string): string {
  const nombres = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  return nombres[desdeISO(fecha).getDay()];
}

/** Día de la semana de hoy en el formato del horario (1-5). 0 si es fin de semana. */
export function diaSemanaHoy(): number {
  const d = new Date().getDay();
  return d >= 1 && d <= 5 ? d : 0;
}

/** Minutos transcurridos desde medianoche para una hora "07:30". */
export function aMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

export function minutosAhora(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

export function fechaLegible(fecha: string): string {
  const d = desdeISO(fecha);
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d.getDate()} ${meses[d.getMonth()]}`;
}

/** Suma días a una fecha ISO y devuelve otra fecha ISO. */
export function sumarDias(fecha: string, dias: number): string {
  const d = desdeISO(fecha);
  d.setDate(d.getDate() + dias);
  return aISO(d);
}
