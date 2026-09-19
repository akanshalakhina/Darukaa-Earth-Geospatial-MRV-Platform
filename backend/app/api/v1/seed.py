from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.db.seed_data import seed_database

router = APIRouter()


@router.post("/reseed")
def trigger_reseed(db: Session = Depends(get_db)):
    """Reset and reseed database with pristine environmental sample projects and sites."""
    seed_database(db, force=True)
    return {
        "message": "Database has been successfully re-seeded with realistic environmental data."
    }
