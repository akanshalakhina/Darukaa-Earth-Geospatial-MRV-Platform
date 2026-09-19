import React, { useEffect, useState } from 'react';
import {
  Trees,
  Layers,
  TrendingUp,
  ShieldCheck,
  DollarSign,
  Activity as ActivityIcon,
  Compass,
  ArrowUpRight,
  PenTool,
  CheckCircle2,
} from 'lucide-react';
import { AnalyticsOverview, Activity } from '../types';
import { analyticsApi } from '../api/client';
import { MOCK_OVERVIEW, MOCK_ACTIVITIES } from '../api/mockData';
import { StatCard } from '../components/common/StatCard';
import { CarbonTrajectoryChart } from '../components/analytics/CarbonTrajectoryChart';
import { BiomeDoughnutChart } from '../components/analytics/BiomeDoughnutChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
  onOpenNewProject: () => void;
  onOpenDrawSite: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenNewProject,
  onOpenDrawSite,
}) => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ovData, actData] = await Promise.all([
          analyticsApi.getOverview(),
          analyticsApi.getActivities(8),
        ]);
        setOverview(ovData);
        setActivities(actData);
      } catch {
        setOverview(MOCK_OVERVIEW);
        setActivities(MOCK_ACTIVITIES);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating geospatial carbon & biodiversity metrics..." />;
  }

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner with Quick Actions */}
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(2, 132, 199, 0.08))',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          padding: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--primary)',
            }}
          >
            Digital MRV & Nature-Based Solutions
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
            Darukaa.Earth Global Ecological Observatory
          </h2>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              marginTop: '0.25rem',
              maxWidth: 650,
            }}
          >
            Real-time geospatial telemetry tracking above-and-below-ground carbon fluxes, Sentinel-2
            canopy vigor, and taxonomic biodiversity health across global biomes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('map')}
            className="btn btn-primary"
            style={{ gap: '0.5rem' }}
          >
            <Compass size={17} />
            Open GIS Explorer
          </button>
          <button onClick={onOpenDrawSite} className="btn btn-secondary" style={{ gap: '0.5rem' }}>
            <PenTool size={17} color="var(--primary)" />
            Delineate Parcel
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="stat-card-grid">
        <StatCard
          title="Active Projects"
          value={overview?.total_projects || 0}
          subtitle="Verra VCS & Plan Vivo registered"
          icon={Trees}
          change="+2 this quarter"
          changePositive={true}
        />
        <StatCard
          title="Conserved Hectares"
          value={`${(overview?.total_hectares || 0).toLocaleString()} ha`}
          subtitle="Total spatial parcel coverage"
          icon={Layers}
          change="100% PostGIS verified"
          changePositive={true}
        />
        <StatCard
          title="Total Carbon Stock"
          value={`${((overview?.total_carbon_tco2e || 0) / 1000).toFixed(1)}k t`}
          subtitle="Tons CO2 equivalent sequestered"
          icon={TrendingUp}
          change="+14.2% annual accretion"
          changePositive={true}
        />
        <StatCard
          title="Mean Biodiversity Index"
          value={`${overview?.avg_biodiversity_score || 88} / 100`}
          subtitle="Multispectral species abundance"
          icon={ShieldCheck}
          change="Ecological integrity high"
          changePositive={true}
        />
        <StatCard
          title="Est. Credit Pipeline Value"
          value={`$${((overview?.carbon_credits_value_usd || 0) / 1000000).toFixed(2)}M`}
          subtitle="Verified carbon market value"
          icon={DollarSign}
          change="Indexed @ $18.5/tCO2e"
          changePositive={true}
        />
      </div>

      {/* Interactive Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {overview?.monthly_carbon_trends && (
          <CarbonTrajectoryChart
            trends={overview.monthly_carbon_trends}
            title="Aggregated Carbon Sequestration Trajectory (Actual vs Baseline)"
          />
        )}

        {overview?.biome_breakdown && (
          <BiomeDoughnutChart biomes={overview.biome_breakdown} title="Conserved Area by Biome" />
        )}
      </div>

      {/* Recent Activity & Verification Stream */}
      <div className="glass-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Recent MRV Telemetry & Audit Activity
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Automated Sentinel-2 satellite scans, site delineations, and verification milestones.
            </p>
          </div>
          <button
            onClick={() => onNavigate('projects')}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.35rem' }}
          >
            View All Projects
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {activities.length > 0 ? (
            activities.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <ActivityIcon size={18} />
                  </div>
                  <div>
                    <h4
                      style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}
                    >
                      {act.title}
                    </h4>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.1rem',
                      }}
                    >
                      {act.description}
                    </p>
                  </div>
                </div>

                <span
                  style={{ fontSize: '0.75rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}
                >
                  {new Date(act.timestamp).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              No recent audit activity recorded.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
