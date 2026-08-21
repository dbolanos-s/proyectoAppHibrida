/**
 * Consumo de Open-Meteo. Sin llave de API y sin registro, así que no hay
 * secretos que ocultar en el código.
 */

export interface Clima {
  ciudad: string;
  temperatura: number;
  temperaturaMin: number;
  temperaturaMax: number;
  codigo: number;
  descripcion: string;
  probabilidadLluvia: number;
  consejo: string;
}

export interface Ciudad {
  nombre: string;
  latitud: number;
  longitud: number;
  region: string;
}

interface ResultadoGeocodificacion {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
}

interface RespuestaGeocodificacion {
  results?: ResultadoGeocodificacion[];
}

const CODIGOS: Record<number, string> = {
  0: 'Despejado', 1: 'Mayormente despejado', 2: 'Parcialmente nublado', 3: 'Nublado',
  45: 'Neblina', 48: 'Neblina con escarcha', 51: 'Llovizna ligera', 53: 'Llovizna',
  55: 'Llovizna intensa', 61: 'Lluvia ligera', 63: 'Lluvia', 65: 'Lluvia fuerte',
  66: 'Lluvia helada', 67: 'Lluvia helada fuerte', 71: 'Nieve ligera', 73: 'Nieve',
  75: 'Nieve fuerte', 80: 'Chubascos', 81: 'Chubascos fuertes', 82: 'Chubascos violentos',
  95: 'Tormenta', 96: 'Tormenta con granizo', 99: 'Tormenta fuerte con granizo',
};

function consejoDe(codigo: number, lluvia: number, min: number): string {
  if (codigo >= 95) return 'Tormenta prevista. Protege cuadernos y maquetas.';
  if (codigo >= 61 || lluvia >= 60) return 'Lleva paraguas y guarda los trabajos en funda plástica.';
  if (lluvia >= 30) return 'Puede llover. Un paraguas no sobra.';
  if (min <= 12) return 'Amanece frío. Lleva chompa.';
  return 'Sin novedad para el traslado.';
}

/** Busca coordenadas por nombre de ciudad. */
export async function buscarCiudad(nombre: string): Promise<Ciudad[]> {
  const url =
    'https://geocoding-api.open-meteo.com/v1/search' +
    `?name=${encodeURIComponent(nombre)}&count=5&language=es&format=json`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`No se pudo buscar la ciudad (HTTP ${r.status})`);
  const json = await r.json() as RespuestaGeocodificacion;
  if (!json.results) return [];
  return json.results.map((c) => ({
    nombre: c.name,
    latitud: c.latitude,
    longitud: c.longitude,
    region: [c.admin1, c.country].filter(Boolean).join(', '),
  }));
}

/** Pronóstico del día para unas coordenadas. */
export async function obtenerClima(lat: number, lon: number, ciudad: string): Promise<Clima> {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,weather_code' +
    '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
    '&timezone=auto&forecast_days=1';

  const r = await fetch(url);
  if (!r.ok) throw new Error(`El servicio de clima respondió ${r.status}`);
  const j = await r.json();

  const codigo = j.current?.weather_code ?? 0;
  const lluvia = j.daily?.precipitation_probability_max?.[0] ?? 0;
  const min = j.daily?.temperature_2m_min?.[0] ?? 0;

  return {
    ciudad,
    temperatura: Math.round(j.current?.temperature_2m ?? 0),
    temperaturaMin: Math.round(min),
    temperaturaMax: Math.round(j.daily?.temperature_2m_max?.[0] ?? 0),
    codigo,
    descripcion: CODIGOS[codigo] ?? 'Sin datos',
    probabilidadLluvia: lluvia,
    consejo: consejoDe(codigo, lluvia, min),
  };
}
