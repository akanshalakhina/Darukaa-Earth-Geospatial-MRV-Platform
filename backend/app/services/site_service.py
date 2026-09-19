import json
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.site import Site
from app.models.project import Project
from app.models.activity import ActivityLog
from app.schemas.site import SiteCreate, SiteUpdate, SiteResponse
from app.services.spatial_service import SpatialService


class SiteService:
    @classmethod
    def get_sites(
        cls,
        db: Session,
        project_id: Optional[int] = None,
        as_geojson: bool = False,
    ) -> Any:
        query = db.query(Site)
        if project_id:
            query = query.filter(Site.project_id == project_id)

        sites = query.order_by(Site.created_at.desc()).all()

        if as_geojson:
            return SpatialService.sites_to_feature_collection(sites)

        responses = []
        for s in sites:
            resp = SiteResponse(
                id=s.id,
                project_id=s.project_id,
                name=s.name,
                code=s.code,
                area_hectares=s.area_hectares,
                habitat_type=s.habitat_type,
                elevation_m=s.elevation_m,
                centroid_lat=s.centroid_lat,
                centroid_lng=s.centroid_lng,
                geometry=(
                    json.loads(s.geometry_geojson)
                    if isinstance(s.geometry_geojson, str)
                    else s.geometry_geojson
                ),
                carbon_density_tco2e_per_ha=s.carbon_density_tco2e_per_ha,
                canopy_cover_pct=s.canopy_cover_pct,
                species_richness=s.species_richness,
                soil_organic_carbon_pct=s.soil_organic_carbon_pct,
                threat_level=s.threat_level,
                monitoring_status=s.monitoring_status,
                created_at=s.created_at,
                updated_at=s.updated_at,
            )
            responses.append(resp)

        return responses

    @classmethod
    def get_by_id(cls, db: Session, site_id: int) -> SiteResponse:
        site = db.query(Site).filter(Site.id == site_id).first()
        if not site:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Site with ID {site_id} was not found.",
            )

        geom = (
            json.loads(site.geometry_geojson)
            if isinstance(site.geometry_geojson, str)
            else site.geometry_geojson
        )

        return SiteResponse(
            id=site.id,
            project_id=site.project_id,
            name=site.name,
            code=site.code,
            area_hectares=site.area_hectares,
            habitat_type=site.habitat_type,
            elevation_m=site.elevation_m,
            centroid_lat=site.centroid_lat,
            centroid_lng=site.centroid_lng,
            geometry=geom,
            carbon_density_tco2e_per_ha=site.carbon_density_tco2e_per_ha,
            canopy_cover_pct=site.canopy_cover_pct,
            species_richness=site.species_richness,
            soil_organic_carbon_pct=site.soil_organic_carbon_pct,
            threat_level=site.threat_level,
            monitoring_status=site.monitoring_status,
            created_at=site.created_at,
            updated_at=site.updated_at,
        )

    @classmethod
    def create(
        cls, db: Session, site_in: SiteCreate, user_id: Optional[int] = None
    ) -> SiteResponse:
        project = db.query(Project).filter(Project.id == site_in.project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parent project with ID {site_in.project_id} does not exist.",
            )

        # Validate geometry, calculate area and centroid
        try:
            geom_dict, computed_area_ha, centroid_lat, centroid_lng = (
                SpatialService.validate_and_parse_geometry(site_in.geometry)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid GeoJSON polygon geometry: {str(e)}",
            )

        area_ha = (
            site_in.area_hectares
            if (site_in.area_hectares and site_in.area_hectares > 0)
            else computed_area_ha
        )

        site = Site(
            project_id=site_in.project_id,
            name=site_in.name,
            code=site_in.code,
            area_hectares=area_ha,
            habitat_type=site_in.habitat_type,
            elevation_m=site_in.elevation_m,
            centroid_lat=centroid_lat,
            centroid_lng=centroid_lng,
            geometry_geojson=json.dumps(geom_dict),
            carbon_density_tco2e_per_ha=site_in.carbon_density_tco2e_per_ha,
            canopy_cover_pct=site_in.canopy_cover_pct,
            species_richness=site_in.species_richness,
            soil_organic_carbon_pct=site_in.soil_organic_carbon_pct,
            threat_level=site_in.threat_level,
            monitoring_status=site_in.monitoring_status,
        )
        db.add(site)
        db.commit()
        db.refresh(site)

        # Log activity
        activity = ActivityLog(
            project_id=project.id,
            user_id=user_id,
            action_type="DRAW_SITE",
            title=f"Site Delineated: {site.name} ({site.code})",
            description=f"Added {area_ha} hectares parcel to project '{project.name}'.",
        )
        db.add(activity)
        db.commit()

        return cls.get_by_id(db, site.id)

    @classmethod
    def update(
        cls,
        db: Session,
        site_id: int,
        site_in: SiteUpdate,
        user_id: Optional[int] = None,
    ) -> SiteResponse:
        site = db.query(Site).filter(Site.id == site_id).first()
        if not site:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Site with ID {site_id} was not found.",
            )

        update_data = site_in.model_dump(exclude_unset=True)

        if "geometry" in update_data and update_data["geometry"]:
            geom_dict, computed_area_ha, centroid_lat, centroid_lng = (
                SpatialService.validate_and_parse_geometry(update_data["geometry"])
            )
            site.geometry_geojson = json.dumps(geom_dict)
            site.centroid_lat = centroid_lat
            site.centroid_lng = centroid_lng
            if "area_hectares" not in update_data or not update_data["area_hectares"]:
                site.area_hectares = computed_area_ha
            del update_data["geometry"]

        for key, value in update_data.items():
            setattr(site, key, value)

        db.commit()
        db.refresh(site)

        # Log activity
        activity = ActivityLog(
            project_id=site.project_id,
            user_id=user_id,
            action_type="UPDATE",
            title=f"Site Boundary Updated: {site.name}",
            description="Updated site attributes and parameters.",
        )
        db.add(activity)
        db.commit()

        return cls.get_by_id(db, site.id)

    @classmethod
    def delete(
        cls, db: Session, site_id: int, user_id: Optional[int] = None
    ) -> Dict[str, str]:
        site = db.query(Site).filter(Site.id == site_id).first()
        if not site:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Site with ID {site_id} was not found.",
            )

        name = site.name
        project_id = site.project_id
        db.delete(site)
        db.commit()

        activity = ActivityLog(
            project_id=project_id,
            user_id=user_id,
            action_type="DELETE",
            title=f"Site Removed: {name}",
            description="Site removed from project.",
        )
        db.add(activity)
        db.commit()

        return {"message": f"Site '{name}' was deleted successfully."}
