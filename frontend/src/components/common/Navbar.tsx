import React from 'react';
import { Activity, Satellite, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  title: string;
  subtitle?: string;
  onNewProject?: () => void;
  onDrawSite?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ title, subtitle, onNewProject, onDrawSite }) => {
  const { user } = useAuth();

  return (
    <header className="navbar">
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{subtitle}</p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Real-time sync badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            color: '#34d399',
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }}
          />
          <Satellite size={14} />
          <span>PostGIS Active</span>
        </div>

        {onNewProject && (
          <button onClick={onNewProject} className="btn btn-primary btn-sm">
            <Plus size={16} />
            New Project
          </button>
        )}

        {onDrawSite && (
          <button onClick={onDrawSite} className="btn btn-primary btn-sm">
            <Plus size={16} />
            Draw New Site
          </button>
        )}
      </div>
    </header>
  );
};
