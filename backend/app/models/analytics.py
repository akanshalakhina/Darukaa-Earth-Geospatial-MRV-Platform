from datetime import datetime
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class AnalyticsSnapshot(Base):
    __tablename__ = "analytics_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    site_id = Column(
        Integer, ForeignKey("sites.id", ondelete="CASCADE"), nullable=True, index=True
    )
    timestamp = Column(DateTime, nullable=False, index=True)

    ndvi = Column(
        Float, default=0.75
    )  # Normalized Difference Vegetation Index (0.0 - 1.0)
    evi = Column(Float, default=0.68)  # Enhanced Vegetation Index
    canopy_cover_pct = Column(Float, default=82.0)
    biomass_density_mg_per_ha = Column(Float, default=210.0)
    cumulative_tco2e = Column(Float, default=10000.0)
    monthly_flux_tco2e = Column(Float, default=350.0)
    species_observed_count = Column(Integer, default=95)
    soil_moisture_pct = Column(Float, default=32.0)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="snapshots")
    site = relationship("Site", back_populates="snapshots")
