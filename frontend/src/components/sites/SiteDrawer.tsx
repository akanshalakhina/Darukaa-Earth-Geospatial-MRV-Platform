import React, { useEffect, useState } from 'react';
import {
  X,
  MapPin,
  Trees,
  TrendingUp,
  Activity,
  Layers,
  Trash2,
  Calendar,
  Satellite,
  ShieldAlert,
} from 'lucide-react';
import { Site, AnalyticsSnapshot } from '../../types';
import { sitesApi } from '../../api/client';
import { Badge } from '../common/Badge';
import { NDVITimeSeriesChart } from '../analytics/NDVITimeSeriesChart';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface SiteDrawerProps {
  site: Site | null;
  projectName?: string;
  onClose: () => void;
  onDeleteSite: (siteId: number) => Promise<void>;
}

export const SiteDrawer: React.FC<SiteDrawerProps> = ({
  site,
  projectName,
  onClose,
  onDeleteSite,
}) => {
  const [snapshots, setSnapshots] = useState<AnalyticsSnapshot[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!site) return;
    const fetchAnalytics = async () => {
      setLoadingAnalytics(true);
      try {
        const data = await sitesApi.getAnalytics(site.id);
        setSnapshots(data);
      } catch (err) {
        console.error('Failed to load site analytics', err);
      } finally {
        setLoadingAnalytics(false);
      }
    };
    fetchAnalytics();
  }, [site]);

  if (!site) return null;

  const totalCarbon = Math.round(site.area_hectares * site.carbon_density_tco2e_per_ha);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete site "${site.name}"?`)) {
      setDeleting(true);
      try {
        await onDeleteSite(site.id);
        onClose();
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <div className="site-drawer">
      {/* Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
        }}
      >
        <div>
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <Badge status={site.monitoring_status}>{site.monitoring_status}</Badge>
            <Badge status={site.threat_level}>Threat: {site.threat_level}</Badge>
          </div>
          <h2
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1.3,
            }}
          >
            {site.name}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Site Code: <strong style={{ color: '#fff' }}>{site.code}</strong> •{' '}
            {projectName || 'Conservation Reserve'}
          </p>
        </div>

        <button
          onClick={onClose}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.4rem', borderRadius: 'var(--radius-full)' }}
          aria-label="Close drawer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content Body */}
      <div
        style={{
          padding: '1.5rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Hectares & Carbon Highlights */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: '0.2rem',
              }}
            >
              Delineated Area
            </span>
            <strong style={{ fontSize: '1.4rem', color: 'var(--primary)', fontWeight: 800 }}>
              {site.area_hectares.toLocaleString()} ha
            </strong>
          </div>

          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(2, 132, 199, 0.08)',
              border: '1px solid rgba(2, 132, 199, 0.2)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: '0.2rem',
              }}
            >
              Total Carbon Stock
            </span>
            <strong style={{ fontSize: '1.4rem', color: '#38bdf8', fontWeight: 800 }}>
              {totalCarbon.toLocaleString()}{' '}
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>tCO2e</span>
            </strong>
          </div>
        </div>

        {/* Spatial Coordinates & Habitat Details */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h4
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <MapPin size={16} color="var(--primary)" />
            Spatial & Physical Parameters
          </h4>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              fontSize: '0.8125rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>Centroid Lat / Lng</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#fff', fontSize: '0.75rem' }}>
                {site.centroid_lat.toFixed(4)}°, {site.centroid_lng.toFixed(4)}°
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>Elevation</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{site.elevation_m} m ASL</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>Habitat Type</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{site.habitat_type}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>
                Soil Organic Carbon (SOC)
              </span>
              <span style={{ color: '#fff', fontWeight: 600 }}>
                {site.soil_organic_carbon_pct}%
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>Canopy Density</span>
              <span style={{ color: '#34d399', fontWeight: 700 }}>{site.canopy_cover_pct}%</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>
                Observed Species Richness
              </span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                {site.species_richness} taxa
              </span>
            </div>
          </div>
        </div>

        {/* Satellite Multispectral Telemetry */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <h4
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Satellite size={16} color="#38bdf8" />
              Sentinel-2 NDVI Telemetry
            </h4>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Monthly Scan</span>
          </div>

          {loadingAnalytics ? (
            <LoadingSpinner message="Querying multispectral reflectance..." size={24} />
          ) : snapshots.length > 0 ? (
            <NDVITimeSeriesChart snapshots={snapshots} />
          ) : (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              No historical NDVI telemetry snapshots recorded yet.
            </p>
          )}
        </div>

        {/* Delete Action */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <button
            onClick={handleDelete}
            className="btn btn-danger btn-sm"
            style={{ width: '100%', gap: '0.4rem', justifyContent: 'center' }}
            disabled={deleting}
          >
            <Trash2 size={15} />
            {deleting ? 'Deleting Site...' : 'Delete Geographical Site'}
          </button>
        </div>
      </div>
    </div>
  );
};
