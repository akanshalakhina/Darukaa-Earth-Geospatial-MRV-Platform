from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.settings import settings
from app.core.database import engine, Base, SessionLocal
from app.api.v1 import api_router
from app.db.seed_data import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize database tables and seed if empty."""
    print("[Startup] Initializing database schema...")
    Base.metadata.create_all(bind=engine)

    # Automatically seed sample projects and sites if empty
    db = SessionLocal()
    try:
        seed_database(db, force=False)
    finally:
        db.close()

    yield
    print("[Shutdown] Clean shutdown completed.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Darukaa.Earth Full-Stack Geospatial Data Analytics Platform for Carbon & Biodiversity Monitoring",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for hackathon evaluation and cross-origin dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"An unexpected server error occurred: {str(exc)}"},
    )


# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint for container orchestrators and load balancers."""
    return {
        "status": "healthy",
        "service": "Darukaa.Earth Backend API",
        "version": "1.0.0",
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to Darukaa.Earth Geospatial Data Analytics API",
        "docs": "/docs",
        "api_version": "v1",
    }
