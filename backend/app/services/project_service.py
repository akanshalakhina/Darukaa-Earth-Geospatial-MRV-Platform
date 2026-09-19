import re
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.project import Project
from app.models.activity import ActivityLog
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse


class ProjectService:
    @staticmethod
    def generate_slug(name: str, db: Session, existing_id: Optional[int] = None) -> str:
        base_slug = re.sub(r"[^\w\s-]", "", name).strip().lower()
        base_slug = re.sub(r"[-\s]+", "-", base_slug)
        slug = base_slug
        counter = 1
        while True:
            query = db.query(Project).filter(Project.slug == slug)
            if existing_id:
                query = query.filter(Project.id != existing_id)
            if not query.first():
                return slug
            slug = f"{base_slug}-{counter}"
            counter += 1

    @staticmethod
    def calculate_project_metrics(project: Project) -> Dict[str, Any]:
        sites = project.sites or []
        total_sites = len(sites)
        total_hectares = sum(s.area_hectares for s in sites)
        total_carbon_stock = sum(
            s.area_hectares * s.carbon_density_tco2e_per_ha for s in sites
        )
        avg_canopy = (
            (sum(s.canopy_cover_pct for s in sites) / total_sites)
            if total_sites > 0
            else 0.0
        )

        return {
            "total_sites": total_sites,
            "total_hectares": round(total_hectares, 2),
            "total_carbon_stock": round(total_carbon_stock, 1),
            "avg_canopy_cover": round(avg_canopy, 1),
        }

    @classmethod
    def get_projects(
        cls,
        db: Session,
        search: Optional[str] = None,
        project_type: Optional[str] = None,
        biome: Optional[str] = None,
        status_filter: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[ProjectResponse], int]:
        query = db.query(Project)

        if search:
            s = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Project.name.ilike(s),
                    Project.country.ilike(s),
                    Project.description.ilike(s),
                    Project.biome.ilike(s),
                    Project.developer_name.ilike(s),
                )
            )

        if project_type:
            query = query.filter(Project.project_type == project_type)

        if biome:
            query = query.filter(Project.biome == biome)

        if status_filter:
            query = query.filter(Project.status == status_filter)

        total = query.count()
        projects = (
            query.order_by(Project.created_at.desc()).offset(skip).limit(limit).all()
        )

        responses = []
        for p in projects:
            metrics = cls.calculate_project_metrics(p)
            resp = ProjectResponse.model_validate(p)
            resp.total_sites = metrics["total_sites"]
            resp.total_hectares = metrics["total_hectares"]
            resp.total_carbon_stock = metrics["total_carbon_stock"]
            resp.avg_canopy_cover = metrics["avg_canopy_cover"]
            responses.append(resp)

        return responses, total

    @classmethod
    def get_by_id(cls, db: Session, project_id: int) -> ProjectResponse:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID {project_id} was not found.",
            )

        metrics = cls.calculate_project_metrics(project)
        resp = ProjectResponse.model_validate(project)
        resp.total_sites = metrics["total_sites"]
        resp.total_hectares = metrics["total_hectares"]
        resp.total_carbon_stock = metrics["total_carbon_stock"]
        resp.avg_canopy_cover = metrics["avg_canopy_cover"]
        return resp

    @classmethod
    def create(
        cls, db: Session, project_in: ProjectCreate, user_id: Optional[int] = None
    ) -> ProjectResponse:
        slug = cls.generate_slug(project_in.name, db)
        project = Project(
            **project_in.model_dump(),
            slug=slug,
            created_by_id=user_id,
        )
        db.add(project)
        db.commit()
        db.refresh(project)

        # Log activity
        activity = ActivityLog(
            project_id=project.id,
            user_id=user_id,
            action_type="CREATE",
            title=f"Project Registered: {project.name}",
            description=f"Registered {project.project_type} project in {project.country} ({project.biome}).",
        )
        db.add(activity)
        db.commit()

        return cls.get_by_id(db, project.id)

    @classmethod
    def update(
        cls,
        db: Session,
        project_id: int,
        project_in: ProjectUpdate,
        user_id: Optional[int] = None,
    ) -> ProjectResponse:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID {project_id} was not found.",
            )

        update_data = project_in.model_dump(exclude_unset=True)
        if "name" in update_data and update_data["name"] != project.name:
            project.slug = cls.generate_slug(
                update_data["name"], db, existing_id=project.id
            )

        for key, value in update_data.items():
            setattr(project, key, value)

        db.commit()
        db.refresh(project)

        # Log activity
        activity = ActivityLog(
            project_id=project.id,
            user_id=user_id,
            action_type="UPDATE",
            title=f"Project Updated: {project.name}",
            description=f"Updated project details: {', '.join(update_data.keys())}.",
        )
        db.add(activity)
        db.commit()

        return cls.get_by_id(db, project.id)

    @classmethod
    def delete(
        cls, db: Session, project_id: int, user_id: Optional[int] = None
    ) -> Dict[str, str]:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID {project_id} was not found.",
            )

        name = project.name
        db.delete(project)
        db.commit()

        return {
            "message": f"Project '{name}' and all associated sites have been deleted."
        }
