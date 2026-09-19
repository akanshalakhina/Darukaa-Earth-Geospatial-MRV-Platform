import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { BiomeBreakdown } from '../../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface BiomeDoughnutChartProps {
  biomes: BiomeBreakdown[];
  title?: string;
}

export const BiomeDoughnutChart: React.FC<BiomeDoughnutChartProps> = ({
  biomes,
  title = 'Biome Distribution (Hectares)',
}) => {
  const colors = ['#10b981', '#0284c7', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

  const data = {
    labels: biomes.map((b) => b.biome),
    datasets: [
      {
        data: biomes.map((b) => b.hectares || 100),
        backgroundColor: colors.slice(0, biomes.length),
        borderColor: '#12191d',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#94a3b8',
          font: { family: 'Plus Jakarta Sans', size: 11 },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: '#12191d',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => `${context.label}: ${context.parsed.toLocaleString()} ha`,
        },
      },
    },
    cutout: '68%',
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
          marginBottom: '0.5rem',
          color: 'var(--text-main)',
        }}
      >
        {title}
      </h3>
      <div style={{ flex: 1, position: 'relative' }}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};
