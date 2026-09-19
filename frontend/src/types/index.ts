export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  organization: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Project {
  id: number;
  name: string;
  slug: string;
  description: string;
  project_type: string;
  standard: string;
  status: 'Draft' | 'Under Validation' | 'Active' | 'Verified' | 'Completed' | string;
  country: string;
  region?: string;
  biome: string;
  estimated_annual_tco2e: number;
  target_biodiversity_score: number;
  budget: number;
  start_date?: string;
  end_date?: string;
  developer_name: string;
  created_by_id?: number;
  created_at: string;
  updated_at: string;
  total_sites: number;
  total_hectares: number;
  total_carbon_stock: number;
  avg_canopy_cover: number;
}

export interface ProjectCreateInput {
  name: string;
  description?: string;
  project_type: string;
  standard: string;
  status: string;
  country: string;
  region?: string;
  biome: string;
  estimated_annual_tco2e: number;
  target_biodiversity_score: number;
  budget: number;
  developer_name?: string;
}

export interface SiteGeometry {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface Site {
  id: number;
  project_id: number;
  name: string;
  code: string;
  area_hectares: number;
  habitat_type: string;
  elevation_m: number;
  centroid_lat: number;
  centroid_lng: number;
  geometry: SiteGeometry;
  carbon_density_tco2e_per_ha: number;
  canopy_cover_pct: number;
  species_richness: number;
  soil_organic_carbon_pct: number;
  threat_level: 'Low' | 'Moderate' | 'High' | 'Critical' | string;
  monitoring_status: string;
  created_at: string;
  updated_at: string;
}

export interface SiteFeature {
  type: 'Feature';
  id: number;
  geometry: SiteGeometry;
  properties: {
    id: number;
    project_id: number;
    project_name?: string;
    name: string;
    code: string;
    area_hectares: number;
    habitat_type: string;
    elevation_m: number;
    centroid_lat: number;
    centroid_lng: number;
    carbon_density_tco2e_per_ha: number;
    canopy_cover_pct: number;
    species_richness: number;
    soil_organic_carbon_pct: number;
    threat_level: string;
    monitoring_status: string;
    total_carbon_stock: number;
  };
}

export interface SiteFeatureCollection {
  type: 'FeatureCollection';
  features: SiteFeature[];
}

export interface SiteCreateInput {
  project_id: number;
  name: string;
  code: string;
  habitat_type: string;
  elevation_m: number;
  carbon_density_tco2e_per_ha: number;
  canopy_cover_pct: number;
  species_richness: number;
  soil_organic_carbon_pct: number;
  threat_level: string;
  monitoring_status: string;
  geometry: SiteGeometry;
  area_hectares?: number;
}

export interface AnalyticsSnapshot {
  id: number;
  project_id: number;
  site_id?: number;
  timestamp: string;
  ndvi: number;
  evi: number;
  canopy_cover_pct: number;
  biomass_density_mg_per_ha: number;
  cumulative_tco2e: number;
  monthly_flux_tco2e: number;
  species_observed_count: number;
  soil_moisture_pct: number;
}

export interface CarbonTrendItem {
  month_label: string;
  actual_tco2e: number;
  baseline_tco2e: number;
  target_tco2e: number;
  flux_tco2e: number;
}

export interface BiodiversityRadar {
  taxa: string[];
  current_index: number[];
  baseline_index: number[];
}

export interface BiomeBreakdown {
  biome: string;
  project_count: number;
  hectares: number;
  tco2e: number;
}

export interface AnalyticsOverview {
  total_projects: number;
  total_sites: number;
  total_hectares: number;
  total_carbon_tco2e: number;
  avg_biodiversity_score: number;
  avg_canopy_cover: number;
  active_verifications: number;
  carbon_credits_value_usd: number;
  monthly_carbon_trends: CarbonTrendItem[];
  biodiversity_radar: BiodiversityRadar;
  biome_breakdown: BiomeBreakdown[];
}

export interface Activity {
  id: number;
  project_id?: number;
  user_id?: number;
  action_type: string;
  title: string;
  description?: string;
  timestamp: string;
}
