import axios, { AxiosError } from 'axios';
import {
  AuthResponse,
  User,
  Project,
  ProjectCreateInput,
  Site,
  SiteCreateInput,
  SiteFeatureCollection,
  AnalyticsOverview,
  AnalyticsSnapshot,
  Activity,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('darukaa_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: error logging
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('darukaa_token');
      localStorage.removeItem('darukaa_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return res.data;
  },
  register: async (userData: any): Promise<User> => {
    const res = await apiClient.post<User>('/auth/register', userData);
    return res.data;
  },
  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },
};

// Projects API
export const projectsApi = {
  list: async (params?: {
    search?: string;
    project_type?: string;
    biome?: string;
    status?: string;
  }): Promise<Project[]> => {
    const res = await apiClient.get<Project[]>('/projects', { params });
    return res.data;
  },
  getById: async (id: number): Promise<Project> => {
    const res = await apiClient.get<Project>(`/projects/${id}`);
    return res.data;
  },
  create: async (data: ProjectCreateInput): Promise<Project> => {
    const res = await apiClient.post<Project>('/projects', data);
    return res.data;
  },
  update: async (id: number, data: Partial<ProjectCreateInput>): Promise<Project> => {
    const res = await apiClient.put<Project>(`/projects/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/projects/${id}`);
    return res.data;
  },
};

// Sites API
export const sitesApi = {
  listAsGeoJSON: async (projectId?: number): Promise<SiteFeatureCollection> => {
    const params: Record<string, any> = { as_geojson: true };
    if (projectId) params.project_id = projectId;
    const res = await apiClient.get<SiteFeatureCollection>('/sites', { params });
    return res.data;
  },
  list: async (projectId?: number): Promise<Site[]> => {
    const params: Record<string, any> = { as_geojson: false };
    if (projectId) params.project_id = projectId;
    const res = await apiClient.get<Site[]>('/sites', { params });
    return res.data;
  },
  getById: async (id: number): Promise<Site> => {
    const res = await apiClient.get<Site>(`/sites/${id}`);
    return res.data;
  },
  create: async (data: SiteCreateInput): Promise<Site> => {
    const res = await apiClient.post<Site>('/sites', data);
    return res.data;
  },
  update: async (id: number, data: Partial<SiteCreateInput>): Promise<Site> => {
    const res = await apiClient.put<Site>(`/sites/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/sites/${id}`);
    return res.data;
  },
  getAnalytics: async (id: number): Promise<AnalyticsSnapshot[]> => {
    const res = await apiClient.get<AnalyticsSnapshot[]>(`/sites/${id}/analytics`);
    return res.data;
  },
};

// Analytics API
export const analyticsApi = {
  getOverview: async (projectId?: number): Promise<AnalyticsOverview> => {
    const params = projectId ? { project_id: projectId } : {};
    const res = await apiClient.get<AnalyticsOverview>('/analytics/overview', { params });
    return res.data;
  },
  getActivities: async (limit: number = 20): Promise<Activity[]> => {
    const res = await apiClient.get<Activity[]>('/analytics/activities', { params: { limit } });
    return res.data;
  },
  reseed: async (): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>('/seed/reseed');
    return res.data;
  },
};
