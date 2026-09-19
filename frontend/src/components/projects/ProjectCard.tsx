import React from 'react';
import { Project } from '../../types';
import { Badge } from '../common/Badge';
import { MapPin, Trees, Layers, ArrowUpRight, Shield } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onViewDetails: (project: Project) => void;
  onViewOnMap: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onViewDetails,
  onViewOnMap,
}) => {
  return (
    <div
      className="glass-card"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <Badge status={project.status}>{project.status}</Badge>
          <span
            className="badge"
            style={{
              backgroundColor: 'rgba(2, 132, 199, 0.12)',
              color: '#38bdf8',
              border: '1px solid rgba(2, 132, 199, 0.25)',
            }}
          >
            {project.standard}
          </span>
        </div>
        <button
          onClick={() => onViewOnMap(project)}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', gap: '0.25rem' }}
          title="Inspect sites on Mapbox"
        >
          <MapPin size={13} color="var(--primary)" />
          GIS
        </button>
      </div>

      {/* Project Title & Country */}
      <h3
        onClick={() => onViewDetails(project)}
        style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          marginBottom: '0.4rem',
          cursor: 'pointer',
          lineHeight: 1.35,
        }}
      >
        {project.name}
      </h3>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem',
          marginBottom: '0.75rem',
        }}
      >
        <MapPin size={14} color="var(--text-dim)" />
        <span>
          {project.country} {project.region ? `• ${project.region}` : ''}
        </span>
      </div>

      <p
        style={{
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          lineHeight: 1.45,
          marginBottom: '1.25rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1,
        }}
      >
        {project.description ||
          'Verified environmental carbon and biodiversity conservation initiative.'}
      </p>

      {/* Environmental Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.65rem',
          padding: '0.85rem',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1rem',
          fontSize: '0.75rem',
        }}
      >
        <div>
          <span style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '0.15rem' }}>
            Area Conserved
          </span>
          <strong style={{ color: '#fff', fontSize: '0.9rem' }}>
            {project.total_hectares.toLocaleString()} ha
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '0.15rem' }}>
            Est. Annual tCO2e
          </span>
          <strong style={{ color: '#34d399', fontSize: '0.9rem' }}>
            {project.estimated_annual_tco2e.toLocaleString()}
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '0.15rem' }}>
            Target Bio-Score
          </span>
          <strong style={{ color: '#38bdf8', fontSize: '0.9rem' }}>
            {project.target_biodiversity_score} / 100
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '0.15rem' }}>
            Mapped Sites
          </span>
          <strong style={{ color: '#fff', fontSize: '0.9rem' }}>
            {project.total_sites} parcels
          </strong>
        </div>
      </div>

      {/* Footer Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto',
          paddingTop: '0.5rem',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <Trees size={13} />
          {project.biome}
        </span>
        <button
          onClick={() => onViewDetails(project)}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.35rem' }}
        >
          View Project
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
};
