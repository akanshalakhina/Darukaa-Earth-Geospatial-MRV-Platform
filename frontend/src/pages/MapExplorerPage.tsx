import React, { useState, useMemo } from 'react';
import { Project, Site, SiteFeatureCollection, SiteCreateInput, SiteGeometry } from '../types';
import { MapboxMap } from '../components/map/MapboxMap';
import { SiteDrawer } from '../components/sites/SiteDrawer';
import { CreateSiteModal } from '../components/sites/CreateSiteModal';
import { Badge } from '../components/common/Badge';
import {
  MapPin,
  PenTool,
  Search,
  Filter,
  Layers,
  ChevronRight,
  Plus,
  CheckCircle2,
} from 'lucide-react';

interface MapExplorerPageProps {
  projects: Project[];
  sites: Site[];
  sitesGeoJSON: SiteFeatureCollection;
  initialSelectedSiteId?: number | null;
  initialProjectId?: number | null;
  onCreateSite: (data: SiteCreateInput) => Promise<void>;
  onDeleteSite: (siteId: number) => Promise<void>;
}

export const MapExplorerPage: React.FC<MapExplorerPageProps> = ({
  projects,
  sites,
  sitesGeoJSON,
  initialSelectedSiteId,
  initialProjectId,
  onCreateSite,
  onDeleteSite,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    initialProjectId || null
  );
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(
    initialSelectedSiteId || null
  );
  const [siteSearch, setSiteSearch] = useState('');
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  // Drawn polygon states
  const [drawnGeometry, setDrawnGeometry] = useState<SiteGeometry | null>(null);
  const [drawnHectares, setDrawnHectares] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filtered sites for list
  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      const matchesProject = !selectedProjectId || s.project_id === selectedProjectId;
      const matchesSearch =
        !siteSearch ||
        s.name.toLowerCase().includes(siteSearch.toLowerCase()) ||
        s.code.toLowerCase().includes(siteSearch.toLowerCase()) ||
        s.habitat_type.toLowerCase().includes(siteSearch.toLowerCase());
      return matchesProject && matchesSearch;
    });
  }, [sites, selectedProjectId, siteSearch]);

  // Selected site instance
  const selectedSite = useMemo(() => {
    if (!selectedSiteId) return null;
    return sites.find((s) => s.id === selectedSiteId) || null;
  }, [sites, selectedSiteId]);

  const activeProject = useMemo(() => {
    if (!selectedSite) {
      if (selectedProjectId) return projects.find((p) => p.id === selectedProjectId);
      return null;
    }
    return projects.find((p) => p.id === selectedSite.project_id);
  }, [projects, selectedSite, selectedProjectId]);

  const handlePolygonCreated = (geometry: any, areaHa: number, centroid: [number, number]) => {
    setDrawnGeometry(geometry);
    setDrawnHectares(areaHa);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 70px)',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Left Sidebar Floating Panel */}
      <div
        style={{
          width: '340px',
          height: '100%',
          backgroundColor: 'var(--bg-card)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 25,
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Panel Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.85rem',
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Layers size={17} color="var(--primary)" />
              GIS Site Parcels
            </h3>
            <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
              {filteredSites.length} parcels
            </span>
          </div>

          {/* Project Filter */}
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <select
              className="form-select"
              value={selectedProjectId || ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                setSelectedProjectId(val);
                setSelectedSiteId(null);
              }}
              style={{ fontSize: '0.8125rem' }}
            >
              <option value="">All Global Projects ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search
              size={14}
              color="var(--text-dim)"
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.1rem', fontSize: '0.8125rem', width: '100%' }}
              value={siteSearch}
              onChange={(e) => setSiteSearch(e.target.value)}
              placeholder="Filter sites by name or code..."
            />
          </div>
        </div>

        {/* Drawn Polygon Action Callout */}
        {drawnHectares !== null && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              borderBottom: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span
                style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, display: 'block' }}
              >
                Polygon Captured!
              </span>
              <span style={{ fontSize: '0.8125rem', color: '#fff', fontWeight: 800 }}>
                {drawnHectares} ha
              </span>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.75rem', gap: '0.35rem' }}
            >
              <Plus size={14} />
              Save Site
            </button>
          </div>
        )}

        {/* Site List Scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
          {filteredSites.length > 0 ? (
            filteredSites.map((s) => {
              const isSelected = selectedSiteId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSiteId(s.id)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isSelected ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color-subtle)'}`,
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        color: '#38bdf8',
                        fontWeight: 700,
                      }}
                    >
                      {s.code}
                    </span>
                    <Badge status={s.threat_level}>{s.threat_level}</Badge>
                  </div>
                  <h4
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: '0.2rem',
                    }}
                  >
                    {s.name}
                  </h4>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>{s.habitat_type}</span>
                    <strong style={{ color: 'var(--primary)' }}>
                      {s.area_hectares.toLocaleString()} ha
                    </strong>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '2.5rem 1rem',
                color: 'var(--text-muted)',
                fontSize: '0.8125rem',
              }}
            >
              No sites match your criteria.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', gap: '0.4rem', justifyContent: 'center' }}
          >
            <Plus size={14} />
            Add Parcel to PostGIS
          </button>
        </div>
      </div>

      {/* Main Mapbox Map Canvas */}
      <div style={{ flex: 1, height: '100%', position: 'relative' }}>
        <MapboxMap
          sitesGeoJSON={sitesGeoJSON}
          selectedSiteId={selectedSiteId}
          onSelectSite={(siteId) => setSelectedSiteId(siteId)}
          onPolygonCreated={handlePolygonCreated}
          isDrawingMode={isDrawingMode}
          onToggleDrawingMode={setIsDrawingMode}
          activeProjectId={selectedProjectId}
        />
      </div>

      {/* Site Telemetry Flyout Drawer */}
      {selectedSite && (
        <SiteDrawer
          site={selectedSite}
          projectName={activeProject?.name}
          onClose={() => setSelectedSiteId(null)}
          onDeleteSite={onDeleteSite}
        />
      )}

      {/* Create Site Modal */}
      <CreateSiteModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setDrawnHectares(null);
          setDrawnGeometry(null);
        }}
        projects={projects}
        defaultProjectId={selectedProjectId}
        drawnGeometry={drawnGeometry}
        drawnHectares={drawnHectares}
        onSubmit={onCreateSite}
      />
    </div>
  );
};
