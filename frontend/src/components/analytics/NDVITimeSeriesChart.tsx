import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { AnalyticsSnapshot } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface NDVITimeSeriesChartProps {
  snapshots: AnalyticsSnapshot[];
  title?: string;
}

export const NDVITimeSeriesChart: React.FC<NDVITimeSeriesChartProps> = ({
  snapshots,
  title = 'Sentinel-2 Multispectral Vegetation Index (NDVI / EVI)',
}) => {
  const labels = snapshots.map((s) => {
    const d = new Date(s.timestamp);
    return d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'NDVI (Canopy Vigor)',
        data: snapshots.map((s) => s.ndvi),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#10b981',
      },
      {
        label: 'EVI (Enhanced Vegetation)',
        data: snapshots.map((s) => s.evi),
        borderColor: '#0284c7',
        backgroundColor: 'transparent',
        borderDash: [3, 3],
        tension: 0.35,
        borderWidth: 1.8,
        pointRadius: 2,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#94a3b8',
          font: { family: 'Plus Jakarta Sans', size: 11 },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: '#12191d',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
      y: {
        min: 0.3,
        max: 1.0,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
    },
  };

  return (
    <div style={{ height: '220px', width: '100%', position: 'relative' }}>
      <Line data={data} options={options} />
    </div>
  );
};
