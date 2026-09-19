from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.services.project_service import ProjectService
from app.services.auth_service import get_current_user_optional
from app.models.user import User

router = APIRouter()


@router.get("", response_model=List[ProjectResponse])
def list_projects(
    search: Optional[str] = Query(
        None, description="Search term for name, country, biome"
    ),
    project_type: Optional[str] = Query(None, description="Filter by project type"),
    biome: Optional[str] = Query(None, description="Filter by biome"),
    status_filter: Optional[str] = Query(
        None, alias="status", description="Filter by project status"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """Retrieve all projects with optional filtering and search."""
    projects, _ = ProjectService.get_projects(
        db=db,
        search=search,
        project_type=project_type,
        biome=biome,
        status_filter=status_filter,
        skip=skip,
        limit=limit,
    )
    return projects


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Retrieve specific project by ID with computed environmental metrics."""
    return ProjectService.get_by_id(db, project_id)


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Create a new carbon/biodiversity project."""
    user_id = current_user.id if current_user else None
    return ProjectService.create(db, project_in, user_id=user_id)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Update existing project attributes."""
    user_id = current_user.id if current_user else None
    return ProjectService.update(db, project_id, project_in, user_id=user_id)


@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Delete a project and cascade remove attached sites and snapshots."""
    user_id = current_user.id if current_user else None
    return ProjectService.delete(db, project_id, user_id=user_id)
