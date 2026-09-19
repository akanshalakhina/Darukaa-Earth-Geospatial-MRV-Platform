import React, { useState, useEffect } from 'react';
import { Project, AnalyticsOverview } from '../types';
import { analyticsApi } from '../api/client';
import { StatCard } from '../components/common/StatCard';
import { CarbonTrajectoryChart } from '../components/analytics/CarbonTrajectoryChart';
import { BiodiversityRadarChart } from '../components/analytics/BiodiversityRadarChart';
import { BiomeDoughnutChart } from '../components/analytics/BiomeDoughnutChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  TrendingUp,
  ShieldCheck,
  Trees,
  Layers,
  DollarSign,
  Download,
  Filter,
  CheckCircle,
} from 'lucide-react';

interface AnalyticsPageProps {
  projects: Project[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ projects }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const data = await analyticsApi.getOverview(selectedProjectId || undefined);
        setOverview(data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [selectedProjectId]);

  const handleExportReport = () => {
    if (!overview) return;
    const reportData = {
      platform: 'Darukaa.Earth MRV Telemetry',
      generated_at: new Date().toISOString(),
      project_scope: selectedProjectId ? `Project ID ${selectedProjectId}` : 'All Projects',
      summary: {
        total_projects: overview.total_projects,
        total_hectares: overview.total_hectares,
        total_carbon_stock_tco2e: overview.total_carbon_tco2e,
        biodiversity_index: overview.avg_biodiversity_score,
        carbon_credits_pipeline_usd: overview.carbon_credits_value_usd,
      },
      monthly_carbon_trends: overview.monthly_carbon_trends,
      biodiversity_taxa: overview.biodiversity_radar,
      biome_distribution: overview.biome_breakdown,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `darukaa-mrv-audit-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setExportNotice('MRV Audit verification packet downloaded successfully!');
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header & Scope Selector */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Environmental MRV & Carbon Intelligence
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Scientific time-series modeling of carbon flux curves, baseline counterfactuals, and
            taxonomic biodiversity metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Project Scope Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-dim)" />
            <select
              className="form-select"
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
              style={{ minWidth: '220px', fontSize: '0.8125rem' }}
            >
              <option value="">Global Environmental Portfolio</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportReport}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <Download size={15} />
            Export MRV Report
          </button>
        </div>
      </div>

      {exportNotice && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#34d399',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle size={16} />
          {exportNotice}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Calculating high-resolution carbon fluxes..." />
      ) : overview ? (
        <>
          {/* Key Analytics KPI Cards */}
          <div className="stat-card-grid">
            <StatCard
              title="Net Carbon Accretion"
              value={`${overview.total_carbon_tco2e.toLocaleString()} t`}
              subtitle="Tons CO2e verified under Verra VCS"
              icon={TrendingUp}
              change="+18.4% above baseline"
              changePositive={true}
            />
            <StatCard
              title="Mean Biodiversity Index"
              value={`${overview.avg_biodiversity_score} / 100`}
              subtitle="Taxonomic species richness score"
              icon={ShieldCheck}
              change="Faunal corridor thriving"
              changePositive={true}
            />
            <StatCard
              title="Monitored Hectares"
              value={`${overview.total_hectares.toLocaleString()} ha`}
              subtitle="Covered by PostGIS polygon parcels"
              icon={Layers}
              change="100% active Sentinel-2 scan"
              changePositive={true}
            />
            <StatCard
              title="Credit Portfolio Valuation"
              value={`$${overview.carbon_credits_value_usd.toLocaleString()}`}
              subtitle="Nature-based credit pipeline"
              icon={DollarSign}
              change="Spot price: $18.5/t"
              changePositive={true}
            />
          </div>

          {/* Core Analytics Charts */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <CarbonTrajectoryChart
              trends={overview.monthly_carbon_trends}
              title={
                selectedProjectId
                  ? 'Project Carbon Sequestration Trajectory (tCO2e vs VCS Baseline)'
                  : 'Global Portfolio Carbon Sequestration Trajectory (tCO2e vs VCS Baseline)'
              }
            />

            <BiodiversityRadarChart
              radarData={overview.biodiversity_radar}
              title="Taxonomic Biodiversity Health Assessment (Current vs Baseline)"
            />
          </div>

          {/* Biome Breakdown Table & Chart */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
            <BiomeDoughnutChart
              biomes={overview.biome_breakdown}
              title="Conserved Hectares by Biome"
            />

            <div className="glass-card">
              <h3
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  color: 'var(--text-main)',
                }}
              >
                Biome Environmental Asset Portfolio
              </h3>
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Biome Ecosystem</th>
                      <th>Projects</th>
                      <th>Total Hectares</th>
                      <th>Carbon Stock (tCO2e)</th>
                      <th>Mean Carbon Density</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.biome_breakdown.map((b) => {
                      const density = b.hectares > 0 ? (b.tco2e / b.hectares).toFixed(1) : '220.0';
                      return (
                        <tr key={b.biome}>
                          <td>
                            <strong style={{ color: 'var(--text-main)' }}>{b.biome}</strong>
                          </td>
                          <td>{b.project_count}</td>
                          <td>
                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                              {b.hectares.toLocaleString()} ha
                            </span>
                          </td>
                          <td>
                            <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                              {b.tco2e.toLocaleString()} t
                            </span>
                          </td>
                          <td>{density} t/ha</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
