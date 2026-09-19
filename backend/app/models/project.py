from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    project_type = Column(
        String(100), nullable=False
    )  # Mangrove Restoration, Reforestation, REDD+, etc.
    standard = Column(
        String(100), default="Verra VCS"
    )  # Verra VCS, Gold Standard, Plan Vivo, etc.
    status = Column(
        String(50), default="Active"
    )  # Draft, Under Validation, Active, Verified, Completed
    country = Column(String(100), nullable=False)
    region = Column(String(150), nullable=True)
    biome = Column(
        String(100), nullable=False
    )  # Tropical Rainforest, Mangrove, Peatland, etc.
    estimated_annual_tco2e = Column(Float, default=0.0)
    target_biodiversity_score = Column(Float, default=85.0)
    budget = Column(Float, default=0.0)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    developer_name = Column(String(255), default="Darukaa Conservation Labs")
    created_by_id = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    creator = relationship("User", back_populates="projects")
    sites = relationship("Site", back_populates="project", cascade="all, delete-orphan")
    snapshots = relationship(
        "AnalyticsSnapshot", back_populates="project", cascade="all, delete-orphan"
    )
    activities = relationship(
        "ActivityLog", back_populates="project", cascade="all, delete-orphan"
    )
