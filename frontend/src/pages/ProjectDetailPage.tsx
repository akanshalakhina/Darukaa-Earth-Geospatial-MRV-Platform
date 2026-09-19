import React, { useState } from 'react';
import { Project, Site, ProjectCreateInput, SiteCreateInput } from '../types';
import { Badge } from '../components/common/Badge';
import { ProjectModal } from '../components/projects/ProjectModal';
import { CreateSiteModal } from '../components/sites/CreateSiteModal';
import {
  ArrowLeft,
  MapPin,
  Trees,
  Layers,
  TrendingUp,
  Shield,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  Compass,
} from 'lucide-react';

interface ProjectDetailPageProps {
  project: Project;
  sites: Site[];
  onBack: () => void;
  onViewOnMap: (siteId?: number) => void;
  onUpdateProject: (projectId: number, data: ProjectCreateInput) => Promise<void>;
  onDeleteProject: (projectId: number) => Promise<void>;
  onCreateSite: (data: SiteCreateInput) => Promise<void>;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  project,
  sites,
  onBack,
  onViewOnMap,
  onUpdateProject,
  onDeleteProject,
  onCreateSite,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateSiteModalOpen, setIsCreateSiteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete project "${project.name}" and all attached sites?`
      )
    ) {
      setDeleting(true);
      try {
        await onDeleteProject(project.id);
        onBack();
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Navigation & Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <button onClick={onBack} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
          <ArrowLeft size={16} />
          Back to Projects
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => onViewOnMap()}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <Compass size={16} />
            View on GIS Map
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <Edit size={16} />
            Edit Project
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-danger btn-sm"
            style={{ gap: '0.4rem' }}
            disabled={deleting}
          >
            <Trash2 size={16} />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
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
          <span
            className="badge"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.25)',
            }}
          >
            {project.project_type}
          </span>
        </div>

        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            marginBottom: '0.5rem',
          }}
        >
          {project.name}
        </h1>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={16} color="var(--primary)" />
            {project.country} {project.region ? `• ${project.region}` : ''}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Trees size={16} color="#38bdf8" />
            {project.biome}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Shield size={16} color="#f59e0b" />
            Developer: {project.developer_name}
          </span>
        </div>

        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            maxWidth: 850,
          }}
        >
          {project.description ||
            'Verified environmental carbon and biodiversity conservation initiative.'}
        </p>

        {/* Highlight Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-dim)',
                display: 'block',
                marginBottom: '0.2rem',
              }}
            >
              Conserved Parcel Area
            </span>
            <strong style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 800 }}>
              {project.total_hectares.toLocaleString()} ha
            </strong>
          </div>
          <div>
            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-dim)',
                display: 'block',
                marginBottom: '0.2rem',
              }}
            >
              Estimated Annual Sequestration
            </span>
            <strong style={{ fontSize: '1.5rem', color: '#34d399', fontWeight: 800 }}>
              {project.estimated_annual_tco2e.toLocaleString()}{' '}
              <span style={{ fontSize: '0.85rem' }}>tCO2e/yr</span>
            </strong>
          </div>
          <div>
            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-dim)',
                display: 'block',
                marginBottom: '0.2rem',
              }}
            >
              Target Biodiversity Index
            </span>
            <strong style={{ fontSize: '1.5rem', color: '#38bdf8', fontWeight: 800 }}>
              {project.target_biodiversity_score} / 100
            </strong>
          </div>
          <div>
            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-dim)',
                display: 'block',
                marginBottom: '0.2rem',
              }}
            >
              Project Budget
            </span>
            <strong style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 800 }}>
              ${project.budget ? project.budget.toLocaleString() : '1,200,000'}
            </strong>
          </div>
        </div>
      </div>

      {/* Geographical Sites Section */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Geographical Sites & Spatial Parcels ({sites.length})
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Individual monitored polygon plots with PostGIS geometry, biomass density, and
              Sentinel-2 NDVI telemetry.
            </p>
          </div>

          <button
            onClick={() => setIsCreateSiteModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <Plus size={16} />
            Add Site Parcel
          </button>
        </div>

        {sites.length > 0 ? (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Site Name</th>
                  <th>Code</th>
                  <th>Habitat Type</th>
                  <th>Area</th>
                  <th>Carbon Density</th>
                  <th>Canopy Cover</th>
                  <th>Threat Level</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong style={{ color: 'var(--text-main)', display: 'block' }}>
                        {s.name}
                      </strong>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-dim)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {s.centroid_lat.toFixed(3)}°, {s.centroid_lng.toFixed(3)}°
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8125rem',
                          color: '#cbd5e1',
                        }}
                      >
                        {s.code}
                      </span>
                    </td>
                    <td>{s.habitat_type}</td>
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>
                        {s.area_hectares.toLocaleString()} ha
                      </strong>
                    </td>
                    <td>{s.carbon_density_tco2e_per_ha} t/ha</td>
                    <td>{s.canopy_cover_pct}%</td>
                    <td>
                      <Badge status={s.threat_level}>{s.threat_level}</Badge>
                    </td>
                    <td>
                      <button
                        onClick={() => onViewOnMap(s.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', gap: '0.3rem' }}
                      >
                        <MapPin size={13} color="var(--primary)" />
                        Locate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
            }}
          >
            No spatial parcels attached to this project yet. Click{' '}
            <strong>"Add Site Parcel"</strong> or draw a polygon on the GIS map.
          </div>
        )}
      </div>

      {/* Modals */}
      <ProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(data) => onUpdateProject(project.id, data)}
        initialData={project}
      />

      <CreateSiteModal
        isOpen={isCreateSiteModalOpen}
        onClose={() => setIsCreateSiteModalOpen(false)}
        projects={[project]}
        defaultProjectId={project.id}
        onSubmit={onCreateSite}
      />
    </div>
  );
};
