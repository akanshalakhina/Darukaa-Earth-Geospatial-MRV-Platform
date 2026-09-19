import React, { useState, useMemo } from 'react';
import { Project, ProjectCreateInput } from '../types';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectModal } from '../components/projects/ProjectModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Search, Filter, Plus, Trees, Layers, SlidersHorizontal } from 'lucide-react';

interface ProjectsPageProps {
  projects: Project[];
  loading: boolean;
  onSelectProject: (project: Project) => void;
  onViewOnMap: (project: Project) => void;
  onCreateProject: (data: ProjectCreateInput) => Promise<void>;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  loading,
  onSelectProject,
  onViewOnMap,
  onCreateProject,
}) => {
  const [search, setSearch] = useState('');
  const [selectedBiome, setSelectedBiome] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState<'hectares' | 'carbon' | 'name' | 'score'>('hectares');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchesSearch =
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.country.toLowerCase().includes(search.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

        const matchesBiome = !selectedBiome || p.biome === selectedBiome;
        const matchesStatus = !selectedStatus || p.status === selectedStatus;
        const matchesType = !selectedType || p.project_type === selectedType;

        return matchesSearch && matchesBiome && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'hectares') return b.total_hectares - a.total_hectares;
        if (sortBy === 'carbon') return b.estimated_annual_tco2e - a.estimated_annual_tco2e;
        if (sortBy === 'score') return b.target_biodiversity_score - a.target_biodiversity_score;
        return a.name.localeCompare(b.name);
      });
  }, [projects, search, selectedBiome, selectedStatus, selectedType, sortBy]);

  // Unique lists for filters
  const biomes = useMemo(
    () => Array.from(new Set(projects.map((p) => p.biome).filter(Boolean))),
    [projects]
  );
  const statuses = useMemo(
    () => Array.from(new Set(projects.map((p) => p.status).filter(Boolean))),
    [projects]
  );
  const types = useMemo(
    () => Array.from(new Set(projects.map((p) => p.project_type).filter(Boolean))),
    [projects]
  );

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Bar */}
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
            Conservation & Carbon Initiatives
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Managing {projects.length} verified environmental projects across global biomes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
          style={{ gap: '0.5rem' }}
        >
          <Plus size={18} />
          Register New Project
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.85rem',
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            color="var(--text-dim)"
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem', width: '100%' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name or country..."
          />
        </div>

        {/* Biome Filter */}
        <select
          className="form-select"
          value={selectedBiome}
          onChange={(e) => setSelectedBiome(e.target.value)}
        >
          <option value="">All Biomes</option>
          {biomes.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          className="form-select"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Project Type Filter */}
        <select
          className="form-select"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">All Methodologies</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Sort By */}
        <select
          className="form-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
        >
          <option value="hectares">Sort: Largest Area</option>
          <option value="carbon">Sort: Highest tCO2e</option>
          <option value="score">Sort: Biodiversity Score</option>
          <option value="name">Sort: Alphabetical</option>
        </select>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <LoadingSpinner message="Querying conservation portfolio..." />
      ) : filteredProjects.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredProjects.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              onViewDetails={onSelectProject}
              onViewOnMap={onViewOnMap}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Trees}
          title="No Conservation Projects Found"
          description="No projects match your current filters. Adjust your search parameters or register a new conservation initiative."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setSelectedBiome('');
            setSelectedStatus('');
            setSelectedType('');
          }}
        />
      )}

      {/* Create Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onCreateProject}
      />
    </div>
  );
};
