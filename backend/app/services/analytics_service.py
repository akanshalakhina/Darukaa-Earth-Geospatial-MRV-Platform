from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.site import Site
from app.models.analytics import AnalyticsSnapshot
from app.schemas.analytics import (
    AnalyticsOverview,
    CarbonTrendItem,
    BiodiversityRadar,
    BiomeBreakdown,
    AnalyticsSnapshotResponse,
)


class AnalyticsService:
    @classmethod
    def get_overview(
        cls, db: Session, project_id: Optional[int] = None
    ) -> AnalyticsOverview:
        # Filter query if project_id specified
        project_query = db.query(Project)
        site_query = db.query(Site)

        if project_id:
            project_query = project_query.filter(Project.id == project_id)
            site_query = site_query.filter(Site.project_id == project_id)

        projects = project_query.all()
        sites = site_query.all()

        total_projects = len(projects)
        total_sites = len(sites)
        total_hectares = sum(s.area_hectares for s in sites)
        total_carbon_tco2e = sum(
            s.area_hectares * s.carbon_density_tco2e_per_ha for s in sites
        )

        avg_biodiversity = (
            sum(p.target_biodiversity_score for p in projects) / total_projects
            if total_projects > 0
            else 85.0
        )
        avg_canopy = (
            sum(s.canopy_cover_pct for s in sites) / total_sites
            if total_sites > 0
            else 80.0
        )

        active_verifications = sum(
            1
            for p in projects
            if p.status in ["Active", "Verified", "Under Validation"]
        )
        # Estimated market value: ~$18/tCO2e for verified nature-based carbon credits
        carbon_credits_value_usd = round(total_carbon_tco2e * 18.5, 2)

        # Monthly carbon trends (last 12 months)
        months = [
            "Oct",
            "Nov",
            "Dec",
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
        ]
        monthly_trends = []
        base_monthly = total_carbon_tco2e / 12.0 if total_carbon_tco2e > 0 else 1000.0

        for i, m in enumerate(months):
            seasonal_factor = 1.0 + 0.18 * math_sin_wave(i)
            actual = round(base_monthly * (i + 1) * 0.95 * seasonal_factor, 1)
            baseline = round(base_monthly * (i + 1) * 0.65, 1)
            target = round(base_monthly * (i + 1) * 1.05, 1)
            flux = round(actual - baseline, 1)
            monthly_trends.append(
                CarbonTrendItem(
                    month_label=m,
                    actual_tco2e=actual,
                    baseline_tco2e=baseline,
                    target_tco2e=target,
                    flux_tco2e=flux,
                )
            )

        # Biodiversity radar comparison
        biodiversity_radar = BiodiversityRadar(
            taxa=[
                "Avian (Birds)",
                "Mammals",
                "Herpetofauna (Reptiles/Amphibians)",
                "Vascular Plants",
                "Entomofauna (Insects)",
                "Soil Microbiome",
            ],
            current_index=[
                round(avg_biodiversity * f, 1)
                for f in [0.94, 0.88, 0.82, 0.96, 0.90, 0.85]
            ],
            baseline_index=[
                round(avg_biodiversity * f, 1)
                for f in [0.65, 0.58, 0.52, 0.70, 0.60, 0.55]
            ],
        )

        # Biome distribution breakdown
        biome_map: Dict[str, Dict[str, Any]] = {}
        for p in projects:
            b = p.biome or "Other"
            if b not in biome_map:
                biome_map[b] = {
                    "biome": b,
                    "project_count": 0,
                    "hectares": 0.0,
                    "tco2e": 0.0,
                }
            biome_map[b]["project_count"] += 1

        for s in sites:
            if s.project and s.project.biome:
                b = s.project.biome
                if b in biome_map:
                    biome_map[b]["hectares"] += s.area_hectares
                    biome_map[b]["tco2e"] += (
                        s.area_hectares * s.carbon_density_tco2e_per_ha
                    )

        biome_breakdown = [
            BiomeBreakdown(
                biome=k,
                project_count=v["project_count"],
                hectares=round(v["hectares"], 2),
                tco2e=round(v["tco2e"], 1),
            )
            for k, v in biome_map.items()
        ]

        return AnalyticsOverview(
            total_projects=total_projects,
            total_sites=total_sites,
            total_hectares=round(total_hectares, 2),
            total_carbon_tco2e=round(total_carbon_tco2e, 1),
            avg_biodiversity_score=round(avg_biodiversity, 1),
            avg_canopy_cover=round(avg_canopy, 1),
            active_verifications=active_verifications,
            carbon_credits_value_usd=carbon_credits_value_usd,
            monthly_carbon_trends=monthly_trends,
            biodiversity_radar=biodiversity_radar,
            biome_breakdown=biome_breakdown,
        )

    @classmethod
    def get_site_analytics(
        cls, db: Session, site_id: int
    ) -> List[AnalyticsSnapshotResponse]:
        site = db.query(Site).filter(Site.id == site_id).first()
        if not site:
            return []

        snapshots = (
            db.query(AnalyticsSnapshot)
            .filter(AnalyticsSnapshot.site_id == site_id)
            .order_by(AnalyticsSnapshot.timestamp.asc())
            .all()
        )

        if not snapshots:
            # Generate synthetic monthly timeline for this site if none stored yet
            now = datetime.utcnow()
            snapshots_out = []
            for i in range(12, 0, -1):
                dt = now - timedelta(days=i * 30)
                ndvi_val = round(
                    0.68 + 0.15 * math_sin_wave(i) + (site.canopy_cover_pct / 1000.0), 3
                )
                evi_val = round(ndvi_val * 0.88, 3)
                biomass = round(
                    site.carbon_density_tco2e_per_ha * 1.35 + (12 - i) * 2.5, 1
                )
                cum_carbon = round(
                    site.area_hectares
                    * site.carbon_density_tco2e_per_ha
                    * ((13 - i) / 12.0),
                    1,
                )
                flux = round(cum_carbon / 12.0, 1)

                snapshots_out.append(
                    AnalyticsSnapshotResponse(
                        id=i,
                        project_id=site.project_id,
                        site_id=site.id,
                        timestamp=dt,
                        ndvi=min(0.98, max(0.40, ndvi_val)),
                        evi=min(0.92, max(0.35, evi_val)),
                        canopy_cover_pct=round(
                            site.canopy_cover_pct + 1.2 * math_sin_wave(i), 1
                        ),
                        biomass_density_mg_per_ha=biomass,
                        cumulative_tco2e=cum_carbon,
                        monthly_flux_tco2e=flux,
                        species_observed_count=int(
                            site.species_richness * (0.85 + 0.15 * (12 - i) / 12.0)
                        ),
                        soil_moisture_pct=round(30.0 + 8.0 * math_sin_wave(i + 2), 1),
                    )
                )
            return snapshots_out

        return [AnalyticsSnapshotResponse.model_validate(s) for s in snapshots]


def math_sin_wave(index: int) -> float:
    import math

    return math.sin(index * 0.5)
