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
import { CarbonTrendItem } from '../../types';

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

interface CarbonTrajectoryChartProps {
  trends: CarbonTrendItem[];
  title?: string;
}

export const CarbonTrajectoryChart: React.FC<CarbonTrajectoryChartProps> = ({
  trends,
  title = 'Carbon Sequestration Trajectory (tCO2e)',
}) => {
  const labels = trends.map((t) => t.month_label);

  const data = {
    labels,
    datasets: [
      {
        label: 'Actual Measured MRV (tCO2e)',
        data: trends.map((t) => t.actual_tco2e),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        borderWidth: 2.5,
      },
      {
        label: 'VCS Crediting Baseline',
        data: trends.map((t) => t.baseline_tco2e),
        borderColor: '#94a3b8',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 1.8,
      },
      {
        label: 'Projected Target Target',
        data: trends.map((t) => t.target_tco2e),
        borderColor: '#38bdf8',
        backgroundColor: 'transparent',
        borderDash: [3, 3],
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 1.8,
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
          font: { family: 'Plus Jakarta Sans', size: 12, weight: '500' },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#12191d',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: (context: any) =>
            `${context.dataset.label}: ${context.parsed.y.toLocaleString()} tCO2e`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#64748b',
          font: { family: 'Plus Jakarta Sans', size: 11 },
          callback: (value: any) => `${(value / 1000).toFixed(0)}k`,
        },
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
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
