import React, { useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend,
} from 'chart.js';
import { IonSegment, IonSegmentButton, IonLabel, IonNote } from '@ionic/react';
import { useDatos } from '../hooks/useDatos';
import { hexDeMateria } from '../utils/colores';
import { sumarDias, hoyISO, fechaLegible } from '../utils/fechas';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

/** Lee un color del tema activo para que el gráfico funcione en claro y oscuro. */
function colorTexto(): string {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue('--ion-text-color').trim();
  return v || '#000';
}

function colorLinea(): string {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue('--ion-color-step-200').trim();
  return v || 'rgba(128,128,128,.25)';
}

interface Props {
  vista: 'semana' | 'materia';
  onCambiarVista: (v: 'semana' | 'materia') => void;
}

const GraficoEntregas: React.FC<Props> = ({ vista, onCambiarVista }) => {
  const { datos } = useDatos();
  const texto = colorTexto();
  const linea = colorLinea();

  /** Entregas de los próximos 14 días agrupadas por día. */
  const porDia = useMemo(() => {
    const hoy = hoyISO();
    const etiquetas: string[] = [];
    const valores: number[] = [];
    for (let i = 0; i < 14; i++) {
      const f = sumarDias(hoy, i);
      etiquetas.push(fechaLegible(f));
      valores.push(
        datos.tareas.filter((t) => t.estado !== 'entregada' && t.fechaEntrega === f).length
      );
    }
    return { etiquetas, valores };
  }, [datos.tareas]);

  /** Pendientes por materia, para ver dónde se acumula la carga. */
  const porMateria = useMemo(() => {
    const conCarga = datos.materias
      .map((m) => ({
        nombre: m.nombre,
        color: hexDeMateria(m.color),
        total: datos.tareas.filter((t) => t.materiaId === m.id && t.estado !== 'entregada').length,
      }))
      .filter((x) => x.total > 0);
    return conCarga;
  }, [datos.materias, datos.tareas]);

  const hayDatos = datos.tareas.some((t) => t.estado !== 'entregada');

  return (
    <div className="copol-gráfico">
      <h2 className="copol-titulo-seccion">Cómo viene tu carga</h2>
      <IonSegment
        value={vista}
        onIonChange={(e) => onCambiarVista(e.detail.value as 'semana' | 'materia')}
      >
        <IonSegmentButton value="semana"><IonLabel>Próximos 14 días</IonLabel></IonSegmentButton>
        <IonSegmentButton value="materia"><IonLabel>Por materia</IonLabel></IonSegmentButton>
      </IonSegment>

      {!hayDatos ? (
        <IonNote className="copol-nota">
          Cuando registres tareas pendientes verás aquí cómo se distribuye tu carga.
        </IonNote>
      ) : vista === 'semana' ? (
        <div className="copol-lienzo">
          <Bar
            data={{
              labels: porDia.etiquetas,
              datasets: [{
                label: 'Entregas',
                data: porDia.valores,
                backgroundColor: porDia.valores.map((v) =>
                  v >= 3 ? '#b3261e' : v === 2 ? '#e8590c' : '#2e7d5b'
                ),
                borderRadius: 4,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: texto, maxRotation: 60, minRotation: 60, font: { size: 9 } }, grid: { display: false } },
                y: { beginAtZero: true, ticks: { color: texto, stepSize: 1, precision: 0 }, grid: { color: linea } },
              },
            }}
          />
        </div>
      ) : (
        <div className="copol-lienzo">
          <Doughnut
            data={{
              labels: porMateria.map((m) => m.nombre),
              datasets: [{
                data: porMateria.map((m) => m.total),
                backgroundColor: porMateria.map((m) => m.color),
                borderWidth: 0,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'bottom', labels: { color: texto, boxWidth: 12, font: { size: 11 } } },
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default GraficoEntregas;
