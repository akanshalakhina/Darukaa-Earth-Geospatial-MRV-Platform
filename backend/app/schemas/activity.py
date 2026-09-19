from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ActivityResponse(BaseModel):
    id: int
    project_id: Optional[int] = None
    user_id: Optional[int] = None
    action_type: str
    title: str
    description: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
