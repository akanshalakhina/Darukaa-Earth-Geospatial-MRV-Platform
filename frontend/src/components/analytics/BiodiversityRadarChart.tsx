import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { BiodiversityRadar } from '../../types';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface BiodiversityRadarChartProps {
  radarData: BiodiversityRadar;
  title?: string;
}

export const BiodiversityRadarChart: React.FC<BiodiversityRadarChartProps> = ({
  radarData,
  title = 'Taxonomic Biodiversity Index (0-100)',
}) => {
  const data = {
    labels: radarData.taxa,
    datasets: [
      {
        label: 'Current Conservation Health',
        data: radarData.current_index,
        backgroundColor: 'rgba(16, 185, 129, 0.25)',
        borderColor: '#10b981',
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#10b981',
        borderWidth: 2,
      },
      {
        label: 'Pre-Restoration Baseline',
        data: radarData.baseline_index,
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        borderColor: '#94a3b8',
        borderDash: [4, 4],
        pointBackgroundColor: '#94a3b8',
        borderWidth: 1.5,
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
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        pointLabels: {
          color: '#cbd5e1',
          font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' },
        },
        ticks: {
          color: '#64748b',
          backdropColor: 'transparent',
          font: { size: 9 },
          stepSize: 20,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };

  return (
    <div
      className="glass-card"
      style={{ height: '360px', display: 'flex', flexDirection: 'column' }}
    >
      <h3
        style={{
          fontSize: '1rem',
          fontWeight: 700,
          marginBottom: '1rem',
          color: 'var(--text-main)',
        }}
      >
        {title}
      </h3>
      <div style={{ flex: 1, position: 'relative' }}>
        <Radar data={data} options={options} />
      </div>
    </div>
  );
};
