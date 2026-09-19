import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { MapExplorerPage } from './pages/MapExplorerPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ProjectModal } from './components/projects/ProjectModal';
import { CreateSiteModal } from './components/sites/CreateSiteModal';
import { projectsApi, sitesApi, analyticsApi } from './api/client';
import { MOCK_PROJECTS, MOCK_SITES, MOCK_SITES_GEOJSON } from './api/mockData';
import { Project, Site, SiteFeatureCollection, ProjectCreateInput, SiteCreateInput } from './types';
import { LoadingSpinner } from './components/common/LoadingSpinner';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [sitesGeoJSON, setSitesGeoJSON] = useState<SiteFeatureCollection>({
    type: 'FeatureCollection',
    features: [],
  });

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedSiteIdForMap, setSelectedSiteIdForMap] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Modals
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);
  const [isNewSiteModalOpen, setIsNewSiteModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load projects & sites
  const refreshData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingData(true);
    try {
      const [projs, siteList, geojson] = await Promise.all([
        projectsApi.list(),
        sitesApi.list(),
        sitesApi.listAsGeoJSON(),
      ]);
      if (projs && projs.length > 0) {
        setProjects(projs);
        setSites(siteList);
        setSitesGeoJSON(geojson);
      } else {
        setProjects(MOCK_PROJECTS);
        setSites(MOCK_SITES);
        setSitesGeoJSON(MOCK_SITES_GEOJSON);
      }
    } catch {
      setProjects(MOCK_PROJECTS);
      setSites(MOCK_SITES);
      setSitesGeoJSON(MOCK_SITES_GEOJSON);
    } finally {
      setLoadingData(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Project CRUD Handlers
  const handleCreateProject = async (data: ProjectCreateInput) => {
    const created = await projectsApi.create(data);
    showToast(`Project "${created.name}" registered successfully!`);
    await refreshData();
  };

  const handleUpdateProject = async (id: number, data: ProjectCreateInput) => {
    const updated = await projectsApi.update(id, data);
    setSelectedProject(updated);
    showToast(`Project "${updated.name}" updated successfully!`);
    await refreshData();
  };

  const handleDeleteProject = async (id: number) => {
    await projectsApi.delete(id);
    setSelectedProject(null);
    setCurrentTab('projects');
    showToast('Project deleted successfully.');
    await refreshData();
  };

  // Site CRUD Handlers
  const handleCreateSite = async (data: SiteCreateInput) => {
    const created = await sitesApi.create(data);
    showToast(`Site parcel "${created.name}" saved to PostGIS!`);
    setSelectedSiteIdForMap(created.id);
    await refreshData();
  };

  const handleDeleteSite = async (id: number) => {
    await sitesApi.delete(id);
    showToast('Site parcel removed.');
    setSelectedSiteIdForMap(null);
    await refreshData();
  };

  // Reseed Demo Data Handler
  const handleReseed = async () => {
    if (window.confirm('Reset database with pristine environmental sample projects and sites?')) {
      try {
        await analyticsApi.reseed();
        showToast('Database reset and seeded with realistic environmental data!');
        await refreshData();
      } catch (err) {
        showToast('Failed to reseed database.');
      }
    }
  };

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LoadingSpinner message="Initializing Darukaa.Earth Platform..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'project-detail') {
            setSelectedProject(null);
          }
        }}
        onReseed={handleReseed}
      />

      {/* Main View Area */}
      <div className="main-content">
        <Navbar
          title={
            currentTab === 'dashboard'
              ? 'Executive Dashboard'
              : currentTab === 'projects'
                ? 'Conservation Projects'
                : currentTab === 'project-detail'
                  ? selectedProject?.name || 'Project Details'
                  : currentTab === 'map'
                    ? 'Geospatial Map Explorer'
                    : 'Carbon & Biodiversity Analytics'
          }
          subtitle={
            currentTab === 'dashboard'
              ? 'Satellite-driven MRV for nature-based solutions'
              : currentTab === 'map'
                ? 'High-resolution PostGIS parcel boundaries & Sentinel-2 vegetation scans'
                : undefined
          }
          onNewProject={() => setIsNewProjectModalOpen(true)}
          onDrawSite={() => {
            setCurrentTab('map');
          }}
        />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              top: '85px',
              right: '25px',
              zIndex: 9999,
              backgroundColor: 'rgba(18, 25, 29, 0.95)',
              border: '1px solid #10b981',
              boxShadow: 'var(--shadow-glow)',
              color: '#fff',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
            {toastMessage}
          </div>
        )}

        {/* Route / Tab Rendering */}
        <main style={{ flex: 1 }}>
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenNewProject={() => setIsNewProjectModalOpen(true)}
              onOpenDrawSite={() => setCurrentTab('map')}
            />
          )}

          {currentTab === 'projects' && (
            <ProjectsPage
              projects={projects}
              loading={loadingData}
              onSelectProject={(proj) => {
                setSelectedProject(proj);
                setCurrentTab('project-detail');
              }}
              onViewOnMap={(proj) => {
                setSelectedProject(proj);
                setSelectedSiteIdForMap(null);
                setCurrentTab('map');
              }}
              onCreateProject={handleCreateProject}
            />
          )}

          {currentTab === 'project-detail' && selectedProject && (
            <ProjectDetailPage
              project={selectedProject}
              sites={sites.filter((s) => s.project_id === selectedProject.id)}
              onBack={() => setCurrentTab('projects')}
              onViewOnMap={(siteId) => {
                setSelectedSiteIdForMap(siteId || null);
                setCurrentTab('map');
              }}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              onCreateSite={handleCreateSite}
            />
          )}

          {currentTab === 'map' && (
            <MapExplorerPage
              projects={projects}
              sites={sites}
              sitesGeoJSON={sitesGeoJSON}
              initialSelectedSiteId={selectedSiteIdForMap}
              initialProjectId={selectedProject?.id || null}
              onCreateSite={handleCreateSite}
              onDeleteSite={handleDeleteSite}
            />
          )}

          {currentTab === 'analytics' && <AnalyticsPage projects={projects} />}
        </main>
      </div>

      {/* Global New Project Modal */}
      <ProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};
