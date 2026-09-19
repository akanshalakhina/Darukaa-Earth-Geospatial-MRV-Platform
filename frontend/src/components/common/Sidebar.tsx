import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  MapPin,
  LineChart,
  ShieldCheck,
  Compass,
  LogOut,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onReseed?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onReseed }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'map', label: 'Map Explorer', icon: MapPin },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div
        style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #10b981, #047857)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <Compass size={22} />
        </div>
        <div>
          <h2
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#fff',
            }}
          >
            Darukaa<span style={{ color: 'var(--primary)' }}>.Earth</span>
          </h2>
          <span
            style={{
              fontSize: '0.6875rem',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
            }}
          >
            Geospatial MRV
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div
        style={{
          padding: '1.25rem 0.85rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}
      >
        <p
          style={{
            fontSize: '0.6875rem',
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
            fontWeight: 700,
            padding: '0 0.65rem 0.5rem 0.65rem',
            letterSpacing: '0.05em',
          }}
        >
          Platform Navigation
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                width: '100%',
                padding: '0.75rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon size={19} color={isActive ? 'var(--primary)' : 'currentColor'} />
              <span>{item.label}</span>
              {isActive && (
                <div
                  style={{
                    marginLeft: 'auto',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    boxShadow: '0 0 8px var(--primary)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Database Reseed Demo Helper */}
      {onReseed && (
        <div style={{ padding: '0 1rem 1rem 1rem' }}>
          <button
            onClick={onReseed}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', fontSize: '0.75rem', gap: '0.4rem', justifyContent: 'center' }}
            title="Reset & reload sample environmental dataset"
          >
            <RotateCcw size={14} />
            Reseed Sample Data
          </button>
        </div>
      )}

      {/* User Footer Profile */}
      <div
        style={{
          padding: '1.25rem',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              backgroundColor: 'rgba(2, 132, 199, 0.2)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8125rem',
              flexShrink: 0,
            }}
          >
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.full_name || 'Guest User'}
            </p>
            <p
              style={{
                fontSize: '0.6875rem',
                color: 'var(--text-dim)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.role || 'Auditor'}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.4rem', borderRadius: 'var(--radius-md)' }}
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
