from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Site(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(255), nullable=False, index=True)
    code = Column(String(50), nullable=False)
    area_hectares = Column(Float, default=0.0)
    habitat_type = Column(String(100), default="Primary Forest")
    elevation_m = Column(Float, default=50.0)
    centroid_lat = Column(Float, nullable=False)
    centroid_lng = Column(Float, nullable=False)
    geometry_geojson = Column(Text, nullable=False)  # GeoJSON Polygon string

    carbon_density_tco2e_per_ha = Column(Float, default=180.0)
    canopy_cover_pct = Column(Float, default=80.0)
    species_richness = Column(Integer, default=120)
    soil_organic_carbon_pct = Column(Float, default=4.0)
    threat_level = Column(String(50), default="Low")  # Low, Moderate, High, Critical
    monitoring_status = Column(String(100), default="Active Satellite Scan")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="sites")
    snapshots = relationship(
        "AnalyticsSnapshot", back_populates="site", cascade="all, delete-orphan"
    )
