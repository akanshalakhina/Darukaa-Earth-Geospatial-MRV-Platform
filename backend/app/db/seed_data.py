import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User
from app.models.project import Project
from app.models.site import Site
from app.models.analytics import AnalyticsSnapshot
from app.models.activity import ActivityLog
from app.services.spatial_service import SpatialService


def seed_database(db: Session, force: bool = False) -> None:
    """Seeds initial realistic users, environmental projects, PostGIS polygon sites, and analytics."""
    existing_user = db.query(User).filter(User.email == "demo@darukaa.earth").first()
    if existing_user and not force:
        print("[Seed] Database already seeded. Skipping.")
        return

    if force:
        db.query(ActivityLog).delete()
        db.query(AnalyticsSnapshot).delete()
        db.query(Site).delete()
        db.query(Project).delete()
        db.query(User).delete()
        db.commit()

    print("[Seed] Seeding environmental platform data...")

    # 1. Users
    admin_user = User(
        email="demo@darukaa.earth",
        hashed_password=get_password_hash("Darukaa2025!"),
        full_name="Dr. Maya Sen",
        role="Lead Carbon Auditor",
        organization="Darukaa Earth Global Observatory",
        is_active=True,
    )
    analyst_user = User(
        email="analyst@darukaa.earth",
        hashed_password=get_password_hash("Darukaa2025!"),
        full_name="Alex Rivera",
        role="Senior Geospatial Analyst",
        organization="Darukaa Earth Field Operations",
        is_active=True,
    )
    db.add(admin_user)
    db.add(analyst_user)
    db.commit()
    db.refresh(admin_user)

    # 2. Projects & Sites Definition
    projects_data = [
        {
            "name": "Sundarbans Blue Carbon & Mangrove Bio-Shield",
            "slug": "sundarbans-blue-carbon-mangrove",
            "description": "Restoration and high-resolution MRV monitoring of 4,200 hectares of degraded coastal mangrove estuaries in the Bay of Bengal, sequestering high-density tidal carbon while shielding coastal communities.",
            "project_type": "Mangrove Restoration",
            "standard": "Verra VCS",
            "status": "Active",
            "country": "India",
            "region": "West Bengal / Sundarbans Biosphere",
            "biome": "Mangrove / Coastal Wetland",
            "estimated_annual_tco2e": 48500.0,
            "target_biodiversity_score": 92.0,
            "budget": 2400000.0,
            "developer_name": "Darukaa BlueCarbon Alliance",
            "sites": [
                {
                    "name": "Gosaba Tidal Restoration Parcel",
                    "code": "SND-GSB-01",
                    "habitat_type": "Dense Rhizophora Mangrove",
                    "elevation_m": 4.5,
                    "carbon_density_tco2e_per_ha": 260.0,
                    "canopy_cover_pct": 86.5,
                    "species_richness": 178,
                    "soil_organic_carbon_pct": 6.8,
                    "threat_level": "Moderate",
                    "monitoring_status": "Active Satellite Scan",
                    "coordinates": [
                        [88.7850, 22.1450],
                        [88.8350, 22.1480],
                        [88.8420, 22.1120],
                        [88.7910, 22.1050],
                        [88.7850, 22.1450],
                    ],
                },
                {
                    "name": "Matla Estuary Mudflat Buffer",
                    "code": "SND-MTL-02",
                    "habitat_type": "Avicennia Pioneer Mudflat",
                    "elevation_m": 2.8,
                    "carbon_density_tco2e_per_ha": 210.0,
                    "canopy_cover_pct": 74.0,
                    "species_richness": 142,
                    "soil_organic_carbon_pct": 5.4,
                    "threat_level": "Low",
                    "monitoring_status": "Active Satellite Scan",
                    "coordinates": [
                        [88.6650, 22.0550],
                        [88.7120, 22.0620],
                        [88.7250, 22.0280],
                        [88.6750, 22.0190],
                        [88.6650, 22.0550],
                    ],
                },
            ],
        },
        {
            "name": "Amazonian Alto Mayo Primary Rainforest Corridor",
            "slug": "amazonian-alto-mayo-corridor",
            "description": "Community-led indigenous REDD+ and canopy enrichment initiative protecting critical watershed headwaters in the San Martin cloud forest and primary lowland Amazon.",
            "project_type": "Avoided Deforestation (REDD+)",
            "standard": "Plan Vivo",
            "status": "Verified",
            "country": "Peru",
            "region": "San Martín / Rioja",
            "biome": "Tropical Rainforest",
            "estimated_annual_tco2e": 92000.0,
            "target_biodiversity_score": 96.5,
            "budget": 4100000.0,
            "developer_name": "Alto Mayo Conservation Trust",
            "sites": [
                {
                    "name": "Naranjos Ridge Primary Canopy",
                    "code": "AMZ-NRJ-01",
                    "habitat_type": "Montane Cloud Rainforest",
                    "elevation_m": 1150.0,
                    "carbon_density_tco2e_per_ha": 310.0,
                    "canopy_cover_pct": 94.0,
                    "species_richness": 340,
                    "soil_organic_carbon_pct": 7.2,
                    "threat_level": "Moderate",
                    "monitoring_status": "Verified",
                    "coordinates": [
                        [-77.3850, -5.7250],
                        [-77.3150, -5.7180],
                        [-77.3080, -5.7750],
                        [-77.3780, -5.7820],
                        [-77.3850, -5.7250],
                    ],
                },
                {
                    "name": "Mayo River Riparian Buffer",
                    "code": "AMZ-MYO-02",
                    "habitat_type": "Alluvial Lowland Forest",
                    "elevation_m": 820.0,
                    "carbon_density_tco2e_per_ha": 275.0,
                    "canopy_cover_pct": 89.0,
                    "species_richness": 285,
                    "soil_organic_carbon_pct": 5.9,
                    "threat_level": "Low",
                    "monitoring_status": "Active Satellite Scan",
                    "coordinates": [
                        [-77.4450, -5.8450],
                        [-77.3950, -5.8380],
                        [-77.3880, -5.8850],
                        [-77.4420, -5.8920],
                        [-77.4450, -5.8450],
                    ],
                },
            ],
        },
        {
            "name": "Cairngorms Peatland Rewetting & Caledonian Forest",
            "slug": "cairngorms-peatland-rewetting",
            "description": "Large-scale blanket bog restoration, drain blocking, and Scots Pine regeneration in the Scottish Highlands restoring hydrological integrity and deep soil carbon sinks.",
            "project_type": "Peatland Rewetting",
            "standard": "Gold Standard",
            "status": "Active",
            "country": "United Kingdom",
            "region": "Scottish Highlands",
            "biome": "Temperate Peatland",
            "estimated_annual_tco2e": 31500.0,
            "target_biodiversity_score": 88.0,
            "budget": 1850000.0,
            "developer_name": "Highland Peatland Partnership",
            "sites": [
                {
                    "name": "Glen Feshie Heather Mire",
                    "code": "CGM-GF-01",
                    "habitat_type": "Active Blanket Bog",
                    "elevation_m": 420.0,
                    "carbon_density_tco2e_per_ha": 340.0,
                    "canopy_cover_pct": 52.0,
                    "species_richness": 96,
                    "soil_organic_carbon_pct": 14.2,
                    "threat_level": "Low",
                    "monitoring_status": "Active Satellite Scan",
                    "coordinates": [
                        [-3.8850, 57.0650],
                        [-3.8250, 57.0720],
                        [-3.8180, 57.0350],
                        [-3.8780, 57.0280],
                        [-3.8850, 57.0650],
                    ],
                },
            ],
        },
        {
            "name": "Serengeti-Mara Acacia Savanna Wildlife Corridor",
            "slug": "serengeti-mara-savanna-corridor",
            "description": "Restoring continuous indigenous Acacia nilotica woodlands and rotational grazing corridors for migratory megafauna, enhancing above-and-below-ground soil organic carbon stocks.",
            "project_type": "Afforestation / Reforestation",
            "standard": "Verra VCS",
            "status": "Under Validation",
            "country": "Tanzania",
            "region": "Mara Ecosystem",
            "biome": "Savanna Woodland",
            "estimated_annual_tco2e": 28000.0,
            "target_biodiversity_score": 94.0,
            "budget": 1600000.0,
            "developer_name": "East African Ecological Trust",
            "sites": [
                {
                    "name": "Grumeti Basin Corridor Alpha",
                    "code": "SRG-GRM-01",
                    "habitat_type": "Open Acacia Savanna",
                    "elevation_m": 1280.0,
                    "carbon_density_tco2e_per_ha": 145.0,
                    "canopy_cover_pct": 68.0,
                    "species_richness": 215,
                    "soil_organic_carbon_pct": 3.8,
                    "threat_level": "Moderate",
                    "monitoring_status": "Field Survey Pending",
                    "coordinates": [
                        [34.5850, -2.1450],
                        [34.6550, -2.1380],
                        [34.6480, -2.1950],
                        [34.5780, -2.2020],
                        [34.5850, -2.1450],
                    ],
                },
            ],
        },
        {
            "name": "Borneo Katingan Peat Swamp Forest Sanctuary",
            "slug": "borneo-katingan-peat-swamp",
            "description": "Protection of 150,000 hectares of ombrogenous peat swamp forest in Central Kalimantan, protecting 5% of the remaining wild Bornean Orangutans.",
            "project_type": "Avoided Deforestation (REDD+)",
            "standard": "Verra VCS",
            "status": "Verified",
            "country": "Indonesia",
            "region": "Central Kalimantan",
            "biome": "Tropical Peat Swamp",
            "estimated_annual_tco2e": 115000.0,
            "target_biodiversity_score": 98.0,
            "budget": 5200000.0,
            "developer_name": "Rimba Raya Conservation",
            "sites": [
                {
                    "name": "Katingan River Core Sanctuary",
                    "code": "KAT-COR-01",
                    "habitat_type": "Deep Peat Dome Forest",
                    "elevation_m": 18.0,
                    "carbon_density_tco2e_per_ha": 380.0,
                    "canopy_cover_pct": 96.0,
                    "species_richness": 380,
                    "soil_organic_carbon_pct": 18.5,
                    "threat_level": "Low",
                    "monitoring_status": "Verified",
                    "coordinates": [
                        [113.1850, -2.4850],
                        [113.2650, -2.4780],
                        [113.2550, -2.5450],
                        [113.1750, -2.5520],
                        [113.1850, -2.4850],
                    ],
                },
            ],
        },
    ]

    now = datetime.utcnow()

    for p_data in projects_data:
        sites_info = p_data.pop("sites")
        proj = Project(
            **p_data,
            start_date=now - timedelta(days=365 * 2),
            end_date=now + timedelta(days=365 * 18),
            created_by_id=admin_user.id,
        )
        db.add(proj)
        db.commit()
        db.refresh(proj)

        # Add sites
        for s_info in sites_info:
            coords = s_info.pop("coordinates")
            ring = coords
            geom_dict = {"type": "Polygon", "coordinates": [ring]}
            _, computed_ha, c_lat, c_lng = SpatialService.validate_and_parse_geometry(
                geom_dict
            )

            site = Site(
                project_id=proj.id,
                name=s_info["name"],
                code=s_info["code"],
                area_hectares=computed_ha,
                habitat_type=s_info["habitat_type"],
                elevation_m=s_info["elevation_m"],
                centroid_lat=c_lat,
                centroid_lng=c_lng,
                geometry_geojson=json.dumps(geom_dict),
                carbon_density_tco2e_per_ha=s_info["carbon_density_tco2e_per_ha"],
                canopy_cover_pct=s_info["canopy_cover_pct"],
                species_richness=s_info["species_richness"],
                soil_organic_carbon_pct=s_info["soil_organic_carbon_pct"],
                threat_level=s_info["threat_level"],
                monitoring_status=s_info["monitoring_status"],
            )
            db.add(site)
            db.commit()
            db.refresh(site)

            # Generate monthly snapshots for this site
            for m in range(6, 0, -1):
                dt = now - timedelta(days=m * 30)
                snap = AnalyticsSnapshot(
                    project_id=proj.id,
                    site_id=site.id,
                    timestamp=dt,
                    ndvi=round(0.72 + 0.04 * (6 - m) / 6.0, 3),
                    evi=round(0.65 + 0.03 * (6 - m) / 6.0, 3),
                    canopy_cover_pct=round(site.canopy_cover_pct + 0.5 * (6 - m), 1),
                    biomass_density_mg_per_ha=round(
                        site.carbon_density_tco2e_per_ha * 1.3, 1
                    ),
                    cumulative_tco2e=round(
                        site.area_hectares
                        * site.carbon_density_tco2e_per_ha
                        * ((7 - m) / 6.0),
                        1,
                    ),
                    monthly_flux_tco2e=round(site.area_hectares * 2.8, 1),
                    species_observed_count=site.species_richness,
                    soil_moisture_pct=round(34.0, 1),
                )
                db.add(snap)

        # Project Activity Log
        activity = ActivityLog(
            project_id=proj.id,
            user_id=admin_user.id,
            action_type="VERIFY" if proj.status == "Verified" else "CREATE",
            title=f"Initial MRV Audit Completed: {proj.name}",
            description=f"Verified spatial polygon boundaries, baseline carbon flux calculations, and biodiversity metrics under {proj.standard}.",
            timestamp=now - timedelta(days=14),
        )
        db.add(activity)

    # General recent activity
    db.add(
        ActivityLog(
            project_id=1,
            user_id=analyst_user.id,
            action_type="DRAW_SITE",
            title="Satellite NDVI Scan Synchronized",
            description="Sentinel-2 and PlanetScope multispectral reflectance imagery processed for Sundarbans parcels.",
            timestamp=now - timedelta(hours=3),
        )
    )
    db.commit()
    print(
        "[Seed] Environmental projects, PostGIS polygon sites, and telemetry successfully seeded!"
    )
