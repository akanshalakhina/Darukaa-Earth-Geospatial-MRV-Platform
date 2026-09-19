import React from 'react';

interface BadgeProps {
  status?: string;
  variant?: 'active' | 'verified' | 'validation' | 'draft' | 'critical' | 'default';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ status, variant, children }) => {
  let badgeClass = 'badge-draft';

  const s = (status || variant || '').toLowerCase();
  if (s.includes('active') || s.includes('scan')) {
    badgeClass = 'badge-active';
  } else if (s.includes('verified') || s.includes('issuing')) {
    badgeClass = 'badge-verified';
  } else if (s.includes('validation') || s.includes('pending') || s.includes('moderate')) {
    badgeClass = 'badge-validation';
  } else if (s.includes('critical') || s.includes('high') || s.includes('alert')) {
    badgeClass = 'badge-critical';
  }

  return <span className={`badge ${badgeClass}`}>{children}</span>;
};
