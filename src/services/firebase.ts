import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, type Auth } from 'firebase/auth';
import { getDatabase, ref, set, get, type Database } from 'firebase/database';
import type { DatosApp } from '../types';



const configuracion = {
  apiKey: "AIzaSyAKvvhh65KxVgrtMsfpb3jcLoEVWT7gzlc",
  authDomain: "copol-7375a.firebaseapp.com",
  projectId: "copol-7375a",
  storageBucket: "copol-7375a.firebasestorage.app",
  messagingSenderId: "210723284382",
  appId: "1:210723284382:web:1dc3a694b207d01a4b628f",
  measurementId: "G-4HFP4RSQZK"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Database | null = null;

/** True solo si ya pegaste tu configuración real. */
export function firebaseConfigurado(): boolean {
  return !configuracion.apiKey.startsWith('PEGA_AQUI');
}

function iniciar() {
  if (app) return;
  app = initializeApp(configuracion);
  auth = getAuth(app);
  db = getDatabase(app);
}

/**
 * Sesión anónima: el estudiante usa la app sin registrarse y Firebase le asigna
 * un identificador. Después puede vincularlo a un correo si quiere.
 */
export async function entrar(): Promise<string> {
  if (!firebaseConfigurado()) throw new Error('Falta configurar Firebase en services/firebase.ts');
  iniciar();
  const credencial = await signInAnonymously(auth!);
  return credencial.user.uid;
}

export function uidActual(): string | null {
  return auth?.currentUser?.uid ?? null;
}

export function alCambiarSesion(cb: (uid: string | null) => void): () => void {
  if (!firebaseConfigurado()) return () => undefined;
  iniciar();
  return onAuthStateChanged(auth!, (u) => cb(u?.uid ?? null));
}

/** Sube todo el estado del estudiante bajo su propio nodo. */
export async function subir(datos: DatosApp): Promise<void> {
  const uid = uidActual() ?? (await entrar());
  await set(ref(db!, `usuarios/${uid}`), {
    ...datos,
    actualizado: new Date().toISOString(),
  });
}

/** Descarga el estado guardado. Devuelve null si el nodo aún no existe. */
export async function descargar(): Promise<DatosApp | null> {
  const uid = uidActual() ?? (await entrar());
  const snapshot = await get(ref(db!, `usuarios/${uid}`));
  if (!snapshot.exists()) return null;
  const v = snapshot.val();
  return {
    materias: v.materias ?? [],
    bloques: v.bloques ?? [],
    tareas: v.tareas ?? [],
    eventos: v.eventos ?? [],
    periodos: v.periodos ?? [],
    preferencias: v.preferencias ?? { tema: 'sistema', climaActivo: false },
  };
}