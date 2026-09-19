import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string; size?: number }> = ({
  message = 'Loading geospatial data...',
  size = 36,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        color: 'var(--text-muted)',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          border: '3px solid rgba(16, 185, 129, 0.2)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message}</p>
    </div>
  );
};
