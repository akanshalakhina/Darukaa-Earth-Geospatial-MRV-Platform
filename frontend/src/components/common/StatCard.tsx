import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  change?: string;
  changePositive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  change,
  changePositive = true,
}) => {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
              marginBottom: '0.35rem',
            }}
          >
            {title}
          </p>
          <h3
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
            }}
          >
            {value}
          </h3>
        </div>
        <div
          style={{
            padding: '0.65rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={22} />
        </div>
      </div>
      {(subtitle || change) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.85rem' }}>
          {change && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: changePositive ? '#34d399' : '#f87171',
                backgroundColor: changePositive
                  ? 'rgba(16, 185, 129, 0.12)'
                  : 'rgba(239, 68, 68, 0.12)',
                padding: '0.15rem 0.4rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {change}
            </span>
          )}
          {subtitle && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
};
