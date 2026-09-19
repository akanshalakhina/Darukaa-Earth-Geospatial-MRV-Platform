import json
import math
from typing import Dict, Any, Tuple, List, Optional
from shapely.geometry import shape


class SpatialService:
    """Geospatial processing service for polygons, area, centroids, and GeoJSON."""

    EARTH_RADIUS_METERS = 6371000.0

    @classmethod
    def validate_and_parse_geometry(
        cls, geometry: Dict[str, Any]
    ) -> Tuple[Dict[str, Any], float, float, float]:
        """
        Validates GeoJSON Polygon geometry.
        Returns:
            (sanitized_geom_dict, area_hectares, centroid_lat, centroid_lng)
        """
        if not isinstance(geometry, dict):
            raise ValueError("Geometry must be a GeoJSON dictionary.")

        geom_type = geometry.get("type")
        if geom_type != "Polygon":
            raise ValueError(f"Expected geometry type 'Polygon', got '{geom_type}'.")

        coords = geometry.get("coordinates")
        if not coords or not isinstance(coords, list) or len(coords) == 0:
            raise ValueError("Polygon coordinates must be a non-empty list of rings.")

        # Ensure ring is closed
        ring = coords[0]
        if len(ring) < 4:
            raise ValueError(
                "Polygon exterior ring must have at least 4 coordinate pairs."
            )

        # Close ring if last != first
        if ring[0] != ring[-1]:
            ring = list(ring)
            ring.append(ring[0])
            coords[0] = ring

        # Shapely shape validation
        sanitized_geom = {"type": "Polygon", "coordinates": coords}
        shapely_geom = shape(sanitized_geom)

        if not shapely_geom.is_valid:
            # Attempt to fix invalid polygon (e.g. self-intersection)
            shapely_geom = shapely_geom.buffer(0)
            if not shapely_geom.is_valid:
                raise ValueError("Provided polygon geometry is topologically invalid.")

        centroid = shapely_geom.centroid
        centroid_lng = float(centroid.x)
        centroid_lat = float(centroid.y)

        # Calculate geodesic area in hectares
        area_hectares = cls.calculate_geodesic_area_hectares(ring)

        return sanitized_geom, area_hectares, centroid_lat, centroid_lng

    @classmethod
    def calculate_geodesic_area_hectares(cls, ring: List[List[float]]) -> float:
        """
        Calculate spherical geodesic area of a polygon ring in hectares.
        Coordinates are [longitude, latitude] in degrees.
        """
        if len(ring) < 3:
            return 0.0

        # Spherical excess using Girard's formula or trapezoidal projection
        # For parcel/reserve scale, equirectangular projection at centroid latitude gives high precision:
        total_lat = sum(p[1] for p in ring[:-1])
        mean_lat_rad = math.radians(total_lat / max(1, len(ring) - 1))

        # Coordinates converted to meters relative to first point
        ref_lng, ref_lat = ring[0][0], ring[0][1]
        m_per_deg_lat = (
            111132.92
            - 559.82 * math.cos(2 * mean_lat_rad)
            + 1.175 * math.cos(4 * mean_lat_rad)
        )
        m_per_deg_lng = 111412.84 * math.cos(mean_lat_rad) - 93.5 * math.cos(
            3 * mean_lat_rad
        )

        pts_meters = [
            ((p[0] - ref_lng) * m_per_deg_lng, (p[1] - ref_lat) * m_per_deg_lat)
            for p in ring
        ]

        # Standard 2D Shoelace area in square meters
        area_m2 = 0.0
        n = len(pts_meters)
        for i in range(n - 1):
            area_m2 += (
                pts_meters[i][0] * pts_meters[i + 1][1]
                - pts_meters[i + 1][0] * pts_meters[i][1]
            )

        area_m2 = abs(area_m2) / 2.0
        area_ha = area_m2 / 10000.0  # 1 ha = 10,000 m²

        return round(area_ha, 2)

    @staticmethod
    def site_to_feature(
        site: Any, project_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Convert a Site model instance into a GeoJSON Feature."""
        geom_dict = (
            json.loads(site.geometry_geojson)
            if isinstance(site.geometry_geojson, str)
            else site.geometry_geojson
        )

        return {
            "type": "Feature",
            "id": site.id,
            "geometry": geom_dict,
            "properties": {
                "id": site.id,
                "project_id": site.project_id,
                "project_name": project_name
                or (site.project.name if site.project else ""),
                "name": site.name,
                "code": site.code,
                "area_hectares": site.area_hectares,
                "habitat_type": site.habitat_type,
                "elevation_m": site.elevation_m,
                "centroid_lat": site.centroid_lat,
                "centroid_lng": site.centroid_lng,
                "carbon_density_tco2e_per_ha": site.carbon_density_tco2e_per_ha,
                "canopy_cover_pct": site.canopy_cover_pct,
                "species_richness": site.species_richness,
                "soil_organic_carbon_pct": site.soil_organic_carbon_pct,
                "threat_level": site.threat_level,
                "monitoring_status": site.monitoring_status,
                "total_carbon_stock": round(
                    site.area_hectares * site.carbon_density_tco2e_per_ha, 1
                ),
            },
        }

    @classmethod
    def sites_to_feature_collection(cls, sites: List[Any]) -> Dict[str, Any]:
        """Convert a list of Site models into a GeoJSON FeatureCollection."""
        features = [cls.site_to_feature(site) for site in sites]
        return {
            "type": "FeatureCollection",
            "features": features,
        }
