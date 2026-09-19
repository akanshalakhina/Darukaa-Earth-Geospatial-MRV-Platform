import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Project, SiteCreateInput, SiteGeometry } from '../../types';
import { PenTool, CheckCircle2 } from 'lucide-react';

interface CreateSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  defaultProjectId?: number | null;
  drawnGeometry?: SiteGeometry | null;
  drawnHectares?: number | null;
  onSubmit: (data: SiteCreateInput) => Promise<void>;
}

export const CreateSiteModal: React.FC<CreateSiteModalProps> = ({
  isOpen,
  onClose,
  projects,
  defaultProjectId,
  drawnGeometry,
  drawnHectares,
  onSubmit,
}) => {
  const [projectId, setProjectId] = useState<number>(defaultProjectId || (projects[0]?.id ?? 1));
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [habitatType, setHabitatType] = useState('Primary Rainforest');
  const [elevationM, setElevationM] = useState(150);
  const [carbonDensity, setCarbonDensity] = useState(240);
  const [canopyCover, setCanopyCover] = useState(85);
  const [speciesRichness, setSpeciesRichness] = useState(140);
  const [soilOrganicCarbon, setSoilOrganicCarbon] = useState(5.2);
  const [threatLevel, setThreatLevel] = useState('Low');
  const [monitoringStatus, setMonitoringStatus] = useState('Active Satellite Scan');
  const [areaHectares, setAreaHectares] = useState<number>(drawnHectares || 120);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultProjectId) setProjectId(defaultProjectId);
    else if (projects.length > 0 && !projectId) setProjectId(projects[0].id);

    if (drawnHectares) setAreaHectares(drawnHectares);
    setError(null);
  }, [defaultProjectId, drawnHectares, projects, isOpen, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Site name and site code are required.');
      return;
    }

    if (!projectId) {
      setError('Please select a parent project for this geographical site.');
      return;
    }

    // Default polygon if none was explicitly drawn on Mapbox
    const geometry: SiteGeometry = drawnGeometry || {
      type: 'Polygon',
      coordinates: [
        [
          [-77.35, -5.75],
          [-77.3, -5.74],
          [-77.29, -5.79],
          [-77.36, -5.8],
          [-77.35, -5.75],
        ],
      ],
    };

    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        project_id: projectId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        habitat_type: habitatType,
        elevation_m: Number(elevationM),
        carbon_density_tco2e_per_ha: Number(carbonDensity),
        canopy_cover_pct: Number(canopyCover),
        species_richness: Number(speciesRichness),
        soil_organic_carbon_pct: Number(soilOrganicCarbon),
        threat_level: threatLevel,
        monitoring_status: monitoringStatus,
        geometry,
        area_hectares: Number(areaHectares),
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create site.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delineate Geographical Site"
      subtitle="Link spatial parcel polygon with baseline biodiversity and carbon density metrics."
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#f87171',
              fontSize: '0.8125rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        {drawnHectares && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8125rem',
              color: '#34d399',
              marginBottom: '1.25rem',
            }}
          >
            <CheckCircle2 size={18} />
            <span>
              Mapbox Polygon Captured: <strong>{drawnHectares} hectares</strong> calculated via
              geodesic projection.
            </span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Parent Conservation Project *</label>
          <select
            className="form-select"
            value={projectId}
            onChange={(e) => setProjectId(Number(e.target.value))}
            required
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.country} - {p.biome})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Site Parcel Name *</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ridge Primary Canopy Sector"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Site Code *</label>
            <input
              type="text"
              className="form-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. AMZ-SEC-01"
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Habitat Type</label>
            <input
              type="text"
              className="form-input"
              value={habitatType}
              onChange={(e) => setHabitatType(e.target.value)}
              placeholder="e.g. Dense Mangrove, Montane Cloud Forest"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Elevation (m ASL)</label>
            <input
              type="number"
              className="form-input"
              value={elevationM}
              onChange={(e) => setElevationM(Number(e.target.value))}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Area (Hectares) *</label>
            <input
              type="number"
              className="form-input"
              value={areaHectares}
              onChange={(e) => setAreaHectares(Number(e.target.value))}
              step="0.1"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Carbon Density (tCO2e/ha)</label>
            <input
              type="number"
              className="form-input"
              value={carbonDensity}
              onChange={(e) => setCarbonDensity(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Canopy Cover %</label>
            <input
              type="number"
              className="form-input"
              value={canopyCover}
              onChange={(e) => setCanopyCover(Number(e.target.value))}
              min="0"
              max="100"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Species Count</label>
            <input
              type="number"
              className="form-input"
              value={speciesRichness}
              onChange={(e) => setSpeciesRichness(Number(e.target.value))}
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Soil Organic Carbon %</label>
            <input
              type="number"
              className="form-input"
              value={soilOrganicCarbon}
              onChange={(e) => setSoilOrganicCarbon(Number(e.target.value))}
              step="0.1"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Threat Level</label>
            <select
              className="form-select"
              value={threatLevel}
              onChange={(e) => setThreatLevel(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.5rem',
          }}
        >
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving Parcel...' : 'Save Site to PostGIS'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
