from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.projects import router as projects_router
from app.api.v1.sites import router as sites_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.monitoring import router as monitoring_router
from app.api.v1.seed import router as seed_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(projects_router, prefix="/projects", tags=["Projects"])
api_router.include_router(sites_router, prefix="/sites", tags=["Sites & Geospatial"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(
    monitoring_router, prefix="/monitoring", tags=["Satellite Monitoring & Alerts"]
)
api_router.include_router(seed_router, prefix="/seed", tags=["Seed & Demo"])
